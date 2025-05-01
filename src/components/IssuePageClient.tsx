"use client";

import { useState, useEffect } from "react";
import IssueForm from "@/components/IssueForm";
import IssueList from "@/components/IssueList";
import IssueFilter from "@/components/IssueFilter";
import Pagination from "./Pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { X, ArrowUp } from "lucide-react";
import { ThemeToggleClient } from "@/components/ThemeToggleClient";
import { useScrollToTop } from "@/app/hooks/useScrollToTop";
import { Category, User } from "@/app/types";
import { toast } from "sonner";
import { deleteReport } from "@/actions/deleteReport";
import { toggleLike } from "@/actions/toggleLike";
import { updateReportStatus } from "@/actions/updateReportstatus";

const ISSUES_PER_PAGE = 5;

interface Reporter {
  id: string;
  name: string;
}

interface IssuePageClientProps {
  issues: Issue[];
  categories: Category[];
  reporters: Reporter[];
  currentYear: number;
  currentUserId: string;
  isAdmin: boolean
}

interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  createdAt: Date;
  userId: string;
  status: 'open' | 'in-progress' | 'resolved';
  userName: string;
  upvotes: number;
  userUpvoted: String[];
}

export default function IssuePageClient({ 
  issues, 
  categories, 
  reporters,
  currentYear,
  currentUserId,
  isAdmin
}: IssuePageClientProps) {
  const [isClient, setIsClient] = useState(false);
  
  // State for issues and filtering
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
  const [reporterFilter, setReporterFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("view");
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [activeIssueComments, setActiveIssueComments] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [issueId, setIssueId] = useState(-1);

  // Set client-side rendering check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter issues based on all filters
  const filteredIssues = issues.filter(issue => {
    const matchesCategory = !selectedCategory || issue.category === selectedCategory;
    const matchesStatus = !statusFilter || issue.status === statusFilter;
    const matchesReporter = !reporterFilter || issue.userName.toLowerCase().includes(reporterFilter.toLowerCase());
    
    let matchesDateRange = true;
    if (dateRange.start) {
      matchesDateRange = matchesDateRange && new Date(issue.createdAt) >= dateRange.start;
    }
    if (dateRange.end) {
      matchesDateRange = matchesDateRange && new Date(issue.createdAt) <= dateRange.end;
    }
    
    return matchesCategory && matchesStatus && matchesReporter && matchesDateRange;
  });
  
  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / ISSUES_PER_PAGE));
  
  // Ensure current page is within range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  // Get issues for current page
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * ISSUES_PER_PAGE,
    currentPage * ISSUES_PER_PAGE
  );

  // Check if there are active filters
  const hasActiveFilters = !!(selectedCategory || statusFilter || dateRange.start || dateRange.end || reporterFilter);

  // Use the scroll to top hook
  const { showBackToTop, scrollToTop } = useScrollToTop();

  // Methods to handle quick filtering
  const handleFilterByDate = (date: Date) => {
    const isSameDay = (d1: Date, d2: Date) => {
      return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
    };

    if (dateRange.start && isSameDay(dateRange.start, date) && (!dateRange.end || isSameDay(dateRange.end, date))) {
      setDateRange({ start: null, end: null });
      toast.success("Date filter cleared");
    } else {
      setDateRange({ 
        start: new Date(date.setHours(0, 0, 0, 0)), 
        end: new Date(new Date(date).setHours(23, 59, 59, 999)) 
      });
      toast.success(`Filtered to ${date.toLocaleDateString()}`);
    }
    
    if (activeTab !== "view") {
      setActiveTab("view");
    }
    
    setCurrentPage(1);
  };
  
  const handleFilterByCategory = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      toast.success("Category filter cleared");
    } else {
      setSelectedCategory(categoryId);
      toast.success(`Filtered to category`);
    }
    
    if (activeTab !== "view") {
      setActiveTab("view");
    }
    
    setCurrentPage(1);
  };
  
  const handleFilterByStatus = (status: string) => {
    if (statusFilter === status) {
      setStatusFilter(null);
      toast.success("Status filter cleared");
    } else {
      setStatusFilter(status);
      toast.success(`Filtered to ${status.replace('-', ' ')} status`);
    }
    
    if (activeTab !== "view") {
      setActiveTab("view");
    }
    
    setCurrentPage(1);
  };

  // Issue action handlers
  const handleUpdateStatus = async (id: number, status: 'open' | 'in-progress' | 'resolved') => {
    try {
      await updateReportStatus(Number(id), status);
      
      
      toast.success(`Issue marked as ${status.replace('-', ' ')}`);
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleDeleteIssue = async (id: number) => {
    try {
      await deleteReport(Number(id));
      
      toast.success("Issue deleted");
    } catch (error) {
      toast.error("Failed to delete issue");
      console.error(error);
    }
  };

  const handleEditIssue = (id: number) => {
    const issue = issues.find(i => i.id === id);
    if (issue) {
      setEditingIssue(issue);
      setIssueId(Number(id));
      setActiveTab("edit");
    }
  };

  const handleUpvote = async (id: number) => {
    try {
      await toggleLike(Number(id));
      
      // Check if user has already upvoted
      const issue = issues.find(i => i.id === id);
      const userUpvoted = issue?.userUpvoted as string[] || [];
      const hasUpvoted = userUpvoted.includes(currentUserId);
      
      toast.success(hasUpvoted ? "Upvote removed" : "Issue upvoted");
    } catch (error) {
      toast.error("Failed to update upvote");
      console.error(error);
    }
  };

  const handleViewComments = (id: string) => {
    setActiveIssueComments(id === activeIssueComments ? null : id);
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedCategory(null);
    setStatusFilter(null);
    setDateRange({ start: null, end: null });
    setReporterFilter(null);
    setCurrentPage(1);
    toast.success("All filters cleared");
  };

  // If not client-side yet, show loading
  if (!isClient) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header Section */}
        <header className="mb-10 text-center relative fade-in">
          {/* Theme Toggle */}
          <div className="absolute right-0 top-0 transition-transform hover:scale-110">
            <ThemeToggleClient />
          </div>
          
          {/* Logo and Title */}
          <div className="inline-block mb-6 p-3 bg-blue-600 bg-opacity-10 rounded-full transition-all duration-300 hover:bg-opacity-20 hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Urban Issues Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Collaborate with your community to identify, track, and resolve urban issues.
          </p>
        </header>

        {/* Tabs UI */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Header */}
          <TabsList className="grid w-full grid-cols-2 mb-8 h-14 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden gap-1">
            {/* View Tab */}
            <TabsTrigger 
              value="view" 
              className="h-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 hover:bg-white/70 dark:hover:bg-gray-700/70 data-[state=active]:shadow-md data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-lg transition-all duration-200 border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-600 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center gap-2 h-full w-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <span className="font-medium">View Issues</span>
              </div>
            </TabsTrigger>
            
            {/* Report Tab */}
            <TabsTrigger 
              value="report" 
              className="h-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 hover:bg-white/70 dark:hover:bg-gray-700/70 data-[state=active]:shadow-md data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-lg transition-all duration-200 border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-600 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center gap-2 h-full w-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span className="font-medium">Report Issue</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* View Tab Content */}
          <TabsContent value="view" className="space-y-6 fade-in">
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Active filters:</span>
                  
                  {selectedCategory && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300 flex items-center gap-1 transition-colors hover:bg-blue-200 dark:hover:bg-blue-700">
                      Category: {categories.find(c => c.id === selectedCategory)?.name}
                      <X className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform" onClick={() => setSelectedCategory(null)} />
                    </Badge>
                  )}
                  
                  {statusFilter && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300 flex items-center gap-1 transition-colors hover:bg-blue-200 dark:hover:bg-blue-700">
                      Status: {statusFilter.replace('-', ' ')}
                      <X className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform" onClick={() => setStatusFilter(null)} />
                    </Badge>
                  )}
                  
                  {dateRange.start && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300 flex items-center gap-1 transition-colors hover:bg-blue-200 dark:hover:bg-blue-700">
                      From: {dateRange.start.toLocaleDateString()}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform" 
                        onClick={() => setDateRange({ ...dateRange, start: null })} 
                      />
                    </Badge>
                  )}
                  
                  {dateRange.end && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300 flex items-center gap-1 transition-colors hover:bg-blue-200 dark:hover:bg-blue-700">
                      To: {dateRange.end.toLocaleDateString()}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform" 
                        onClick={() => setDateRange({ ...dateRange, end: null })} 
                      />
                    </Badge>
                  )}
                  
                  {reporterFilter && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300 flex items-center gap-1 transition-colors hover:bg-blue-200 dark:hover:bg-blue-700">
                      Reporter: {reporterFilter}
                      <X className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform" onClick={() => setReporterFilter(null)} />
                    </Badge>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="bg-white dark:bg-transparent text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm"
                >
                  Clear All
                </Button>
              </div>
            )}
              
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="md:col-span-1">
                <div className="sticky top-20" style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
                  <Card className="border border-gray-200 shadow-md">
                    <CardContent className="pt-6">
                      <IssueFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        statusFilter={statusFilter}
                        onSelectStatus={setStatusFilter}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        reporterFilter={reporterFilter}
                        onReporterFilterChange={setReporterFilter}
                        reporters={reporters}
                        layout="dropdown"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Issues List Column */}
              <div className="md:col-span-3" id="issues-list">
                {filteredIssues.length > 0 ? (
                  <>
                    {/* Issues Count and Pagination Controls */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-md shadow-sm">
                        <span className="font-medium">{Math.min(filteredIssues.length, (currentPage - 1) * ISSUES_PER_PAGE + 1)}-{Math.min(filteredIssues.length, currentPage * ISSUES_PER_PAGE)}</span> of <span className="font-medium">{filteredIssues.length}</span> issues
                      </div>
                      
                      {/* Page Selector */}
                      {totalPages > 1 && (
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-md shadow-sm">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Page</span>
                          <div className="relative">
                            <select 
                              value={currentPage}
                              onChange={(e) => setCurrentPage(Number(e.target.value))}
                              className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md pl-3 pr-8 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-30 transition-all duration-200"
                            >
                              {Array.from({ length: totalPages }).map((_, i) => (
                                <option key={i} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">of {totalPages}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Issues List Component */}
                    <IssueList
                    issues={filteredIssues}
                    categories={categories}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab}
                    issueId={issueId}
                    setIssueId={setIssueId}
                  />
                    
                    {/* Pagination Component */}
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center">
                    <h3 className="text-xl font-semibold mb-2">No issues found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {hasActiveFilters 
                        ? "Try adjusting your filters or clear them to see all issues." 
                        : "No issues have been reported yet. Be the first to report an issue!"}
                    </p>
                    {hasActiveFilters && (
                      <Button 
                        onClick={clearAllFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:shadow-md hover:scale-105"
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Report Tab Content */}
          <TabsContent value="report">
            <Card className="border border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle>Report a New Issue</CardTitle>
              </CardHeader>
              <CardContent>
                <IssueForm 
                  categories={categories} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Edit Tab Content */}
          <TabsContent value="edit">
            <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 scale-in">
              <CardHeader>
                <CardTitle>Edit Issue</CardTitle>
              </CardHeader>
              <CardContent>
              <IssueForm categories={categories} issueId={issueId} activeTab={activeTab} setActiveTab={setActiveTab}></IssueForm>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>© {new Date().getFullYear()} Urban Issues Tracker. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 hover:-translate-y-1"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      
      <Toaster />
    </div>
  );
}


