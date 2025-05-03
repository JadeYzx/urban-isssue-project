"use server"

import { db } from "@/db"
import { comments } from "@/db/schema/schema"  
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function toggleCommentLike(commentId: number) {  
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user?.id
  if (!userId) throw new Error("Not authenticated")


  const [comment] = await db
    .select({ likedBy: comments.likedBy, likes: comments.likes })  
    .from(comments)  
    .where(eq(comments.id, commentId)) 

  if (!comment) throw new Error("Comment not found")

  const current = comment.likedBy || []
  const hasLiked = current.includes(userId)

  let updatedList: string[]
  let likes = comment.likes || 0  

  if (hasLiked) {
    
    updatedList = current.filter((id) => id !== userId)
    likes -= 1
  } else {
   
    updatedList = [...current, userId]
    likes += 1
  }

 
  await db
    .update(comments)  
    .set({ likedBy: updatedList, likes: likes })  
    .where(eq(comments.id, commentId))  
}