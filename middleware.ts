
import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    /* Implement a redirecting middleware YOUR CODE HERE */
    const { pathname } = request.nextUrl;

    // Use Better Auth's session fetcher
    const session = await auth.api.getSession({
        headers: await headers()
    });
  
    // Protect /todos
    if (pathname.startsWith("/todos") && !session) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
  
    // Protect /admin (must be authenticated + admin)
    if (pathname.startsWith("/admin")) {
      if (!session || session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/auth/sign-in", request.url));
      }
    }
  
    return NextResponse.next();
}

export const config = {
    runtime: "nodejs",
    matcher: [/* TODO: Add paths to match */"/todos/:path*", "/admin/:path*"]
}
