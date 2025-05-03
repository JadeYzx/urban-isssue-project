"use server";

import { db } from "@/db";
import { comments } from "@/db/schema/schema";
import { eq } from "drizzle-orm";

export async function deleteReply(commentId: number) {
  try {
    // Check if comment exists
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Delete the comment directly without permission checks
    await db.delete(comments).where(eq(comments.id, commentId));
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    throw new Error("Failed to delete comment");
  }
}
