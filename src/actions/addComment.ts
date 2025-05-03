"use server";

import { db } from "@/db";
import { comments } from "@/db/schema/schema"; 
import { auth } from "@/lib/auth";
import { AuthForm } from "@daveyplate/better-auth-ui";
import { headers } from "next/headers";

export async function addComment(issueId: number, text: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    return null;
  }

  const userId = session.user.id;
  const userName = session.user.name || "Anonymous";

  if (!text || text.trim() === "") {
    throw new Error("Comment text cannot be empty");
  }

  // Add the issueId to the comment insertion
  await db.insert(comments).values({
    issueId, // Add this line to include the issueId
    text,
    author: userName,
    authorId: userId,
    date: new Date(),
    likes: 0,
    likedBy: [],
    replyTo: null 
  });

  return { success: true ,
}}
