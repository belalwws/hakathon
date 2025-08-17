import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح بالوصول - الأدمن فقط" }, { status: 403 })

    const body = await request.json().catch(() => ({}))
    const { is_active } = body as { is_active?: boolean }
    if (typeof is_active !== "boolean") {
      return NextResponse.json({ error: "قيمة الحالة مطلوبة" }, { status: 400 })
    }

    const updated = await prisma.judge.update({
      where: { id: params.id },
      data: { is_active },
      select: { id: true, name: true, email: true, is_active: true },
    })

    return NextResponse.json({ judge: updated })
  } catch (e) {
    console.error("Update judge error:", e)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
} 