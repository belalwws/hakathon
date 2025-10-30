import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

// Define protected route prefixes and their required roles
// IMPORTANT: Order matters! More specific routes MUST come BEFORE general routes
const protectedRoutes: { prefix: string; roles: ("admin" | "judge" | "supervisor" | "participant" | "expert" | "master")[] }[] = [
  // Master routes - HIGHEST PRIORITY
  { prefix: "/master", roles: ["master"] },
  { prefix: "/api/master", roles: ["master"] },
  
  { prefix: "/api/teams", roles: ["judge", "supervisor"] },
  { prefix: "/api/submit-score", roles: ["judge"] },
  { prefix: "/api/results", roles: ["admin"] },
  
  // Specific admin routes accessible by supervisors (MUST come before general /api/admin)
  { prefix: "/api/admin/email-templates", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/send-custom-email", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/hackathons", roles: ["admin", "supervisor"] }, // All hackathon management
  { prefix: "/api/admin/experts", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/expert-invitations", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/expert-applications", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/expert-form", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/expert-form-design", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/judges", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/judge-invitations", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/judge-applications", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/judge-form", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/judge-form-design", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/supervision-form", roles: ["admin", "supervisor"] },
  { prefix: "/api/admin/feedback-form", roles: ["admin", "supervisor"] },
  
  // General admin route (MUST come AFTER specific routes)
  { prefix: "/api/admin", roles: ["admin"] },
  
  // Other routes
  { prefix: "/api/supervisor", roles: ["supervisor", "admin"] },
  { prefix: "/judge", roles: ["judge"] },
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/supervisor", roles: ["supervisor", "admin"] },
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('🔍 [Middleware] Request to:', pathname)

  // Special handling for invitation endpoints - ALWAYS ALLOW (highest priority)
  if (pathname.startsWith('/invitation/') ||
      pathname.includes('/invitation/') ||
      pathname.startsWith('/supervisor/invitation/') ||
      pathname.includes('/supervisor/invitation/') ||
      pathname.includes('/api/supervisor/accept-invitation') ||
      pathname === '/api/supervisor/accept-invitation' ||
      pathname.startsWith('/api/supervisor/accept-invitation?') ||
      pathname.match(/^\/invitation\/[^\/]+$/) ||
      pathname.match(/^\/supervisor\/invitation\/[^\/]+$/)) {
    console.log('🔓 PRIORITY: Allowing invitation access:', pathname)
    const response = NextResponse.next()
    // Add CORS headers for API endpoints
    if (pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    }
    return response
  }

  // Handle CORS for external API routes
  if (pathname.startsWith('/api/external/')) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'false',
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    // For actual requests, continue processing but ensure CORS headers are added
    // Don't use NextResponse.next() here to avoid redirect issues
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  // Handle certificate files - redirect to API
  if (pathname.startsWith("/certificates/")) {
    const filename = pathname.replace("/certificates/", "")
    if (filename && filename.match(/^[a-zA-Z0-9\-_.]+\.(png|jpg|jpeg|webp)$/)) {
      const apiUrl = new URL(`/api/certificates/${filename}`, request.url)
      return NextResponse.rewrite(apiUrl)
    }
  }

  // Skip Next.js internals, static assets, and public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/uploads") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/hackathons" ||
    pathname.startsWith("/hackathons/") ||
    pathname === "/results" ||
    pathname.startsWith("/certificate/") ||
    pathname.startsWith("/forms/") ||
    pathname.startsWith("/judge/apply/") ||
    pathname.startsWith("/supervisor/apply/") ||
    pathname.startsWith("/supervisor/invitation/") ||
    pathname.startsWith("/api/supervisor/accept-invitation") ||
    pathname === "/api/supervisor/accept-invitation" ||
    pathname.match(/^\/api\/supervisor\/accept-invitation(\?.*)?$/) ||
    pathname.startsWith("/feedback/")
  ) {
    return NextResponse.next()
  }

  // Find matching protected route by prefix - IMPORTANT: Find the LONGEST match
  const matchingRoutes = protectedRoutes.filter((r) => pathname.startsWith(r.prefix))
  if (matchingRoutes.length === 0) {
    return NextResponse.next()
  }
  
  // Get the most specific (longest) matching route
  const route = matchingRoutes.reduce((longest, current) => 
    current.prefix.length > longest.prefix.length ? current : longest
  )

  console.log('🔒 [Middleware] Protected route:', pathname, 'Required roles:', route.roles)

  // Get token from Authorization header or cookie
  let token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    token = request.cookies.get("auth-token")?.value
  }

  if (!token) {
    console.log('❌ [Middleware] No token found for:', pathname)
    // For API routes, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    }

    // For pages, redirect to login page only
    if (!pathname.startsWith('/login')) {
      console.log('🔀 [Middleware] Redirecting to login from:', pathname)
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // Verify token - now async
  const payload = await verifyToken(token)
  if (!payload) {
    console.log('❌ [Middleware] Invalid token for:', pathname)
    // For API routes, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "رمز المصادقة غير صالح" }, { status: 401 })
    }

    // For pages, redirect to login page
    if (!pathname.startsWith('/login')) {
      console.log('🔀 [Middleware] Redirecting to login (invalid token) from:', pathname)
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  console.log('✅ [Middleware] Token verified for:', pathname, 'User role:', payload.role)

  // Master role can access EVERYTHING - bypass all restrictions
  if (payload.role === 'master') {
    console.log('👑 [Middleware] Master access granted to:', pathname)
    
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

  // Check if user has required role
  if (!route.roles.includes(payload.role)) {
    console.log('❌ [Middleware] Insufficient permissions. User role:', payload.role, 'Required:', route.roles)
    // For API routes, return 403
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "غير مصرح بالوصول - صلاحيات غير كافية" }, { status: 403 })
    }

    // For pages, redirect based on role
    const redirectUrl = payload.role === "admin" ? "/admin/dashboard" :
                       payload.role === "judge" ? "/judge" :
                       payload.role === "supervisor" ? "/supervisor/dashboard" :
                       "/participant/dashboard"
    console.log('🔀 [Middleware] Redirecting to:', redirectUrl, 'from:', pathname)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  console.log('✅ [Middleware] Access granted to:', pathname)

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
  matcher: [
    "/api/:path*",
    "/judge/:path*",
    "/admin/:path*",
    "/supervisor/:path*",
    "/master/:path*",
    "/certificates/:path*"
  ],
}
