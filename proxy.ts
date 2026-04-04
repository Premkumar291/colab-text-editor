import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const COOKIE_NAME = "collab_auth_token"

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get(COOKIE_NAME)?.value

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/register" || path === "/"
  
  // Protect /editor and its subroutes
  const isProtectedPath = path.startsWith("/editor")

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If token exists, verify it
  if (token) {
    try {
      // Use jose for consistency with auth-utils
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_fallback_secret_change_me")
      const { payload } = await jwtVerify(token, secret)
      
      // For protected paths, we also verify against the database
      if (isProtectedPath) {
        const { default: connectToDatabase } = await import("@/lib/db")
        const { default: UserModel } = await import("@/models/User")
        
        await connectToDatabase()
        const user = await UserModel.findOne({ id: (payload as any).id }).select("token").lean()
        
        if (!user || (user as any).token !== token) {
          throw new Error("Session revoked or user not found")
        }
      }
    } catch (err) {
      console.error("Proxy Auth Error:", err)
      // If it's a protected path, we must redirect
      if (isProtectedPath) {
        const response = NextResponse.redirect(new URL("/login", request.url))
        response.cookies.delete(COOKIE_NAME)
        return response
      }
      // For public paths, if the token is invalid, we just clear it
      if (token) {
        const response = NextResponse.next()
        response.cookies.delete(COOKIE_NAME)
        return response
      }
    }
  }

  if (isPublicPath && token) {
    // If logged in, redirect away from login/register to home or editor
    if (path === "/login" || path === "/register") {
       return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

// Next.js middleware configuration
export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/editor/:path*",
  ],
}
