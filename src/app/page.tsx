import IssuePageClient from "@/components/IssuePageClient";
import { db } from "@/db";
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// Types
interface Category {
  id: string;
  name: string;
  color: string;
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

export default async function Home() {
  // Demo categories
  const categories: Category[] = [
    { id: "cat1", name: "Roads", color: "bg-red-500" },
    { id: "cat2", name: "Transit", color: "bg-blue-500" },
    { id: "cat3", name: "Parks", color: "bg-green-500" },
    { id: "cat4", name: "Safety", color: "bg-orange-500" },
    { id: "cat5", name: "Housing", color: "bg-purple-500" },
    { id: "cat6", name: "Other", color: "bg-gray-500" }
  ];
  
  // Fetch data from the database
  const issues: Issue[] = await db.query.reports.findMany();

  // Get unique reporters for filtering
  const reporters = [...new Set(issues.map(issue => issue.userName))].map(id => {
    const issue = issues.find(i => i.userName === id);
    return { id, name: issue?.userName || "Unknown" };
  });

  const session = await auth.api.getSession({ headers: await headers() })

  let userId = session?.user?.id

  if (!userId) {
    userId = "Null"
  }
  let isAdmin = false
  if (session?.user.role) {
    if (session.user.role == "admin") isAdmin = true
  }

  // Pass the data to the client component
  return (
    <IssuePageClient 
      issues={issues}
      categories={categories}
      reporters={reporters}
      currentYear={new Date().getFullYear()}
      currentUserId={userId}
      isAdmin = {isAdmin}
    />
  );
}