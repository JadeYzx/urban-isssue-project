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

interface IssueListProps {
  issues: Issue[];
  categories: Category[];
  currentUserId?: string;
  isAdmin?: boolean;
  onUpdateStatus: (id: string, status: 'open' | 'in-progress' | 'resolved') => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onUpvote: (id: string) => void;
  onViewComments: (id: string) => void;
  comments?: Record<string, Comment[]>;
  onAddComment?: (issueId: string, text: string, replyTo?: string) => void;
  onLikeComment?: (issueId: string, commentId: string) => void;
  onDeleteComment?: (issueId: string, commentId: string) => void;
  userUpvotes?: string[];
  activeIssueComments?: string | null;
}

const IssueList = ({
  issues,
  categories,
  currentUserId,
  isAdmin = false,
  onUpdateStatus,
  onDelete,
  onEdit,
  onUpvote,
  onViewComments,
  comments = {},
  onAddComment,
  onLikeComment,
  onDeleteComment,
  userUpvotes = [],
  activeIssueComments = null
}: IssueListProps) => {
  // Helper function to get category object from ID
  const getCategoryById = (categoryId: string): Category | null => {
    return categories.find(cat => cat.id === categoryId) || null;
  };

  if (issues.length === 0) {
    return <p className="text-gray-500 text-center p-6">No issues reported yet. Be the first to report an urban issue!</p>;
  }

  return (
    <div className="space-y-6">
      {issues.map((issue) => {
        const issueCategory = getCategoryById(issue.category);
        const canModify = isAdmin || issue.reporterId === currentUserId;
        const hasUpvoted = userUpvotes.includes(issue.id);
        
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
                        <span>{issue.reporterName}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{format(new Date(issue.reportDate), 'MMM d, yyyy')}</span>
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
                      <DropdownMenuItem onClick={() => onEdit(issue.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onUpdateStatus(issue.id, 'open')}>
                            Mark as Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(issue.id, 'in-progress')}>
                            Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(issue.id, 'resolved')}>
                            Mark as Resolved
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(issue.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="py-4">
              <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                {issue.description}
              </p>
              
              {issue.imageUrl && (
                <div className="mt-4 border rounded-lg overflow-hidden shadow-sm">
                  <img 
                    src={issue.imageUrl} 
                    alt={`Image for ${issue.title}`} 
                    className="w-full max-h-80 object-cover"
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="py-2 px-4 bg-gray-50 flex flex-col">
              <div className="flex items-center gap-4 w-full">
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
                        onClick={() => onUpvote(issue.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{issue.upvotes}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-slate-900 border rounded-md shadow-lg">
                      <p>{hasUpvoted ? "Remove upvote" : "Upvote this issue"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                        onClick={() => onViewComments(issue.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{comments[issue.id]?.length || 0}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-slate-900 border rounded-md shadow-lg">
                      <p>View comments</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {activeIssueComments === issue.id && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md w-full scale-in">
                  <h4 className="font-medium mb-2">Comments</h4>
                  
                  {comments[issue.id]?.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {comments[issue.id].map(comment => (
                        <div key={comment.id} className="p-3 bg-white dark:bg-gray-700 rounded shadow-sm">
                          <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span className="font-medium">{comment.author}</span>
                            <span>{format(new Date(comment.date), 'MMM d, yyyy h:mm a')}</span>
                          </div>
                          
                          <p className="mb-2">
                            {comment.replyTo && (
                              <span className="text-blue-500 font-medium">@{comment.replyTo}: </span>
                            )}
                            {comment.text}
                          </p>
                          
                          <div className="flex items-center gap-3 text-xs">
                            <button 
                              className={`flex items-center gap-1 ${
                                comment.likedBy?.includes(currentUserId || '') 
                                  ? "text-blue-600" 
                                  : "text-gray-500 hover:text-blue-600"
                              }`}
                              onClick={() => onLikeComment?.(issue.id, comment.id)}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              <span>{comment.likes || 0}</span>
                            </button>
                            
                            <button 
                              className="text-gray-500 hover:text-blue-600"
                              onClick={() => {
                                const commentInput = document.getElementById(`comment-input-${issue.id}`) as HTMLInputElement;
                                if (commentInput) {
                                  commentInput.value = `@${comment.author}: `;
                                  commentInput.focus();
                                }
                              }}
                            >
                              Reply
                            </button>
                            
                            {(currentUserId === comment.author || isAdmin) && (
                              <button 
                                className="text-red-500 hover:text-red-600 ml-auto"
                                onClick={() => onDeleteComment?.(issue.id, comment.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-4">No comments yet.</p>
                  )}
                  
                  {onAddComment && (
                    <div className="mt-3">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const input = form.elements.namedItem('comment') as HTMLInputElement;
                        if (input.value.trim()) {
                          // Check if it's a reply
                          const replyMatch = input.value.match(/@(\w+):/);
                          const replyTo = replyMatch ? replyMatch[1] : undefined;
                          const commentText = replyMatch 
                            ? input.value.slice(replyMatch[0].length).trim() 
                            : input.value.trim();
                            
                          onAddComment(issue.id, commentText, replyTo);
                          input.value = '';
                        }
                      }}>
                        <div className="flex gap-2">
                          <Input 
                            id={`comment-input-${issue.id}`}
                            name="comment"
                            placeholder="Add a comment..." 
                            className="flex-1"
                          />
                          <Button type="submit">Post</Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default IssueList;