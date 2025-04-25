// src/actions/createReport.ts
"use server"

import { db } from "@/db"
import { reports } from "@/db/schema/schema"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export const createReport = async (data: FormData) => {
  const session = await auth.api.getSession({
    headers: await headers(),  // Pass the headers for the session
  });
  const userId = session?.user?.id
  if (!userId) throw new Error("Not authenticated")

  await db.insert(reports).values({
    title: data.get("title") as string,
    description: data.get("description") as string,
    category: data.get("category") as string,
    location: data.get("location") as string,
    userId,
  })
}
