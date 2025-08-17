import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

async function computeResults() {
  // Average per team
  const results = await prisma.score.groupBy({
    by: ["team_id"],
    _avg: { score: true },
    _count: { score: true },
  })

  const teamsWithAverages = await Promise.all(
    results.map(async (avg) => {
      const team = await prisma.team.findUnique({ where: { id: avg.team_id } })
      return {
        team_id: avg.team_id,
        team_number: team?.team_number,
        average_score: Math.round((avg._avg.score || 0) * 100) / 100,
        total_evaluations: avg._count.score,
      }
    }),
  )

  teamsWithAverages.sort((a, b) => (b.average_score || 0) - (a.average_score || 0))

  const allScores = await prisma.score.findMany({
    include: { team: true, judge: { select: { id: true, name: true, email: true } } },
    orderBy: [{ team: { team_number: "asc" } }, { judge: { name: "asc" } }],
  })

  const detailedResults = teamsWithAverages.map((team) => {
    const teamScores = allScores.filter((s) => s.team_id === team.team_id)
    return {
      ...team,
      individual_scores: teamScores.map((s) => ({
        judge_id: s.judge_id,
        judge_name: s.judge.name,
        judge_email: s.judge.email,
        score: s.score,
        created_at: s.createdAt,
      })),
    }
  })

  const winner = teamsWithAverages.length > 0 ? teamsWithAverages[0] : null

  return {
    summary: {
      total_teams: teamsWithAverages.length,
      total_judges: await prisma.judge.count(),
      winner,
    },
    team_averages: teamsWithAverages,
    detailed_results: detailedResults,
    all_individual_scores: allScores.map((s) => ({
      team_number: s.team.team_number,
      judge_name: s.judge.name,
      score: s.score,
      created_at: s.createdAt,
    })),
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح بالوصول - الأدمن فقط" }, { status: 403 })

    const snapshots = await prisma.resultsSnapshot.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true },
    })

    return NextResponse.json({ snapshots })
  } catch (e) {
    console.error("List snapshots error:", e)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح بالوصول - الأدمن فقط" }, { status: 403 })

    const { name } = await request.json().catch(() => ({ name: null }))

    const data = await computeResults()

    const created = await prisma.resultsSnapshot.create({
      data: { name, data },
      select: { id: true, name: true, createdAt: true },
    })

    return NextResponse.json({ snapshot: created })
  } catch (e) {
    console.error("Create snapshot error:", e)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
} 