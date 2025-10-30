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

// POST /api/admin/hackathons/[id]/notify - Send notification emails about hackathon
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params
    const hackathonId = resolvedParams.id
    
    const body = await request.json()
    const { 
      targetAudience, 
      filters = {},   
      subject,
      message,
      includeHackathonDetails = true
    } = body

    // Get hackathon details
    const hackathon = await prismaClient.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    let targetUsers = []

    if (targetAudience === 'approved') {
      // Only users who are already participants and approved
      const approvedParticipants = await prismaClient.participant.findMany({
        where: {
          hackathonId: hackathonId,
          status: 'approved'
        },
        include: {
          user: true
        }
      })
      
      targetUsers = approvedParticipants.map((p: any) => p.user)
    } else {
      // Build user query based on target audience for other cases
      let userQuery: any = {}

      if (targetAudience === 'city' && filters.city) {
        userQuery.city = filters.city
      }

      if (targetAudience === 'nationality' && filters.nationality) {
        userQuery.nationality = filters.nationality
      }

      // For 'all', 'city', 'nationality' - send to all users matching criteria
      const users = await prismaClient.user.findMany({
        where: userQuery
      })
      
      targetUsers = users
    }

    if (targetUsers.length === 0) {
      return NextResponse.json({ 
        message: 'لا توجد مستخدمين يطابقون المعايير المحددة',
        sentCount: 0
      })
    }

    // For now, just return success without actually sending emails
    // This is to test the API first
    return NextResponse.json({ 
      message: `سيتم إرسال ${targetUsers.length} إيميل`,
      sentCount: targetUsers.length,
      targetAudience,
      hackathonTitle: hackathon.title
    })

  } catch (error) {
    console.error('Error in notify API:', error)
    return NextResponse.json({ 
      error: 'خطأ في إرسال الإشعارات',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
