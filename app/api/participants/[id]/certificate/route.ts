import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const participantId = params.id

    // Find participant with team and hackathon data
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        team: {
          include: {
            hackathon: {
              select: {
                title: true,
                description: true
              }
            },
            scores: {
              include: {
                criterion: true,
                judge: {
                  include: {
                    user: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          }
        },
        hackathon: {
          select: {
            title: true,
            description: true
          }
        }
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'المشارك غير موجود' }, { status: 404 })
    }

    // Calculate team ranking if participant has a team
    let rank = 0
    let isWinner = false
    let totalScore = 0

    if (participant.team) {
      // Get all teams in the same hackathon with their scores
      const allTeams = await prisma.team.findMany({
        where: { hackathonId: participant.team.hackathonId },
        include: {
          scores: true
        }
      })

      // Calculate scores for each team
      const teamsWithScores = allTeams.map(team => {
        const teamTotalScore = team.scores.reduce((sum, score) => sum + score.score, 0)

        // Average score should be in stars (1-5) for display
        const teamAverageScore = team.scores.length > 0
          ? team.scores.reduce((sum, score) => {
              const stars = (score.score / score.maxScore) * 5
              return sum + stars
            }, 0) / team.scores.length
          : 0

        return {
          id: team.id,
          totalScore: teamTotalScore,
          averageScore: teamAverageScore,
          evaluationsCount: team.scores.length
        }
      }).sort((a, b) => b.totalScore - a.totalScore)

      // Find current team's rank
      const teamIndex = teamsWithScores.findIndex(team => team.id === participant.team?.id)
      rank = teamIndex + 1
      isWinner = rank <= 3
      totalScore = teamsWithScores[teamIndex]?.totalScore || 0
    }

    const hackathonTitle = participant.team?.hackathon?.title || participant.hackathon?.title || 'هاكاثون الابتكار التقني'
    const teamName = participant.team?.name || 'مشارك فردي'

    return NextResponse.json({
      name: participant.user.name,
      email: participant.user.email,
      hackathonTitle,
      teamName,
      rank,
      isWinner,
      totalScore,
      certificateImageUrl: '/row-certificat.png',
      date: new Date().toLocaleDateString('ar-SA')
    })

  } catch (error) {
    console.error('Error fetching participant certificate data:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

