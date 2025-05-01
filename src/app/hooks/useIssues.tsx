// hooks/useIssues.ts
import { useState, useEffect } from "react";
import useLocalStorage from "@/lib/use-local-storage";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import { Issue, Comment, DateRange } from "../types";
import { isSameDay } from "date-fns";

const ISSUES_PER_PAGE = 5;

export function useIssues(currentUser: { id: string; name: string; profileImage: string }) {
  // State for issues with localStorage persistence
  const [issues, setIssues] = useLocalStorage<Issue[]>("urban-issues", []);
  const [comments, setComments] = useLocalStorage<Record<string, Comment[]>>("urban-issue-comments", {});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
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
  
  // Get users lookup
  const [users, setUsers] = useLocalStorage("urban-issues-users", [
    {
      id: "user1",
      name: "Demo User",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Muffin",
      age: 28,
      birthday: new Date("1995-06-15"),
      address: "New York, NY",
      showAge: true,
      showBirthday: true,
      showAddress: true,
      isAdmin: true
    }
  ]);
  
  // Convert users array to lookup object
  const usersLookup = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, any>);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

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

  // Check if there are active filters - FIXED: Added dateRange.end to the check
  const hasActiveFilters = !!(selectedCategory || statusFilter || dateRange.start || dateRange.end || reporterFilter);

  // Methods to handle quick filtering
  const handleFilterByDate = (date: Date) => {
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
      reporterImage: currentUser.profileImage,
      status: 'open',
      upvotes: 0,
      commentCount: 0,
      imageUrl
    };

    setIssues(prev => [newIssue, ...prev]);
    setActiveTab("view");
    toast.success("Issue reported successfully!");
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
    toast.success("Issue updated successfully!");
  };

  const handleUpdateStatus = (id: string, status: 'open' | 'in-progress' | 'resolved') => {
    setIssues(prev => 
      prev.map(issue => 
        issue.id === id ? { ...issue, status } : issue
      )
    );
    toast.success(`Issue marked as ${status.replace('-', ' ')}`);
  };

  const handleDeleteIssue = (id: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== id));
    // Also remove comments
    const { [id]: _, ...remainingComments } = comments;
    setComments(remainingComments);
    toast.success("Issue deleted");
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
      toast.success("Upvote removed");
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
      toast.success("Issue upvoted");
    }
  };

  const handleAddComment = (issueId: string, text: string, replyTo?: string) => {
    const newComment: Comment = {
      id: generateId(),
      text,
      author: currentUser.name,
      authorId: currentUser.id,
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

    toast.success("Comment added");
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

    toast.success("Comment deleted");
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

  return {
    issues,
    filteredIssues,
    paginatedIssues,
    reporters,
    comments,
    activeTab,
    setActiveTab,
    editingIssue,
    activeIssueComments,
    userUpvotes: userUpvotes[currentUser.id] || [],
    usersLookup,
    selectedCategory,
    statusFilter,
    dateRange,
    reporterFilter,
    currentPage,
    totalPages,
    hasActiveFilters,
    
    // Methods
    setSelectedCategory,
    setStatusFilter,
    setDateRange,
    setReporterFilter,
    handlePageChange: setCurrentPage,
    handleFilterByDate,
    handleFilterByCategory,
    handleFilterByStatus,
    handleAddIssue,
    handleUpdateIssue,
    handleUpdateStatus,
    handleDeleteIssue,
    handleEditIssue,
    handleUpvote,
    handleAddComment,
    handleLikeComment,
    handleDeleteComment,
    handleViewComments,
    clearAllFilters,
  };
}