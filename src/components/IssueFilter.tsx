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
import { Filter, X } from "lucide-react";

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
  
  // Reset all filters
  const handleResetFilters = () => {
    onSelectCategory(null);
    onSelectStatus(null);
    onDateRangeChange({ start: null, end: null });
    onReporterFilterChange(null);
    setReporterSearchQuery('');
  };

  // Status options
  const statuses = [
    { id: "open", name: "Open", color: "bg-yellow-500" },
    { id: "in-progress", name: "In Progress", color: "bg-blue-500" },
    { id: "resolved", name: "Resolved", color: "bg-green-500" }
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md rounded-xl overflow-hidden">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>Filters</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-5 space-y-5">
        {/* Category Filter */}
        <div>
          <Label 
            className="text-lg font-medium mb-2 block transition-colors hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            htmlFor="category-filter"
          >
            Filter by Category
          </Label>
          
          {layout === "tabs" ? (
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-md p-1" id="category-filter">
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => onSelectCategory(null)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                    !selectedCategory
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  All
                </button>
                
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => onSelectCategory(category.id)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 flex items-center ${
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${category.color} mr-1.5 relative inline-block`}>
                      <span className="absolute inset-0 rounded-full animate-ping opacity-75" 
                        style={{backgroundColor: 'currentColor'}}></span>
                    </span>
                    <span className="truncate">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Select 
              value={selectedCategory || "all"} 
              onValueChange={(value: string) => onSelectCategory(value === "all" ? null : value)}
            >
              <SelectTrigger 
                id="category-filter"
                className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-md transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
              >
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-md z-50 animate-in fade-in-80 zoom-in-95">
                <SelectItem 
                  value="all"
                  className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  All categories
                </SelectItem>
                {categories.map(category => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full ${category.color} mr-1.5 relative`}>
                        <span className="absolute inset-0 rounded-full animate-ping opacity-75" 
                          style={{backgroundColor: 'currentColor'}}></span>
                      </span>
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
          <Label 
            className="text-lg font-medium mb-2 block transition-colors hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            htmlFor="status-filter"
          >
            Filter by Status
          </Label>
          
          {layout === "tabs" ? (
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-md p-1" id="status-filter">
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => onSelectStatus(null)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                    !statusFilter
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  All
                </button>
                
                {statuses.map(status => (
                  <button
                    key={status.id}
                    onClick={() => onSelectStatus(status.id)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 flex items-center ${
                      statusFilter === status.id
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${status.color} mr-1.5`}></span>
                    <span className="truncate">{status.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Select 
              value={statusFilter || "all"} 
              onValueChange={(value: string) => onSelectStatus(value === "all" ? null : value)}
            >
              <SelectTrigger 
                id="status-filter"
                className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-md transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-md z-50 animate-in fade-in-80 zoom-in-95">
                <SelectItem 
                  value="all"
                  className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  All statuses
                </SelectItem>
                {statuses.map(status => (
                  <SelectItem 
                    key={status.id} 
                    value={status.id}
                    className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                  >
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
          <Label 
            className="text-lg font-medium mb-2 block transition-colors hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
          >
            Filter by Date
          </Label>
          <div className="space-y-2">
            <DatePicker
              date={dateRange.start}
              onDateChange={(date) => onDateRangeChange({ ...dateRange, start: date })}
              placeholder="Start date"
              label="From"
              className="w-full transition-all hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm border-gray-200 dark:border-gray-700 rounded-md"
            />
            <DatePicker
              date={dateRange.end}
              onDateChange={(date) => onDateRangeChange({ ...dateRange, end: date })}
              placeholder="End date"
              label="To"
              className="w-full transition-all hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm border-gray-200 dark:border-gray-700 rounded-md"
            />
          </div>
        </div>

        {/* Reporter Filter */}
        <div>
          <Label 
            className="text-lg font-medium mb-2 block transition-colors hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            htmlFor="reporter-search"
          >
            Filter by Reporter
          </Label>
          <div className="relative">
            <Input
              id="reporter-search"
              type="text"
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
              className="w-full h-10 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
            />
            
            {isReporterDropdownOpen && reporterSearchQuery.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border rounded-md shadow-lg max-h-60 overflow-y-auto fade-in">
                {uniqueReporters
                  .filter(name => name.toLowerCase().startsWith(reporterSearchQuery.toLowerCase()))
                  .map(name => (
                    <div 
                      key={name}
                      className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-200 hover:pl-4"
                      onClick={() => {
                        setReporterSearchQuery(name);
                        onReporterFilterChange(name.toLowerCase());
                        setIsReporterDropdownOpen(false);
                      }}
                    >
                      {name}
                    </div>
                  ))}
                
                {uniqueReporters.filter(name => 
                  name.toLowerCase().startsWith(reporterSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="px-3 py-2 text-gray-500 dark:text-gray-400 italic">
                    No reporters found starting with "{reporterSearchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reset Filters */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm bg-white dark:bg-transparent border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 group" 
            onClick={handleResetFilters}
          >
            <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span>Reset All Filters</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueFilter;