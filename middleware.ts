import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "default_fallback_secret_change_me"
const COOKIE_NAME = "collab_auth_token"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get(COOKIE_NAME)?.value

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/register" || path === "/"
  
  // Protect /editor and its subroutes
  const isProtectedPath = path.startsWith("/editor")

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
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
