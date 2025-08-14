import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

// Define protected routes and their required roles
const protectedRoutes = {
  "/api/teams": ["judge"],
  "/api/submit-score": ["judge"],
  "/api/results": ["admin"],
  "/api/admin/results": ["admin"],
  "/api/admin/reset": ["admin"],
  "/judge": ["judge"],
  "/admin": ["admin"],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next()
  }

  // Check if the route needs protection
  const requiredRoles = protectedRoutes[pathname as keyof typeof protectedRoutes]
  if (!requiredRoles) {
    return NextResponse.next()
  }

  // Get token from Authorization header or cookie
  let token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    token = request.cookies.get("auth-token")?.value
  }

  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    }

    // For pages, redirect to login
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Verify token - now async
  const payload = await verifyToken(token)
  if (!payload) {
    // For API routes, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "رمز المصادقة غير صالح" }, { status: 401 })
    }

    // For pages, redirect to login
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Check if user has required role
  if (!requiredRoles.includes(payload.role)) {
    // For API routes, return 403
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "غير مصرح بالوصول - صلاحيات غير كافية" }, { status: 403 })
    }

    // For pages, redirect based on role
    const redirectUrl = payload.role === "admin" ? "/admin" : "/judge"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Add user info to headers for API routes
  if (pathname.startsWith("/api/")) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", payload.userId)
    requestHeaders.set("x-user-role", payload.role)
    requestHeaders.set("x-user-email", payload.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*", "/judge/:path*", "/admin/:path*"],
}
