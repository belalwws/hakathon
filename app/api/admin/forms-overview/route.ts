import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get all hackathons with their participant stats
    const hackathons = await prisma.hackathon.findMany({
      select: {
        id: true,
        title: true,
        participants: {
          select: {
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Process the data to get overview stats
    const formsOverview = hackathons.map(hackathon => {
      const participants = hackathon.participants

      const totalSubmissions = participants.length
      const pendingReview = participants.filter(p => p.status === 'pending').length
      const approved = participants.filter(p => p.status === 'accepted' || p.status === 'approved').length
      const rejected = participants.filter(p => p.status === 'rejected').length

      return {
        hackathonId: hackathon.id,
        hackathonTitle: hackathon.title,
        totalSubmissions,
        pendingReview,
        approved,
        rejected,
        hasCustomForm: false // We can enhance this later to check for custom forms
      }
    })

    return NextResponse.json(formsOverview)

  } catch (error) {
    console.error('Error loading forms overview:', error)
    return NextResponse.json({ error: 'خطأ في تحميل نظرة عامة على النماذج' }, { status: 500 })
  }
}
