import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

import { prisma } from '@/lib/prisma'

// GET /api/user/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(authToken)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Fetching user profile for:', payload.userId)

    // Find user by verified token's userId with participations and team details
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        nationality: true,
        skills: true,
        experience: true,
        preferredRole: true,
        role: true,
        createdAt: true,
        participations: {
          include: {
            hackathon: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                status: true,
              },
            },
            team: {
              include: {
                participants: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        preferredRole: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { registeredAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Format dates in participations
    const formattedUser = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      participations: user.participations.map((participation: any) => ({
        ...participation,
        registeredAt: participation.registeredAt.toISOString(),
        approvedAt: participation.approvedAt ? participation.approvedAt.toISOString() : null,
        rejectedAt: participation.rejectedAt ? participation.rejectedAt.toISOString() : null,
        hackathon: {
          ...participation.hackathon,
          startDate: participation.hackathon.startDate.toISOString(),
          endDate: participation.hackathon.endDate.toISOString(),
        },
      })),
    }

    return NextResponse.json({ user: formattedUser })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(authToken)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, city, nationality, skills, experience, preferredRole } = body

    console.log('🔄 Updating user profile for:', payload.userId)

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: name || undefined,
        phone: phone ?? null,
        city: city ?? null,
        nationality: nationality ?? null,
        skills: skills ?? null,
        experience: experience ?? null,
        preferredRole: preferredRole ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        nationality: true,
        skills: true,
        experience: true,
        preferredRole: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: 'Profile updated',
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

