import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح بالوصول - الأدمن فقط" }, { status: 403 })
    }

    // Get average scores for each team
    const results = await prisma.score.groupBy({
      by: ["team_id"],
      _avg: {
        score: true,
      },
      _count: {
        score: true,
      },
    })

    // Get team details and combine with scores
    const teamsWithScores = await Promise.all(
      results.map(async (result) => {
        const team = await prisma.team.findUnique({
          where: { id: result.team_id },
        })

        return {
          team_id: result.team_id,
          team_number: team?.team_number,
          average_score: result._avg.score,
          total_evaluations: result._count.score,
        }
      }),
    )

    // Sort by average score descending
    teamsWithScores.sort((a, b) => (b.average_score || 0) - (a.average_score || 0))

    return NextResponse.json({ results: teamsWithScores })
  } catch (error) {
    console.error("Results fetch error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
