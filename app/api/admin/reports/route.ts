import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { HackathonStatus, ParticipantStatus } from '@prisma/client'

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

// GET /api/admin/reports - Get comprehensive reports
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    // Basic counts
    const totalUsers = await prismaClient.user.count()
    const totalHackathons = await prismaClient.hackathon.count()
    const totalParticipants = await prismaClient.participant.count()
    const activeHackathons = await prismaClient.hackathon.count({
      where: { status: HackathonStatus.open }
    })

    // Participant status breakdown
    const pendingParticipants = await prismaClient.participant.count({
      where: { status: ParticipantStatus.pending }
    })
    const approvedParticipants = await prismaClient.participant.count({
      where: { status: ParticipantStatus.approved }
    })
    const rejectedParticipants = await prismaClient.participant.count({
      where: { status: ParticipantStatus.rejected }
    })

    // Users by city
    const usersByCity = await prismaClient.user.groupBy({
      by: ['city'],
      _count: {
        city: true
      },
      orderBy: {
        _count: {
          city: 'desc'
        }
      }
    })

    // Users by nationality
    const usersByNationality = await prismaClient.user.groupBy({
      by: ['nationality'],
      _count: {
        nationality: true
      },
      orderBy: {
        _count: {
          nationality: 'desc'
        }
      }
    })

    // Hackathons by status
    const hackathonsByStatus = await prismaClient.hackathon.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    // Transform data for frontend
    const reports = {
      totalUsers,
      totalHackathons,
      totalParticipants,
      activeHackathons,
      pendingParticipants,
      approvedParticipants,
      rejectedParticipants,
      usersByCity: usersByCity.map((item: any) => ({
        city: item.city || 'غير محدد',
        count: item._count.city
      })),
      usersByNationality: usersByNationality.map((item: any) => ({
        nationality: item.nationality || 'غير محدد',
        count: item._count.nationality
      })),
      hackathonsByStatus: hackathonsByStatus.map((item: any) => ({
        status: item.status,
        count: item._count.status
      }))
    }

    return NextResponse.json(reports)

  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'خطأ في جلب التقارير' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
