import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح بالوصول - الأدمن فقط" }, { status: 403 })
    }

    // Get all scores with team and judge information (lazy Prisma import)
    let prisma: any
    try {
      prisma = (await import("@/lib/prisma")).prisma
    } catch (_) {
      prisma = null
    }

    if (!prisma) {
      return NextResponse.json({
        summary: { total_teams: 0, total_judges: 0, winner: null },
        team_averages: [],
        detailed_results: [],
        all_individual_scores: []
      })
    }

    const allScores = await prisma.score.findMany({
      include: {
        team: true,
        judge: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
      },
      orderBy: [
        { team: { teamNumber: "asc" } },
        { judge: { user: { name: "asc" } } },
      ],
    })

    // Calculate average scores for each team
    const teamAverages = await prisma.score.groupBy({
      by: ["teamId"],
      _avg: {
        score: true,
      },
      _count: {
        score: true,
      },
    })

    // Get team details and combine with averages
    const teamsWithAverages = await Promise.all(
      teamAverages.map(async (avg: { teamId: string; _avg: { score: number | null }; _count: { score: number } }) => {
        const team = await prisma.team.findUnique({
          where: { id: avg.teamId },
        })

        return {
          team_id: avg.teamId,
          team_number: team?.team_number,
          average_score: Math.round((avg._avg.score || 0) * 100) / 100,
          total_evaluations: avg._count.score,
        }
      }),
    )

    // Sort by average score descending to find winner
    teamsWithAverages.sort((a, b) => (b.average_score || 0) - (a.average_score || 0))

    // Determine winner (highest average score)
    const winner = teamsWithAverages.length > 0 ? teamsWithAverages[0] : null

    // Group individual scores by team for detailed view
    const detailedResults = teamsWithAverages.map((team) => {
      const teamScores = allScores.filter((score: typeof allScores[0]) => score.team_id === team.team_id)
      
      return {
        ...team,
        individual_scores: teamScores.map((score: typeof allScores[0]) => ({
          judge_id: score.judgeId,
          judge_name: score.judge.user.name,
          judge_email: score.judge.user.email,
          score: score.score,
          created_at: score.createdAt,
        })),
      }
    })

    return NextResponse.json({
      summary: {
        total_teams: teamsWithAverages.length,
        total_judges: await prisma.judge.count(),
        winner: winner,
      },
      team_averages: teamsWithAverages,
      detailed_results: detailedResults,
      all_individual_scores: allScores.map((score: typeof allScores[0]) => ({
        team_number: score.team.teamNumber,
        judge_name: score.judge.user.name,
        score: score.score,
        created_at: score.createdAt,
      })),
    })
  } catch (error) {
    console.error("Admin results fetch error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
} 