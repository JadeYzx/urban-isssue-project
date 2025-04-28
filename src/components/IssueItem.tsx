import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define TypeScript interfaces
interface Category {
  id: string;
  name: string;
  color: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  reportDate: Date;
  imageUrl?: string;
  reporterId: string;
  reporterName: string;
  status: 'open' | 'in-progress' | 'resolved';
}

interface IssueItemProps {
  issue: Issue;
  categories: Category[];
  currentUserId?: string;
  isAdmin?: boolean;
  onUpdateStatus: (id: string, status: 'open' | 'in-progress' | 'resolved') => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const IssueItem = ({ 
  issue, 
  categories, 
  currentUserId, 
  isAdmin = false,
  onUpdateStatus, 
  onDelete,
  onEdit
}: IssueItemProps) => {
  // Find the category object that matches the issue's category ID
  const category = categories.find(cat => cat.id === issue.category);
  
  // Check if the current user is the reporter or an admin
  const canModify = isAdmin || issue.reporterId === currentUserId;
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="bg-slate-50 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{issue.title}</h3>
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <span>Reported by: {issue.reporterName}</span>
              <span>•</span>
              <span>{format(new Date(issue.reportDate), 'MMM d, yyyy')}</span>
            </div>
          </div>
          
          <Badge 
            className={`
              ${issue.status === 'open' ? 'bg-yellow-500 text-black font-medium' : 
                issue.status === 'in-progress' ? 'bg-blue-500 text-white font-medium' : 
                'bg-green-500 text-white font-medium'
              }
            `}
          >
            {issue.status.replace('-', ' ')}
          </Badge>
        </div>
        
        {category && (
          <Badge 
            variant="outline" 
            className={`mt-2 border-gray-300`}
          >
            <span className={`w-2 h-2 rounded-full ${category.color} mr-1.5`}></span>
            {category.name}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="py-4">
        <p className="text-gray-700">{issue.description}</p>
        
        {issue.imageUrl && (
          <div className="mt-4">
            <img 
              src={issue.imageUrl} 
              alt={`Image for ${issue.title}`} 
              className="rounded-md max-h-48 object-cover"
            />
          </div>
        )}
      </CardContent>
      
      {canModify && (
        <CardFooter className="bg-slate-50 flex justify-end space-x-2 py-2">
          {isAdmin && (
            <div className="flex-1">
              <Select 
                value={issue.status} 
                onValueChange={(value: string) => 
                  onUpdateStatus(issue.id, value as 'open' | 'in-progress' | 'resolved')
                }
              >
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(issue.id)}
          >
            Edit
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(issue.id)}
          >
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default IssueItem;