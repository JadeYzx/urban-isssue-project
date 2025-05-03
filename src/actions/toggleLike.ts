"use server"

import { db } from "@/db"
import { reports } from "@/db/schema/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function toggleLike(reportId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user?.id
  if (!userId) throw new Error("Not authenticated")

  // Fetch current upvoted user list
  const [report] = await db
    .select({ upvoted: reports.userUpvoted, upvotes: reports.upvotes })
    .from(reports)
    .where(eq(reports.id, reportId))

  if (!report) throw new Error("Report not found")

  const current = report.upvoted || []
  const hasLiked = current.includes(userId)

  let updatedList: string[]
  let likes = report.upvotes

  if (hasLiked) {
    // Remove the userId from the list
    updatedList = current.filter((id) => id !== userId)
    likes -= 1
  } else {
    // Add the userId to the list
    updatedList = [...current, userId]
    likes += 1
  }

  const updated = hasLiked
    ? current.filter((id) => id !== userId)
    : [...current, userId];

  // Save back to DB
  await db
    .update(reports)
    .set({ userUpvoted: updated, upvotes: likes })
    .where(eq(reports.id, reportId))
}