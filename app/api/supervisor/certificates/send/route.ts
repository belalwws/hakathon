import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { sendTemplatedEmail } from '@/lib/mailer'

const prisma = new PrismaClient()

// POST /api/supervisor/certificates/send - Send certificate via email
export async function POST(request: NextRequest) {
  try {
    // Verify supervisor authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { id, type } = body

    if (!id || !type || !['judge', 'supervisor'].includes(type)) {
      return NextResponse.json({ error: 'بيانات غير كاملة' }, { status: 400 })
    }

    let record: any
    let certificateUrl: string
    let userName: string
    let userEmail: string
    let hackathonTitle: string
    let roleTitle: string

    // Get record based on type
    if (type === 'judge') {
      record = await prisma.judge.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          hackathon: {
            select: {
              title: true
            }
          }
        }
      })
      roleTitle = 'محكم'
    } else {
      record = await prisma.supervisor.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          hackathon: {
            select: {
              title: true
            }
          }
        }
      })
      roleTitle = 'مشرف'
    }

    if (!record) {
      return NextResponse.json({ error: 'السجل غير موجود' }, { status: 404 })
    }

    if (!record.certificateUrl) {
      return NextResponse.json({ error: 'لم يتم رفع الشهادة بعد' }, { status: 400 })
    }

    certificateUrl = record.certificateUrl
    userName = record.user.name
    userEmail = record.user.email
    hackathonTitle = record.hackathon?.title || 'الهاكاثون'
    const hackathonId = record.hackathonId

    // Send email with certificate using template system
    try {
      await sendTemplatedEmail(
        'certificate_delivery',
        userEmail,
        {
          participantName: userName,
          hackathonTitle: hackathonTitle,
          roleTitle: roleTitle,
          certificateUrl: certificateUrl,
          downloadUrl: certificateUrl,
          organizerName: 'فريق الهاكاثون',
          organizerEmail: process.env.MAIL_FROM || 'no-reply@hackathon.com'
        },
        hackathonId
      )
    } catch (emailError) {
      console.error('Failed to send templated email, falling back to direct email:', emailError)
      
      // Fallback: Send direct email if template fails
      const { sendMail } = await import('@/lib/mailer')
      await sendMail({
        to: userEmail,
        subject: `🏆 شهادة تقدير - ${hackathonTitle}`,
        html: getCertificateEmailContent(userName, hackathonTitle, roleTitle, certificateUrl),
        text: `مرحباً ${userName},\n\nنشكرك على مشاركتك كـ ${roleTitle} في ${hackathonTitle}.\n\nيمكنك تحميل شهادتك من الرابط التالي:\n${certificateUrl}\n\nمع أطيب التحيات،\nفريق الهاكاثون`
      })
    }

    // Update record
    const updateData = {
      certificateSent: true,
      certificateSentAt: new Date()
    }

    if (type === 'judge') {
      await prisma.judge.update({
        where: { id },
        data: updateData
      })
    } else {
      await prisma.supervisor.update({
        where: { id },
        data: updateData
      })
    }

    return NextResponse.json({
      message: 'تم إرسال الشهادة بنجاح'
    })

  } catch (error) {
    console.error('Error sending certificate:', error)
    return NextResponse.json(
      { error: 'فشل إرسال الشهادة' },
      { status: 500 }
    )
  }
}

// Email template for certificate
function getCertificateEmailContent(
  userName: string,
  hackathonTitle: string,
  roleTitle: string,
  certificateUrl: string
): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شهادة تقدير</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 50%, #c3e956 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🏆 شهادة تقدير</h1>
        </div>
        <div style="padding: 30px;">
            <p>مرحباً <strong>${userName}</strong>,</p>
            
            <p>نشكرك على مشاركتك المميزة كـ <strong>${roleTitle}</strong> في <strong>${hackathonTitle}</strong>! 🎉</p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #3ab666; margin-top: 0;">📜 شهادتك جاهزة!</h3>
                <p>يمكنك الآن تحميل شهادة التقدير الخاصة بك من الرابط أدناه:</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${certificateUrl}"
                   style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
                    📥 تحميل الشهادة
                </a>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>💡 نصيحة:</strong> يمكنك مشاركة شهادتك على وسائل التواصل الاجتماعي!</p>
            </div>

            <p>نتمنى لك التوفيق في مسيرتك المهنية! 🚀</p>
            
            <p>مع أطيب التحيات،<br>
            <strong>فريق ${hackathonTitle}</strong></p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666; font-size: 14px;">© 2024 منصة هاكاثون الابتكار التقني. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
  `
}

export const dynamic = 'force-dynamic'

