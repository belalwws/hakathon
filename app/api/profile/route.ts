import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Lazy import prisma to avoid build-time errors
let prisma: any = null
async function getPrisma() {
  if (!prisma) {
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
    } catch (error) {
      console.error('Failed to import prisma:', error)
      return null
    }
  }
  return prisma
}

// GET /api/profile - Get user profile with participations
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    // Get user profile with participations
    const user = await prismaClient.user.findUnique({
      where: { id: payload.userId },
      include: {
        participations: {
          include: {
            hackathon: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                status: true
              }
            }
          },
          orderBy: {
            registeredAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // Format the response
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      nationality: user.nationality,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      participations: user.participations.map((participation: any) => ({
        id: participation.id,
        hackathon: {
          id: participation.hackathon.id,
          title: participation.hackathon.title,
          description: participation.hackathon.description,
          startDate: participation.hackathon.startDate.toISOString(),
          endDate: participation.hackathon.endDate.toISOString(),
          status: participation.hackathon.status
        },
        teamName: participation.teamName,
        projectTitle: participation.projectTitle,
        teamRole: participation.teamRole,
        status: participation.status,
        registeredAt: participation.registeredAt.toISOString(),
        approvedAt: participation.approvedAt?.toISOString(),
        rejectedAt: participation.rejectedAt?.toISOString()
      }))
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
