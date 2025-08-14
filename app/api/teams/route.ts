import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "judge") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const teams = await prisma.team.findMany({
      select: {
        id: true,
        team_number: true,
      },
      orderBy: {
        team_number: "asc",
      },
    })

    return NextResponse.json({ teams })
  } catch (error) {
    console.error("Teams fetch error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
