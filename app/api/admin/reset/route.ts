import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization")
		const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value
		if (!token) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })

		const payload = await verifyToken(token)
		if (!payload || payload.role !== "admin") {
			return NextResponse.json({ error: "غير مصرح بالوصول - الأدمن فقط" }, { status: 403 })
		}

		await prisma.score.deleteMany({})
		return NextResponse.json({ message: "تم إعادة ضبط المسابقة بنجاح (تم حذف جميع التقييمات)" })
	} catch (e) {
		return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
	}
} 