import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { validateRequest, scoreSchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request, 20, 60000) // 20 submissions per minute
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "تم تجاوز عدد محاولات التقييم المسموحة" }, { status: 429 })
  }

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

    const body = await request.json()

    const validation = validateRequest(scoreSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { team_id, score } = validation.data

    // Upsert score (update if exists, create if not)
    const savedScore = await prisma.score.upsert({
      where: {
        judge_id_team_id: {
          judge_id: payload.userId,
          team_id: team_id,
        },
      },
      update: {
        score: score,
      },
      create: {
        judge_id: payload.userId,
        team_id: team_id,
        score: score,
      },
    })

    return NextResponse.json({
      message: "تم حفظ التقييم بنجاح",
      score: savedScore,
    })
  } catch (error) {
    console.error("Score submission error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
