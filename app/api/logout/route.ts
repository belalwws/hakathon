import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
	try {
		// Get user from token and update online status
		const authToken = request.cookies.get("auth-token")?.value
		if (authToken) {
			const payload = await verifyToken(authToken)
			if (payload) {
				try {
					const { prisma } = await import("@/lib/prisma")
					await prisma.user.update({
						where: { id: payload.userId },
						data: {
							isOnline: false,
							lastActivity: new Date()
						}
					})
				} catch (error) {
					console.error("Error updating online status:", error)
				}
			}
		}
	} catch (error) {
		console.error("Logout error:", error)
	}

	const response = NextResponse.json({ message: "تم تسجيل الخروج" })
	response.cookies.set("auth-token", "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 0,
	})
	return response
}

export const dynamic = "force-dynamic" 