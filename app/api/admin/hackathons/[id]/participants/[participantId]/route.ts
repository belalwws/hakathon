import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'racein668@gmail.com',
    pass: process.env.GMAIL_PASS || 'gpbyxbbvrzfyluqt'
  }
})



// PATCH /api/admin/hackathons/[id]/participants/[participantId] - Update participant status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const body = await request.json()
    const { status, feedback } = body

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
    }

    // Get participant and hackathon details
    const participant = await prisma.participant.findUnique({
      where: { id: params.participantId },
      include: {
        user: true,
        hackathon: true
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'المشارك غير موجود' }, { status: 404 })
    }

    if (participant.hackathonId !== params.id) {
      return NextResponse.json({ error: 'المشارك لا ينتمي لهذا الهاكاثون' }, { status: 400 })
    }

    // Update participant status
    const updatedParticipant = await prisma.participant.update({
      where: { id: params.participantId },
      data: {
        status: status as any,
        feedback: feedback || null,
        approvedAt: status === 'approved' ? new Date() : null,
        rejectedAt: status === 'rejected' ? new Date() : null
      }
    })

    // Send notification email (only for approved/rejected, not for pending)
    if (status !== 'pending') {
      console.log(`📧 Preparing to send ${status} email to ${participant.user.email}`)

      try {
        const isApproved = status === 'approved'
        const templateType = isApproved ? 'acceptance' : 'rejection'

        console.log(`📧 Sending ${status} email to ${participant.user.email}`)

        // Use the new templated email system
        const { sendTemplatedEmail } = await import('@/lib/mailer')

        await sendTemplatedEmail(
          templateType,
          participant.user.email,
          {
            participantName: participant.user.name,
            participantEmail: participant.user.email,
            hackathonTitle: participant.hackathon.title,
            hackathonDate: participant.hackathon.startDate.toLocaleDateString('ar-SA'),
            hackathonTime: participant.hackathon.startDate.toLocaleTimeString('ar-SA'),
            hackathonLocation: 'سيتم الإعلان عنه قريباً',
            registrationDate: participant.registeredAt.toLocaleDateString('ar-SA'),
            organizerName: 'فريق الهاكاثون',
            organizerEmail: process.env.MAIL_FROM || 'no-reply@hackathon.com',
            teamRole: participant.teamRole || 'مطور'
          },
          participant.hackathonId
        )

        console.log(`✅ ${status} email sent successfully to ${participant.user.email}`)
      } catch (emailError) {
        console.error(`❌ Failed to send ${status} email to ${participant.user.email}:`, emailError)
        // Don't fail the status update if email fails
      }
    } else {
      console.log(`⏸️ Status changed to pending for ${participant.user.email} - no email sent`)
    }

    const statusMessage = status === 'approved' ? 'قبول' : status === 'rejected' ? 'رفض' : 'إعادة للانتظار'
    return NextResponse.json({
      message: `تم ${statusMessage} المشارك بنجاح`,
      participant: {
        id: updatedParticipant.id,
        status: updatedParticipant.status,
        approvedAt: updatedParticipant.approvedAt,
        rejectedAt: updatedParticipant.rejectedAt
      }
    })

  } catch (error) {
    console.error('Error updating participant status:', error)
    return NextResponse.json({ error: 'خطأ في تحديث حالة المشارك' }, { status: 500 })
  }
}

function getApprovalEmailContent(userName: string, hackathonTitle: string): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تم قبولك في الهاكاثون</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #c3e956/10 0%, #3ab666/10 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 مبروك!</h1>
          <p style="color: #c3e956; margin: 10px 0 0 0; font-size: 18px;">تم قبولك في الهاكاثون</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #01645e; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${userName}! 👋</h2>

          <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            يسعدنا إبلاغك بأنه تم <strong style="color: #3ab666;">قبول طلب مشاركتك</strong> في:
          </p>

          <div style="background: #f8f9fa; border-right: 4px solid #3ab666; padding: 20px; margin: 25px 0; border-radius: 8px;">
            <h3 style="color: #01645e; margin: 0; font-size: 20px;">📋 ${hackathonTitle}</h3>
          </div>

          <h3 style="color: #01645e; margin: 30px 0 15px 0;">🚀 الخطوات التالية:</h3>
          <ul style="color: #333; line-height: 1.8; padding-right: 20px;">
            <li style="margin-bottom: 10px;">انتظر تكوين الفرق التلقائي</li>
            <li style="margin-bottom: 10px;">ستصلك رسالة بتفاصيل فريقك قريباً</li>
            <li style="margin-bottom: 10px;">تابع بريدك الإلكتروني للتحديثات</li>
            <li style="margin-bottom: 10px;">استعد لتجربة مميزة من الإبداع والتطوير</li>
          </ul>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}/profile" style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: transform 0.3s;">
              🏠 زيارة الملف الشخصي
            </a>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #3ab666; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="color: #01645e; margin: 0; font-weight: bold; text-align: center;">
              💡 نصيحة: ابدأ في التفكير في أفكار مشاريع مبتكرة!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            هل تحتاج مساعدة؟ تواصل معنا على
            <a href="mailto:support@hackathon.gov.sa" style="color: #3ab666;">support@hackathon.gov.sa</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function getRejectionEmailContent(userName: string, hackathonTitle: string): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>شكراً لاهتمامك</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">شكراً لك 🙏</h1>
          <p style="color: #f8f9fa; margin: 10px 0 0 0; font-size: 18px;">نقدر اهتمامك بالمشاركة</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #495057; margin: 0 0 20px 0; font-size: 24px;">عزيزي ${userName} 👋</h2>

          <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            شكراً لك على اهتمامك بالمشاركة في <strong>${hackathonTitle}</strong>.
          </p>

          <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            نأسف لإبلاغك أنه لم يتم قبول طلب مشاركتك هذه المرة، وذلك بسبب العدد المحدود للمقاعد المتاحة.
          </p>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #856404; margin: 0 0 15px 0;">🌟 لا تيأس!</h3>
            <ul style="color: #856404; line-height: 1.8; padding-right: 20px; margin: 0;">
              <li style="margin-bottom: 8px;">ستكون هناك هاكاثونات أخرى قريباً</li>
              <li style="margin-bottom: 8px;">طور مهاراتك واستعد للفرصة القادمة</li>
              <li style="margin-bottom: 8px;">تابع منصتنا للإعلان عن الفعاليات الجديدة</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}" style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🏠 زيارة المنصة
            </a>
          </div>

          <p style="color: #333; line-height: 1.8; font-size: 16px; text-align: center; margin-top: 30px;">
            نتطلع لرؤيتك في الفعاليات القادمة! 🚀
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            هل تحتاج مساعدة؟ تواصل معنا على
            <a href="mailto:support@hackathon.gov.sa" style="color: #6c757d;">support@hackathon.gov.sa</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const dynamic = 'force-dynamic'
