import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح بالوصول - الأدمن فقط" }, { status: 403 })

    const judges = await prisma.judge.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, is_active: true, createdAt: true },
    })

    return NextResponse.json({ judges })
  } catch (e) {
    console.error("List judges error:", e)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
} 