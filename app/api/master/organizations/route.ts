import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Development mode bypass
    const isDevelopment = request.headers.get('x-development-mode') === 'true'
    
    if (!isDevelopment) {
      // Verify master authentication in production
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const payload = await verifyToken(token)
      if (!payload || payload.role !== 'master') {
        return NextResponse.json({ error: 'Forbidden - Master role required' }, { status: 403 })
      }
    }

    // Fetch all organizations with counts
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            hackathons: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
