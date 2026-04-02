import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "default_fallback_secret_change_me"
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

  // If token exists, verify it against the database for stateful session check
  if (token) {
    try {
      // Note: We avoid heavy DB operations in proxy if possible, 
      // but for "real-time product" security, we verify the token match.
      const { jwtVerify } = await import("jose")
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      
      // Verification against DB
      const { default: connectToDatabase } = await import("@/lib/db")
      const { default: UserModel } = await import("@/models/User")
      
      await connectToDatabase()
      const user = await UserModel.findOne({ id: payload.id }).select("token").lean()
      
      if (!user || user.token !== token) {
        // Token mismatch or user not found -> Session revoked
        const response = NextResponse.redirect(new URL("/login", request.url))
        response.cookies.delete(COOKIE_NAME)
        return response
      }
    } catch (err) {
      console.error("Proxy Auth Error:", err)
      if (isProtectedPath) {
        const response = NextResponse.redirect(new URL("/login", request.url))
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

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/editor/:path*",
  ],
}
