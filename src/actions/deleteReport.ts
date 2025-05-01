"use server";

import { db } from "@/db";
import { reports } from "@/db/schema/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth"; 
import { headers } from "next/headers"

export async function deleteReport(reportId: number) {
  const session = await auth.api.getSession({ headers: await headers() })
    
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const report = await db.query.reports.findFirst({
    where: eq(reports.id, reportId),
  });

  if (!report) {
    throw new Error("Report not found");
  }
 
  const isAuthor = report.userId === userId;
  const isAdmin = session.user.role === "admin"; 

  if (!isAuthor && !isAdmin) {
    throw new Error("Forbidden: You cannot delete this report.");
  }

  //
  await db.delete(reports).where(eq(reports.id, reportId));
}
