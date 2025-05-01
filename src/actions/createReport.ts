"use server"

import { db } from "@/db"
import { reports } from "@/db/schema/schema"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { eq, and, not } from "drizzle-orm"

export const createReport = async (data: FormData) => {
  console.log("Create report called!")

  const session = await auth.api.getSession({ headers: await headers() })
  console.log("Session:", session)

  const userId = session?.user?.id
  if (!userId) {
    console.error("User not authenticated")
    throw new Error("Not authenticated")
  }

  const userName = session?.user?.name

  const title = data.get("title")?.toString()
  const description = data.get("description")?.toString()
  const category = data.get("category")?.toString()
  const location = data.get("location")?.toString() || ""

  if (!title || !description || !category) {
    throw new Error("Missing required fields")
  }

  await db.insert(reports).values({
    title,
    description,
    category,
    location,
    userId,
    userName,
    upvotes: 0,
    createdAt: new Date(),
    userUpvoted: [] as string[]
  })
}

export const getReport = async (reportId: number) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user?.id
  if (!userId) throw new Error("Not authenticated")

  // Fetch current upvoted user list
  const [report] = await db
    .select({ title: reports.title, description: reports.description, reportDate: reports.createdAt, category: reports.category })
    .from(reports)
    .where(eq(reports.id, reportId))

  return report
}

export async function editReport(/* */issueId: number, data: FormData) {
  /* YOUR CODE HERE */
  const session = await auth.api.getSession({
      headers: await headers(),
    })
  
    if (!session || !session.user?.id) {
      return null 
    }
  
    const title = data.get("title")?.toString()
    const description = data.get("description")?.toString()
    const category = data.get("category")?.toString()
  
    // Update only if the todo belongs to the authenticated user
    const result = await db
      .update(reports)
      .set({
        title: title,
        description: description,
        category: category,
        createdAt: new Date()
      })
      .where(eq(reports.id, issueId))
      .returning()
  
    // If nothing was returned, either the todo doesn't exist or doesn't belong to the user
    if (result.length === 0) {
      return null
    }
  
    return result[0]
}

