import type { NextRequest } from "next/server"

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(request: NextRequest, limit = 10, windowMs = 60000) {
	// Disable rate limiting in development for smoother DX
	if (process.env.NODE_ENV !== "production") {
		return { success: true, remaining: limit }
	}
	const forwarded = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
	const ip = (forwarded?.split(",")[0]?.trim() || (request as any).ip || "unknown") as string
	const path = request.nextUrl?.pathname || "*"
	const key = `${ip}:${path}`
	const now = Date.now()
	const windowStart = now - windowMs

	// Clean up old entries
	for (const [k, value] of rateLimitMap.entries()) {
		if (value.resetTime < windowStart) {
			rateLimitMap.delete(k)
		}
	}

	const current = rateLimitMap.get(key)

	if (!current) {
		rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
		return { success: true, remaining: limit - 1 }
	}

	if (current.resetTime < now) {
		// Reset window
		rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
		return { success: true, remaining: limit - 1 }
	}

	if (current.count >= limit) {
		return { success: false, remaining: 0 }
	}

	current.count++
	return { success: true, remaining: limit - current.count }
} 