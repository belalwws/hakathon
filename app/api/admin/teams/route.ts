import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/teams - Get all teams
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teams = await prisma.team.findMany({
      include: {
        hackathon: {
          select: {
            id: true,
            title: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الفرق' },
      { status: 500 }
    )
  }
}

