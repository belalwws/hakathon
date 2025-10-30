import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 403 })
    }

    // Fetch all judges with scores count
    const judges = await prisma.judge.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            role: true
          }
        },
        scores: true
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    // Format the response with evaluation count from scores
    const judgesWithCount = judges.map(judge => ({
      ...judge,
      _count: {
        evaluations: judge.scores.length
      }
    }))

    return NextResponse.json({ judges: judgesWithCount })
  } catch (error: any) {
    console.error('Error fetching judges:', error)
    return NextResponse.json(
      { error: error.message || 'خطأ في جلب المحكمين' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
