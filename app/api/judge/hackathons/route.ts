import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'judge') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get hackathons where this judge is assigned and evaluation is open
    const judge = await prisma.judge.findFirst({
      where: { 
        userId: payload.userId,
        isActive: true
      },
      include: {
        hackathon: {
          include: {
            evaluationCriteria: {
              orderBy: { createdAt: 'asc' }
            },
            teams: {
              where: {
                participants: {
                  some: {
                    status: 'approved' as any
                  }
                }
              },
              include: {
                participants: {
                  where: { status: 'approved' as any },
                  include: {
                    user: {
                      select: {
                        name: true,
                        preferredRole: true
                      }
                    }
                  }
                }
              },
              orderBy: { teamNumber: 'asc' }
            }
          }
        }
      }
    })

    if (!judge) {
      return NextResponse.json({ hackathons: [] })
    }

    const hackathons = judge.hackathon.evaluationOpen ? [judge.hackathon] : []

    return NextResponse.json({ hackathons })

  } catch (error) {
    console.error('Error fetching judge hackathons:', error)
    return NextResponse.json({ error: 'خطأ في جلب الهاكاثونات' }, { status: 500 })
  }
}
