// types.ts
export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  authorId: string;
  date: Date;
  likes: number;
  likedBy: string[];
  replyTo?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  reportDate: Date;
  reporterId: string;
  reporterName: string;
  reporterImage?: string;
  status: 'open' | 'in-progress' | 'resolved';
  imageUrl?: string;
  upvotes: number;
  commentCount: number;
}

export interface User {
  id: string;
  name: string;
  profileImage: string;
  age?: number;
  birthday?: Date;
  address?: string;
  showAge?: boolean;
  showBirthday?: boolean;
  showAddress?: boolean;
  isAdmin?: boolean;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}