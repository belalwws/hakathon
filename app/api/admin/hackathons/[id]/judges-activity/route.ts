import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id: hackathonId } = await params

    // Get all judges for this hackathon with their activity
    const judges = await prisma.judge.findMany({
      where: { 
        hackathonId,
        isActive: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        scores: {
          select: {
            teamId: true,
            createdAt: true
          },
          distinct: ['teamId'],
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    // Get total number of teams for this hackathon
    const totalTeams = await prisma.team.count({
      where: { hackathonId }
    })

    // Process judge activity data
    const judgesActivity = judges.map(judge => {
      const evaluatedTeams = judge.scores.length
      const lastActivity = judge.scores.length > 0 ? judge.scores[0].createdAt : null

      return {
        id: judge.id,
        name: judge.user.name,
        email: judge.user.email,
        evaluatedTeams,
        totalTeams,
        lastActivity: lastActivity ? lastActivity.toISOString() : null,
        isActive: judge.isActive,
        progress: totalTeams > 0 ? Math.round((evaluatedTeams / totalTeams) * 100) : 0
      }
    })

    return NextResponse.json({
      judges: judgesActivity,
      totalTeams,
      summary: {
        totalJudges: judges.length,
        activeJudges: judges.filter(j => j.isActive).length,
        completedEvaluations: judges.reduce((sum, j) => sum + j.scores.length, 0),
        averageProgress: judgesActivity.length > 0 
          ? Math.round(judgesActivity.reduce((sum, j) => sum + j.progress, 0) / judgesActivity.length)
          : 0
      }
    })

  } catch (error) {
    console.error('Error fetching judges activity:', error)
    return NextResponse.json({ error: 'خطأ في جلب نشاط المحكمين' }, { status: 500 })
  }
}
