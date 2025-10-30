import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization")
		const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value
		if (!token) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })

		const payload = await verifyToken(token)
		if (!payload || payload.role !== "judge") {
			return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
		}

		const scores = await prisma.score.findMany({
			where: { judgeId: payload.userId },
			select: { teamId: true },
		})
		return NextResponse.json({ team_ids: scores.map((s) => s.teamId) })
	} catch (e) {
		return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
	}
} 