"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

// Define TypeScript interfaces
interface Category {
  id: string;
  name: string;
  color: string;
}

interface IssueFormProps {
  onAddIssue: (title: string, description: string, category: string, reportDate: Date | null, imageUrl?: string) => void;
  categories: Category[];
  initialValues?: {
    title: string;
    description: string;
    category: string;
    reportDate: Date;
    imageUrl?: string;
  };
  isEditing?: boolean;
}

const IssueForm = ({ 
  onAddIssue, 
  categories, 
  initialValues, 
  isEditing = false 
}: IssueFormProps) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [reportDate, setReportDate] = useState<Date | null>(initialValues?.reportDate || new Date());
  const [category, setCategory] = useState<string | null>(initialValues?.category || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.imageUrl || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    
    if (!category) {
      toast.error("Please select a category");
      return;
    }

    try {
      let finalImageUrl = null;
      
      // Use existing image if not changed in edit mode
      if (isEditing && initialValues?.imageUrl && !imageFile) {
        finalImageUrl = initialValues.imageUrl;
      } 
      // Process new image if uploaded
      else if (imageFile) {
        const reader = new FileReader();
        finalImageUrl = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }
      
      // Submit the issue with the image
      onAddIssue(
        title.trim(),
        description.trim(),
        category,
        reportDate,
        finalImageUrl || undefined
      );
      
      // Reset form if not editing
      if (!isEditing) {
        setTitle('');
        setDescription('');
        setReportDate(new Date());
        setCategory(null);
        setImageFile(null);
        setImagePreview(null);
      }
      
      toast.success(isEditing ? "Issue updated successfully" : "Issue reported successfully");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Error uploading image. Please try again.");
    }
  };

  return (
    <form className='border p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 space-y-6' onSubmit={handleSubmit}>
      <div className="space-y-1">
        <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter issue title..."
          className="w-full focus:ring-2 focus:ring-blue-500 transition-shadow border-gray-200 dark:border-gray-700"
          required
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail..."
          className="w-full min-h-[120px] focus:ring-2 focus:ring-blue-500 transition-shadow border-gray-200 dark:border-gray-700"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </Label>
          <Select value={category || undefined} onValueChange={setCategory}>
            <SelectTrigger id="category" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-shadow">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-md z-50">
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full ${cat.color} mr-2`}></span>
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="reportDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Report Date
          </Label>
          <DatePicker
            date={reportDate}
            onDateChange={setReportDate}
            className="w-full border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="image" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Image (Optional)
        </Label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-colors hover:border-blue-400 dark:hover:border-blue-500">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border-0 p-0 focus:ring-0"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Upload an image to help illustrate the issue
          </p>
        </div>
        
        {imagePreview && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 scale-in">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Preview:</p>
            <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <img 
                src={imagePreview}
                alt="Upload preview" 
                className="w-full max-h-60 object-cover"
              />
              <Button 
                type="button" 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full h-8 w-8 p-0 flex items-center justify-center shadow-sm"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors shadow-sm hover:shadow flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isEditing ? (
              <>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </>
            ) : (
              <>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </>
            )}
          </svg>
          {isEditing ? "Update Issue" : "Report Issue"}
        </Button>
      </div>
    </form>
  );
};

export default IssueForm;