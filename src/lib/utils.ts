import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for conditional class name merging with Tailwind
 * @param inputs - Class values to be merged
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date with various options
 * @param date - Date to format
 * @param options - Format options
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | null, options: Intl.DateTimeFormatOptions = {}): string {
  if (!date) return '';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString(undefined, defaultOptions);
}

/**
 * Truncate a string to a specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string
 */
export function truncateText(str: string, length: number = 100): string {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length).trim()}...`;
}

/**
 * Generate a random ID
 * @returns Random ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Get status color based on issue status
 * @param status - Issue status
 * @returns Tailwind color class
 */
export function getStatusColor(status: 'open' | 'in-progress' | 'resolved'): string {
  switch (status) {
    case 'open':
      return 'bg-yellow-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'resolved':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}