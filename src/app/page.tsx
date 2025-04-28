"use client";

import { useState, useEffect } from "react";
import IssueForm from "@/components/IssueForm";
import IssueList from "@/components/IssueList";
import IssueFilter from "@/components/IssueFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useLocalStorage from "@/lib/use-local-storage";
import { generateId } from "@/lib/utils";
import { Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Types
interface Category {
  id: string;
  name: string;
  color: string;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  date: Date;
  likes: number;
  likedBy: string[];
  replyTo?: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  reportDate: Date;
  reporterId: string;
  reporterName: string;
  status: 'open' | 'in-progress' | 'resolved';
  imageUrl?: string;
  upvotes: number;
  commentCount: number;
}

export default function Home() {
  // Client-side rendering check
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Demo user for testing - in production would come from auth
  const currentUser = {
    id: "user1",
    name: "Demo User",
    isAdmin: true
  };

  // Demo categories
  const [categories] = useState<Category[]>([
    { id: "cat1", name: "Roads", color: "bg-red-500" },
    { id: "cat2", name: "Transit", color: "bg-blue-500" },
    { id: "cat3", name: "Parks", color: "bg-green-500" },
    { id: "cat4", name: "Safety", color: "bg-orange-500" },
    { id: "cat5", name: "Housing", color: "bg-purple-500" },
    { id: "cat6", name: "Other", color: "bg-gray-500" }
  ]);

  // State for issues with localStorage persistence
  const [issues, setIssues] = useLocalStorage<Issue[]>("urban-issues", []);
  const [comments, setComments] = useLocalStorage<Record<string, Comment[]>>("urban-issue-comments", {});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
  const [reporterFilter, setReporterFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("view");
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [activeIssueComments, setActiveIssueComments] = useState<string | null>(null);
  const [userUpvotes, setUserUpvotes] = useLocalStorage<Record<string, string[]>>(
    "urban-issue-user-upvotes", 
    { [currentUser.id]: [] }
  );
  const [commentLikes, setCommentLikes] = useLocalStorage<Record<string, Record<string, string[]>>>(
    "urban-issue-comment-likes",
    {}
  );

  // Get unique reporters for filtering
  const reporters = [...new Set(issues.map(issue => issue.reporterId))].map(id => {
    const issue = issues.find(i => i.reporterId === id);
    return { id, name: issue?.reporterName || "Unknown" };
  });

  // Filter issues based on all filters
  const filteredIssues = issues.filter(issue => {
    const matchesCategory = !selectedCategory || issue.category === selectedCategory;
    const matchesStatus = !statusFilter || issue.status === statusFilter;
    const matchesReporter = !reporterFilter || issue.reporterName.toLowerCase().includes(reporterFilter.toLowerCase());
    
    let matchesDateRange = true;
    if (dateRange.start) {
      matchesDateRange = matchesDateRange && new Date(issue.reportDate) >= dateRange.start;
    }
    if (dateRange.end) {
      matchesDateRange = matchesDateRange && new Date(issue.reportDate) <= dateRange.end;
    }
    
    return matchesCategory && matchesStatus && matchesReporter && matchesDateRange;
  });

  // Issue handlers
  const handleAddIssue = (
    title: string,
    description: string,
    category: string,
    reportDate: Date | null,
    imageUrl?: string
  ) => {
    const newIssue: Issue = {
      id: generateId(),
      title,
      description,
      category,
      reportDate: reportDate || new Date(),
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      status: 'open',
      upvotes: 0,
      commentCount: 0,
      imageUrl
    };

    setIssues(prev => [newIssue, ...prev]);
    setActiveTab("view"); // Switch to viewing issues after submission
  };

  const handleUpdateIssue = (
    id: string,
    title: string, 
    description: string, 
    category: string, 
    reportDate: Date | null,
    imageUrl?: string
  ) => {
    setIssues(prev => 
      prev.map(issue => 
        issue.id === id 
          ? { 
              ...issue, 
              title, 
              description, 
              category, 
              reportDate: reportDate || issue.reportDate,
              imageUrl: imageUrl || issue.imageUrl
            } 
          : issue
      )
    );
    setEditingIssue(null);
    setActiveTab("view");
  };

  const handleUpdateStatus = (id: string, status: 'open' | 'in-progress' | 'resolved') => {
    setIssues(prev => 
      prev.map(issue => 
        issue.id === id ? { ...issue, status } : issue
      )
    );
  };

  const handleDeleteIssue = (id: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== id));
    // Also remove comments
    const { [id]: _, ...remainingComments } = comments;
    setComments(remainingComments);
  };

  const handleEditIssue = (id: string) => {
    const issue = issues.find(i => i.id === id);
    if (issue) {
      setEditingIssue(issue);
      setActiveTab("edit");
    }
  };

  const handleUpvote = (id: string) => {
    const userUpvoteList = userUpvotes[currentUser.id] || [];
    const hasUpvoted = userUpvoteList.includes(id);
    
    if (hasUpvoted) {
      // Remove upvote
      setUserUpvotes({
        ...userUpvotes,
        [currentUser.id]: userUpvoteList.filter(issueId => issueId !== id)
      });
      
      setIssues(prev => 
        prev.map(issue => 
          issue.id === id ? { ...issue, upvotes: Math.max(0, issue.upvotes - 1) } : issue
        )
      );
    } else {
      // Add upvote
      setUserUpvotes({
        ...userUpvotes,
        [currentUser.id]: [...userUpvoteList, id]
      });
      
      setIssues(prev => 
        prev.map(issue => 
          issue.id === id ? { ...issue, upvotes: issue.upvotes + 1 } : issue
        )
      );
    }
  };

  const handleAddComment = (issueId: string, text: string, replyTo?: string) => {
    const newComment: Comment = {
      id: generateId(),
      text,
      author: currentUser.name,
      date: new Date(),
      likes: 0,
      likedBy: [],
      replyTo
    };
    
    setComments((prev) => {
      const prevComments = prev[issueId] || [];
      return {
        ...prev,
        [issueId]: [...prevComments, newComment]
      };
    });
    
    // Update comment count
    setIssues(prev => 
      prev.map(issue => 
        issue.id === issueId 
          ? { ...issue, commentCount: issue.commentCount + 1 } 
          : issue
      )
    );
  };

  const handleLikeComment = (issueId: string, commentId: string) => {
    // Initialize if needed
    if (!commentLikes[issueId]) {
      commentLikes[issueId] = {};
    }
    if (!commentLikes[issueId][commentId]) {
      commentLikes[issueId][commentId] = [];
    }
    
    const hasLiked = commentLikes[issueId][commentId].includes(currentUser.id);
    
    setComments(prev => {
      const updatedComments = prev[issueId]?.map(comment => {
        if (comment.id === commentId) {
          // Toggle like status
          let updatedLikedBy = [...(comment.likedBy || [])];
          let likesCount = comment.likes || 0;
          
          if (hasLiked) {
            // Remove like
            updatedLikedBy = updatedLikedBy.filter(id => id !== currentUser.id);
            likesCount = Math.max(0, likesCount - 1);
          } else {
            // Add like
            updatedLikedBy.push(currentUser.id);
            likesCount++;
          }
          
          return {
            ...comment,
            likes: likesCount,
            likedBy: updatedLikedBy
          };
        }
        return comment;
      }) || [];
      
      return {
        ...prev,
        [issueId]: updatedComments
      };
    });
    
    // Update comment likes storage
    setCommentLikes(prev => {
      const issueComments = {...(prev[issueId] || {})};
      
      if (hasLiked) {
        // Remove like
        issueComments[commentId] = issueComments[commentId].filter(id => id !== currentUser.id);
      } else {
        // Add like
        issueComments[commentId] = [...(issueComments[commentId] || []), currentUser.id];
      }
      
      return {
        ...prev,
        [issueId]: issueComments
      };
    });
  };

  const handleDeleteComment = (issueId: string, commentId: string) => {
    setComments(prev => {
      const updatedComments = prev[issueId]?.filter(comment => comment.id !== commentId) || [];
      return {
        ...prev,
        [issueId]: updatedComments
      };
    });
    
    // Update comment count
    setIssues(prev => 
      prev.map(issue => 
        issue.id === issueId 
          ? { ...issue, commentCount: Math.max(0, issue.commentCount - 1) } 
          : issue
      )
    );
    
    // Clean up comment likes
    if (commentLikes[issueId] && commentLikes[issueId][commentId]) {
      setCommentLikes(prev => {
        const { [commentId]: _, ...remainingLikes } = prev[issueId];
        return {
          ...prev,
          [issueId]: remainingLikes
        };
      });
    }
  };

  const handleViewComments = (id: string) => {
    // Toggle comments visibility
    setActiveIssueComments(id === activeIssueComments ? null : id);
  };

  // If not client-side yet, show loading
  if (!isClient) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <header className="mb-10 text-center fade-in">
          <div className="inline-block mb-6 p-3 bg-blue-600 bg-opacity-10 rounded-full">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg shadow-md">
            <TabsTrigger 
              value="view" 
              className="py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all font-medium"
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                View Issues
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              className="py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all font-medium"
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Report Issue
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-6 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 scale-in">
                  <CardHeader>
                    <CardTitle>Filters</CardTitle>
                  </CardHeader>
                  <CardContent>
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

              <div className="md:col-span-3">
                <IssueList
                  issues={filteredIssues}
                  categories={categories}
                  currentUserId={currentUser.id}
                  isAdmin={currentUser.isAdmin}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteIssue}
                  onEdit={handleEditIssue}
                  onUpvote={handleUpvote}
                  onViewComments={handleViewComments}
                  activeIssueComments={activeIssueComments}
                  comments={comments}
                  onAddComment={handleAddComment}
                  onLikeComment={handleLikeComment}
                  onDeleteComment={handleDeleteComment}
                  userUpvotes={userUpvotes[currentUser.id] || []}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="report">
            <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 scale-in">
              <CardHeader>
                <CardTitle>Report a New Issue</CardTitle>
              </CardHeader>
              <CardContent>
                <IssueForm onAddIssue={handleAddIssue} categories={categories} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="edit">
            <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 scale-in">
              <CardHeader>
                <CardTitle>Edit Issue</CardTitle>
              </CardHeader>
              <CardContent>
                {editingIssue && (
                  <IssueForm 
                    onAddIssue={(title, description, category, reportDate, imageUrl) => 
                      handleUpdateIssue(editingIssue.id, title, description, category, reportDate, imageUrl)
                    } 
                    categories={categories}
                    initialValues={editingIssue}
                    isEditing={true}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <footer className="mt-16 py-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>© {new Date().getFullYear()} Urban Issues Tracker. All rights reserved.</p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}