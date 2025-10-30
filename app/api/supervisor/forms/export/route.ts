import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    const userId = request.headers.get('x-user-id')

    if (!['supervisor', 'admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hackathonId = searchParams.get('hackathonId')
    const formType = searchParams.get('formType')

    if (!hackathonId || !formType) {
      return NextResponse.json({ error: 'معرف الهاكاثون ونوع الفورم مطلوبان' }, { status: 400 })
    }

    // Check if supervisor has access to this hackathon
    if (userRole === 'supervisor') {
      const supervisorAccess = await prisma.supervisor.findFirst({
        where: {
          userId: userId || '',
          hackathonId: hackathonId
        }
      })

      if (!supervisorAccess) {
        return NextResponse.json({ error: 'ليس لديك صلاحية لهذا الهاكاثون' }, { status: 403 })
      }
    }

    let data: any[] = []
    let worksheetName = ''

    switch (formType) {
      case 'judges':
        worksheetName = 'طلبات المحكمين'
        const judges = await prisma.judgeInvitation.findMany({
          where: { hackathonId },
          orderBy: { createdAt: 'desc' }
        })

        data = judges.map((judge: any) => ({
          'الاسم': judge.name || '-',
          'البريد الإلكتروني': judge.email || '-',
          'الحالة': judge.status === 'pending' ? 'معلق' : judge.status === 'accepted' ? 'مقبول' : 'مرفوض',
          'تاريخ الإنشاء': new Date(judge.createdAt).toLocaleDateString('ar-EG')
        }))
        break

      case 'supervision':
        worksheetName = 'طلبات الإشراف'
        const supervisionRequests = await prisma.supervisionFormSubmission.findMany({
          where: { hackathonId },
          orderBy: { createdAt: 'desc' }
        })

        data = supervisionRequests.map((submission: any) => {
          const submissionData = typeof submission.submissionData === 'string' 
            ? JSON.parse(submission.submissionData) 
            : submission.submissionData
          return {
            'رقم الطلب': submission.id,
            'تاريخ التقديم': new Date(submission.createdAt).toLocaleDateString('ar-EG'),
            ...submissionData
          }
        })
        break

      case 'feedback':
        worksheetName = 'تقييمات الهاكاثون'
        const feedbacks = await prisma.hackathonFeedback.findMany({
          where: { hackathonId },
          orderBy: { createdAt: 'desc' }
        })

        data = feedbacks.map((feedback: any) => {
          const responses = typeof feedback.responses === 'string'
            ? JSON.parse(feedback.responses)
            : feedback.responses
          return {
            'اسم المشارك': feedback.participantName,
            'البريد الإلكتروني': feedback.participantEmail,
            'التقييم العام': feedback.overallRating || '-',
            'الاقتراحات': feedback.suggestions || '-',
            'تاريخ الإرسال': new Date(feedback.createdAt).toLocaleDateString('ar-EG'),
            ...responses
          }
        })
        break

      case 'registration':
        worksheetName = 'تسجيلات المشاركين'
        const registrations = await prisma.participant.findMany({
          where: { hackathonId },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                city: true
              }
            }
          },
          orderBy: { registeredAt: 'desc' }
        })

        data = registrations.map((participant: any) => ({
          'رقم المشارك': participant.id,
          'الاسم': participant.user.name,
          'البريد الإلكتروني': participant.user.email,
          'الهاتف': participant.user.phone || '-',
          'المدينة': participant.user.city || '-',
          'اسم الفريق': participant.teamName || '-',
          'المشروع': participant.projectTitle || '-',
          'الحالة': participant.status === 'pending' ? 'معلق' : participant.status === 'approved' ? 'مقبول' : 'مرفوض',
          'تاريخ التسجيل': new Date(participant.registeredAt).toLocaleDateString('ar-EG')
        }))
        break

      default:
        return NextResponse.json({ error: 'نوع فورم غير صحيح' }, { status: 400 })
    }

    if (data.length === 0) {
      data = [{ 'رسالة': 'لا توجد بيانات متاحة' }]
    }

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName)

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return as file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${worksheetName}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء تصدير البيانات' }, { status: 500 })
  }
}
