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

    // Get hackathon with evaluation criteria
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        title: true,
        evaluationCriteria: {
          select: {
            id: true,
            name: true,
            description: true,
            maxScore: true
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Get teams with their scores and judge information
    const teams = await prisma.team.findMany({
      where: { hackathonId },
      include: {
        participants: {
          where: { status: 'approved' as any },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        scores: {
          include: {
            criterion: {
              select: {
                name: true
              }
            },
            judge: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Get all judges for this hackathon
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
        }
      }
    })

    // Calculate total and average scores for each team
    const teamsWithScores = teams.map(team => {
      // Total score is the sum of all actual scores
      const totalScore = team.scores.reduce((sum, score) => sum + score.score, 0)

      // Average score should be in stars (1-5) for display
      // Convert each score back to stars and then average
      const averageScore = team.scores.length > 0
        ? team.scores.reduce((sum, score) => {
            // Convert score back to stars: (score / maxScore) * 5
            const stars = (score.score / score.maxScore) * 5
            return sum + stars
          }, 0) / team.scores.length
        : 0

      return {
        id: team.id,
        name: team.name,
        teamNumber: team.teamNumber,
        ideaTitle: team.ideaTitle,
        ideaDescription: team.ideaDescription,
        participants: team.participants.map(p => ({
          id: p.id,
          user: {
            name: p.user.name,
            email: p.user.email
          },
          teamRole: p.teamRole
        })),
        scores: team.scores.map(score => ({
          criterionId: score.criterionId,
          score: score.score,
          maxScore: score.maxScore,
          criterion: {
            name: score.criterion.name
          },
          judge: {
            user: {
              name: score.judge.user.name,
              email: score.judge.user.email
            }
          },
          createdAt: score.createdAt.toISOString()
        })),
        totalScore,
        averageScore
      }
    })

    return NextResponse.json({
      hackathon,
      teams: teamsWithScores
    })

  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return NextResponse.json({ error: 'خطأ في جلب التقييمات' }, { status: 500 })
  }
}
