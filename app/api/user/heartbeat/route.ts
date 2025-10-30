import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// POST /api/user/heartbeat - Update user's last activity
export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    if (!authToken) {
      // Silent fail - no token is normal for logged out users
      return NextResponse.json({ success: false, reason: "no_token" }, { status: 200 })
    }

    const payload = await verifyToken(authToken)
    if (!payload || !payload.userId) {
      // Silent fail - invalid token
      return NextResponse.json({ success: false, reason: "invalid_token" }, { status: 200 })
    }

    const { prisma } = await import("@/lib/prisma")

    // Check if user exists first
    const userExists = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true }
    })

    if (!userExists) {
      // Silent fail - user doesn't exist (maybe deleted)
      return NextResponse.json({ success: false, reason: "user_not_found" }, { status: 200 })
    }

    // Update user activity
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        isOnline: true,
        lastActivity: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Silent fail - don't spam console with errors
    // Only log if it's not a "record not found" error
    if (error instanceof Error && !error.message.includes('Record to update not found')) {
      console.error("Heartbeat error:", error)
    }
    return NextResponse.json({
      success: false,
      reason: "error"
    }, { status: 200 })
  }
}

export const dynamic = "force-dynamic"

