"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { createReport, getReport, editReport } from "@/actions/createReport"
import { useActionState, useTransition } from "react"
import { useRouter } from "next/navigation"

// Define TypeScript interfaces
interface Category {
  id: string;
  name: string;
  color: string;
}

interface IssueFormProps {
  categories: Category[];
  isEditing?: boolean;
  activeTab: string;
  issueId?: number;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}


type FormState = {
  error?: string
  success?: boolean
}

const IssueForm = ({ 
  categories, 
  isEditing = false,
  activeTab,
  issueId,
  setActiveTab 
}: IssueFormProps) => {
  

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [formState, formAction] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      try {
        if (issueId) {
          await editReport(issueId, formData)
        }
        else await createReport(formData)
        setActiveTab("view")
        startTransition(() => router.refresh()) // show latest report in UI
        toast.success("Added report successfully");
        return { success: true }
      } catch {
        toast.success("Failed to add report");
        return { success: false}
      }
    },
    { success: false }
  )
  const [report, setReport] = useState<null | {
    title: string;
    description: string;
    reportDate: Date;
    category: string;
  }>(null);  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reportDate, setReportDate] = useState<Date | null>(new Date());
  const [category, setCategory] = useState<string | null>(null);
  // const [imageFile, setImageFile] = useState<File | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // 3. Use useEffect unconditionally, with the conditional logic inside
  useEffect(() => {
    // Only fetch if issueId exists
    if (issueId) {
      const fetchReport = async () => {
        try {
          const reportData = await getReport(issueId);
          if (reportData) {
            setReport(reportData);
            // Update all form fields with the fetched data
            setTitle(reportData.title || '');
            setDescription(reportData.description || '');
            setReportDate(reportData.reportDate || new Date());
            setCategory(reportData.category || null);
          }
        } catch (err: unknown) {
          console.log("error");
        }
      };
      
      fetchReport();
    }
  }, [issueId]);

  // 4. Return based on conditions
  if (issueId && !report) {
    return <div>Loading report...</div>;
  }
  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     setImageFile(file);
      
  //     // Create preview
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  return (
    <form className="border p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 space-y-6" action={formAction}>
      
      {/* Title */}
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          type="text"
          defaultValue={title ?? ''}
          placeholder="Enter issue title..."
          required
          className="w-full focus:ring-2 focus:ring-blue-500 transition-shadow border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={description ?? ''}
          placeholder="Describe the issue in detail..."
          required
          className="w-full min-h-[120px] focus:ring-2 focus:ring-blue-500 transition-shadow border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* Category and Report Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
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
          {/* Hidden input to submit category */}
          <input type="hidden" name="category" value={category ?? ''} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="reportDate">Report Date</Label>
          {/* Just visually picked date, not sent yet */}
          <DatePicker
            date={reportDate}
            onDateChange={setReportDate}
            className="w-full border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
      </div>

      {/* Image Upload */}
      {/* <div className="space-y-1">
        <Label htmlFor="image">Image (Optional)</Label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-colors hover:border-blue-400 dark:hover:border-blue-500">
          <Input
            id="image"
            name="image"
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
                  setImageFile(null)
                  setImagePreview(null)
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
      </div> */}

      {/* Submit Button */}
      {isPending && (
        <div className="loading-indicator">
          <span>Loading...</span> {/* You can replace this with a spinner or any other indicator */}
        </div>
      )}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors shadow-sm hover:shadow flex items-center gap-2"
        >
          {isEditing ? "Update Issue" : "Report Issue"}
        </Button>
      </div>

      {/* Show Error Message if any */}
      {formState.error && <p className="text-red-500 text-sm">{formState.error}</p>}
    </form>
  );
};

export default IssueForm;