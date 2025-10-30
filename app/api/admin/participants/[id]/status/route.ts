import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, ParticipantStatus } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { sendTemplatedEmail } from '@/lib/mailer'

const prisma = new PrismaClient()

// PUT /api/admin/participants/[id]/status - Update participant status
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const participantId = params.id

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ 
        error: 'حالة غير صالحة. يجب أن تكون: approved, rejected, أو pending' 
      }, { status: 400 })
    }

    // Get participant details
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        user: true,
        hackathon: true
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'المشارك غير موجود' }, { status: 404 })
    }

    // Update participant status
    const updatedParticipant = await prisma.participant.update({
      where: { id: participantId },
      data: { 
        status: status as ParticipantStatus,
        updatedAt: new Date()
      },
      include: {
        user: true,
        hackathon: true
      }
    })

    // Send notification email based on status
    try {
      let templateType = ''
      let emailData = {
        participantName: participant.user.name,
        participantEmail: participant.user.email,
        hackathonTitle: participant.hackathon.title,
        hackathonDate: participant.hackathon.startDate.toLocaleDateString('ar-SA'),
        hackathonTime: participant.hackathon.startDate.toLocaleTimeString('ar-SA'),
        organizerName: 'فريق الهاكاثون',
        organizerEmail: process.env.MAIL_FROM || 'no-reply@hackathon.com',
        teamRole: participant.teamRole,
        teamName: participant.teamName || 'غير محدد',
        projectTitle: participant.projectTitle || 'غير محدد',
        statusUpdateDate: new Date().toLocaleDateString('ar-SA')
      }

      if (status === 'approved') {
        templateType = 'acceptance'
        await sendTemplatedEmail(
          templateType,
          participant.user.email,
          {
            ...emailData,
            acceptanceMessage: 'تهانينا! تم قبول طلب مشاركتك في الهاكاثون.',
            nextSteps: 'سيتم التواصل معك قريباً بتفاصيل إضافية حول الهاكاثون.',
            loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login`
          },
          participant.hackathon.id
        )
      } else if (status === 'rejected') {
        templateType = 'rejection'
        await sendTemplatedEmail(
          templateType,
          participant.user.email,
          {
            ...emailData,
            rejectionMessage: 'نأسف لإبلاغك أنه لم يتم قبول طلب مشاركتك في هذا الهاكاثون.',
            rejectionReason: 'تم اتخاذ هذا القرار بناءً على معايير الاختيار المحددة.',
            encouragementMessage: 'نشجعك على المشاركة في الهاكاثونات القادمة.',
            futureOpportunities: 'ترقب الإعلان عن هاكاثونات جديدة قريباً.'
          },
          participant.hackathon.id
        )
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError)
      // Don't fail the status update if email fails
    }

    console.log(`Participant ${participantId} status updated to ${status}`)

    return NextResponse.json({
      message: `تم تحديث حالة المشارك إلى ${status === 'approved' ? 'مقبول' : status === 'rejected' ? 'مرفوض' : 'في الانتظار'}`,
      participant: {
        id: updatedParticipant.id,
        name: updatedParticipant.user.name,
        email: updatedParticipant.user.email,
        status: updatedParticipant.status,
        updatedAt: updatedParticipant.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating participant status:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في الخادم' 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

