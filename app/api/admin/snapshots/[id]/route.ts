import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح بالوصول - الأدمن فقط" }, { status: 403 })

    const snapshot = await prisma.resultsSnapshot.findUnique({ where: { id: params.id } })
    if (!snapshot) return NextResponse.json({ error: "اللقطة غير موجودة" }, { status: 404 })

    return NextResponse.json({ snapshot })
  } catch (e) {
    console.error("Get snapshot error:", e)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح بالوصول - الأدمن فقط" }, { status: 403 })

    await prisma.resultsSnapshot.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Delete snapshot error:", e)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
} 