// src/actions/updateReportStatus.ts
"use server"

import { db } from "@/db"
import { reports } from "@/db/schema/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"

type ReportStatus = "open" | "in-progress" | "resolved"

export const updateReportStatus = async (reportId: number, newStatus: ReportStatus) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Not authenticated")

  // Optional: You could check if session.user.role === "admin" if only admins can update

  await db
    .update(reports)
    .set({ status: newStatus })
    .where(eq(reports.id, reportId))
}
