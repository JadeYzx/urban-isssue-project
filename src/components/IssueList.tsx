"use client"

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { MoreHorizontal, X, MessageCircle, ThumbsUp, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toggleLike } from '@/actions/toggleLike'
import { updateReportStatus } from '@/actions/updateReportstatus'
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Toaster } from "sonner";
import { deleteReport } from "@/actions/deleteReport";
import { toast } from "sonner";

// Define TypeScript interfaces
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

interface IssueListProps {
  issues: Issue[];
  categories: Category[];
  currentUserId?: string;
  isAdmin?: boolean;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  issueId: number;
  setIssueId: React.Dispatch<React.SetStateAction<number>>;
}

const IssueList = ({
  issues,
  categories,
  currentUserId,
  isAdmin,
  activeTab,
  setActiveTab,
  issueId,
  setIssueId
}: IssueListProps) => {
  let sign = true;
  if (currentUserId == "Null") sign = false;
  const [signedin, setSignedin] = useState(sign);
  const [isPending, startTransition] = useTransition()
  // Helper function to get category object from ID
  const getCategoryById = (categoryId: string): Category | null => {
    return categories.find(cat => cat.id === categoryId) || null;
  };
  const router = useRouter()

  if (issues.length === 0) {
    return <p className="text-gray-500 text-center p-6">No issues reported yet. Be the first to report an urban issue!</p>;
  }

const handleClick = async (issueId: number) => {
  startTransition(() => {
    toggleLike(issueId);
    router.refresh();
  });
};

  const handleEdit = (id : number) => {
    setActiveTab("edit");
    setIssueId(id)
  }

  const handleStatus = (id : number, status : 'open' | 'in-progress' | 'resolved') => {
    startTransition(() => {
      updateReportStatus(id, status)
      router.refresh();
    });
  }

  //delete issue function
  const handleDelete = (issueId: number) => {
    try {
      startTransition(() => {
        deleteReport(issueId); 
        router.refresh();
      });
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {issues.map((issue) => {
        const issueCategory = getCategoryById(issue.category);
        const canModify = isAdmin || issue.userId === currentUserId;
        let hasUpvoted = false;
        if (currentUserId) hasUpvoted=issue.userUpvoted.includes(currentUserId);
        
        return (
          <Card 
            key={issue.id} 
            className="overflow-hidden transition-all hover:shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl fade-in hover-lift"
          >
            <CardHeader className="pb-3 pt-6 px-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{issue.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>{issue.userName}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{format(new Date(issue.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      
                      {issueCategory && (
                        <Badge 
                          variant="outline" 
                          className="rounded-full px-3 py-1 border-0 bg-opacity-10"
                          style={{
                            backgroundColor: `${issueCategory.color.replace('bg-', '')}20`,
                            color: issueCategory.color.replace('bg-', 'text-')
                          }}
                        >
                          <span className={`w-2 h-2 rounded-full ${issueCategory.color} mr-1.5`}></span>
                          {issueCategory.name}
                        </Badge>
                      )}
                      
                      <Badge 
                        className={`
                          font-medium rounded-full px-3 py-1
                          ${issue.status === 'open' 
                            ? 'bg-yellow-500 text-black' : 
                          issue.status === 'in-progress' 
                            ? 'bg-blue-600 text-white' : 
                          'bg-green-600 text-white'}
                        `}
                      >
                        {issue.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {canModify && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border rounded-md shadow-lg z-50 min-w-[8rem] overflow-hidden animate-in fade-in-80 p-1">
                      <DropdownMenuItem onClick={() => handleEdit(issue.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(issue.id)}
                      > 
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatus(issue.id, "open")} >
                            Mark as Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatus(issue.id, "in-progress")} >
                            Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatus(issue.id, "resolved")} >
                            Mark as Resolved
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="py-4">
              <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                {issue.description}
              </p>
              
              
            </CardContent>
            
            <CardFooter className="py-2 px-4 bg-gray-50 flex flex-col">
              <div className="flex items-center gap-4 w-full">
              {signedin && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`flex items-center gap-1 ${
                          hasUpvoted 
                            ? "text-blue-600" 
                            : "text-gray-500 hover:text-blue-600"
                        }`}
                        onClick={() => handleClick(issue.id)}
                        disabled={isPending}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{issue.upvotes}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-slate-900 border rounded-md shadow-lg">
                      <p>{hasUpvoted ? "Remove upvote" : "Upvote this issue"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>)}
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-slate-900 border rounded-md shadow-lg">
                      <p>View comments</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default IssueList;