"use client";

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Reporter {
  id: string;
  name: string;
}

interface IssueFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  statusFilter: string | null;
  onSelectStatus: (status: string | null) => void;
  dateRange: { start: Date | null, end: Date | null };
  onDateRangeChange: (range: { start: Date | null, end: Date | null }) => void;
  reporterFilter: string | null;
  onReporterFilterChange: (reporter: string | null) => void;
  reporters: Reporter[];
  layout?: "tabs" | "dropdown";
}

const IssueFilter = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  statusFilter,
  onSelectStatus,
  dateRange,
  onDateRangeChange,
  reporterFilter,
  onReporterFilterChange,
  reporters,
  layout = "tabs"
}: IssueFilterProps) => {
  // State for reporter search
  const [reporterSearchQuery, setReporterSearchQuery] = useState('');
  const [isReporterDropdownOpen, setIsReporterDropdownOpen] = useState(false);
  
  // Get unique reporters from issues
  const uniqueReporters = reporters.map(reporter => reporter.name);
  const filteredReporters = uniqueReporters.filter(name => 
    name.toLowerCase().includes(reporterSearchQuery.toLowerCase())
  );
  
  // Status options
  const statuses = [
    { id: "open", name: "Open", color: "bg-yellow-500" },
    { id: "in-progress", name: "In Progress", color: "bg-blue-500" },
    { id: "resolved", name: "Resolved", color: "bg-green-500" }
  ];

  // Reset all filters
  const handleResetFilters = () => {
    onSelectCategory(null);
    onSelectStatus(null);
    onDateRangeChange({ start: null, end: null });
    onReporterFilterChange(null);
    setReporterSearchQuery('');
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filters
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-5 space-y-5">
        {/* Category Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Filter by Category</Label>
          
          {layout === "tabs" ? (
            <Tabs 
              defaultValue={selectedCategory || "all"} 
              onValueChange={(value: string) => onSelectCategory(value === "all" ? null : value)}
              className="w-full"
            >
              <TabsList className="w-full h-auto flex flex-wrap p-1 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger 
                  value="all" 
                  className="flex-1 py-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                >
                  All
                </TabsTrigger>
                
                {categories.map(category => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id} 
                    className="flex-1 py-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                  >
                    <span className={`w-3 h-3 rounded-full ${category.color} mr-1.5`}></span>
                    <span className="truncate">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : (
            <Select 
              value={selectedCategory || "all"} 
              onValueChange={(value: string) => onSelectCategory(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-md">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-md z-50">
                <SelectItem value="all">All categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full ${category.color} mr-1.5`}></span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {/* Status Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Filter by Status</Label>
          
          {layout === "tabs" ? (
            <Tabs 
              defaultValue={statusFilter || "all"} 
              onValueChange={(value: string) => onSelectStatus(value === "all" ? null : value)}
              className="w-full"
            >
              <TabsList className="w-full h-auto p-1 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger 
                  value="all" 
                  className="flex-1 py-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                >
                  All
                </TabsTrigger>
                
                {statuses.map(status => (
                  <TabsTrigger 
                    key={status.id} 
                    value={status.id} 
                    className="flex-1 py-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                  >
                    <span className={`w-2 h-2 rounded-full ${status.color} mr-1.5`}></span>
                    <span className="truncate">{status.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : (
            <Select 
              value={statusFilter || "all"} 
              onValueChange={(value: string) => onSelectStatus(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-md">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-md z-50">
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status.id} value={status.id}>
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full ${status.color} mr-1.5`}></span>
                      {status.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Date Range Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Filter by Date</Label>
          <div className="space-y-2">
            <DatePicker
              date={dateRange.start}
              onDateChange={(date) => onDateRangeChange({ ...dateRange, start: date })}
              placeholder="Start date"
              label="From"
              className="w-full border-gray-200 dark:border-gray-700 rounded-md"
            />
            <DatePicker
              date={dateRange.end}
              onDateChange={(date) => onDateRangeChange({ ...dateRange, end: date })}
              placeholder="End date"
              label="To"
              className="w-full border-gray-200 dark:border-gray-700 rounded-md"
            />
          </div>
        </div>

        {/* Reporter Filter - Enhanced with dropdown */}
        <div>
          <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Filter by Reporter</Label>
          <div className="relative">
            <Input
              type="search"
              placeholder="Search reporters..."
              value={reporterSearchQuery}
              onChange={(e) => {
                setReporterSearchQuery(e.target.value);
                setIsReporterDropdownOpen(e.target.value.length > 0);
                // Update the filter in the parent component
                const query = e.target.value.trim().toLowerCase();
                onReporterFilterChange(query ? query : null);
              }}
              onFocus={() => setIsReporterDropdownOpen(reporterSearchQuery.length > 0)}
              className="w-full border-gray-200 dark:border-gray-700 rounded-md"
            />
            
            {isReporterDropdownOpen && filteredReporters.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border rounded-md shadow-lg max-h-60 overflow-y-auto fade-in">
                {filteredReporters.map(name => (
                  <div 
                    key={name}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      setReporterSearchQuery(name);
                      onReporterFilterChange(name.toLowerCase());
                      setIsReporterDropdownOpen(false);
                    }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reset Filters */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2" 
            onClick={handleResetFilters}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0z"></path>
              <path d="m4.93 4.93 14.14 14.14"></path>
            </svg>
            Reset All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueFilter;