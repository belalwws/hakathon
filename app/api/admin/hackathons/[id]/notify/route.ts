import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import nodemailer from 'nodemailer'
import { PrismaClient, ParticipantStatus, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/admin/hackathons/[id]/notify - Send notification emails about hackathon
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 Starting notify API...')
    
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.log('❌ No token found')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      console.log('❌ Invalid token or not admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('✅ Auth verified for admin:', payload.email)

    const resolvedParams = await params
    const hackathonId = resolvedParams.id
    console.log('📋 Hackathon ID:', hackathonId)
    
    const body = await request.json()
    const { 
      targetAudience, 
      filters = {},   
      subject,
      message,
      includeHackathonDetails = true
    } = body

    console.log('📧 Email request:', { targetAudience, subject: subject?.substring(0, 50) })

    // Get hackathon details
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      console.log('❌ Hackathon not found')
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    console.log('✅ Hackathon found:', hackathon.title)

    let targetUsers = []

    if (targetAudience === 'approved') {
      // المشاركين المقبولين في هذا الهاكاثون فقط
      const approvedParticipants = await prisma.participant.findMany({
        where: {
          hackathonId: hackathonId,
          status: ParticipantStatus.approved
        },
        include: {
          user: true
        }
      })

      targetUsers = approvedParticipants.map((p: any) => p.user)
      console.log('👥 Found approved participants in this hackathon:', targetUsers.length)
    } else if (targetAudience === 'participants') {
      // جميع المشاركين في هذا الهاكاثون (مقبول أو مرفوض أو معلق)
      const allParticipants = await prisma.participant.findMany({
        where: {
          hackathonId: hackathonId
        },
        include: {
          user: true
        }
      })

      targetUsers = allParticipants.map((p: any) => p.user)
      console.log('👥 Found all participants in this hackathon:', targetUsers.length)
    } else if (targetAudience === 'all') {
      // جميع المستخدمين المسجلين في المنصة
      const allUsers = await prisma.user.findMany({
        where: {
          role: UserRole.participant // فقط المستخدمين العاديين، مش الأدمن أو المحكمين
        }
      })
      targetUsers = allUsers
      console.log('👥 Found all users in platform:', targetUsers.length)
    } else {
      // فلترة حسب المدينة أو الجنسية من المشاركين
      let participantQuery: any = {
        hackathonId: hackathonId
      }

      if (targetAudience === 'city' && filters.city) {
        participantQuery.user = {
          city: filters.city
        }
      }

      if (targetAudience === 'nationality' && filters.nationality) {
        participantQuery.user = {
          nationality: filters.nationality
        }
      }

      const participants = await prisma.participant.findMany({
        where: participantQuery,
        include: {
          user: true
        }
      })

      targetUsers = participants.map((p: any) => p.user)
      console.log('👥 Found filtered participants:', targetUsers.length)
    }

    if (targetUsers.length === 0) {
      console.log('❌ No target users found')
      return NextResponse.json({ 
        message: 'لا توجد مستخدمين يطابقون المعايير المحددة',
        sentCount: 0
      })
    }

    // Gmail credentials (hardcoded for now to fix the issue)
    const gmailUser = 'racein668@gmail.com'
    const gmailPass = 'gpbyxbbvrzfyluqt'

    console.log('🔍 Using hardcoded Gmail credentials')
    console.log('🔍 GMAIL_USER:', gmailUser)
    console.log('🔍 GMAIL_PASS:', gmailPass ? 'SET' : 'NOT SET')

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    })

    // Send emails
    let successCount = 0
    let failureCount = 0

    for (const user of targetUsers) {
      try {
        const emailSubject = subject || `إشعار من ${hackathon.title}`
        const emailContent = `مرحباً ${user.name},

${message}

${includeHackathonDetails ? `
تفاصيل الهاكاثون:
- العنوان: ${hackathon.title}
- الوصف: ${hackathon.description}
- تاريخ البداية: ${new Date(hackathon.startDate).toLocaleDateString('ar-SA')}
- تاريخ النهاية: ${new Date(hackathon.endDate).toLocaleDateString('ar-SA')}
- موعد انتهاء التسجيل: ${new Date(hackathon.registrationDeadline).toLocaleDateString('ar-SA')}

للتسجيل في الهاكاثون، يرجى زيارة:
${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}/hackathons/${hackathon.id}/register-form
` : ''}

مع أطيب التحيات،
فريق هاكاثون الابتكار التقني`

        const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${emailSubject}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 50%, #c3e956 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 ${hackathon.title}</h1>
        </div>
        <div style="padding: 30px;">
            <p>مرحباً <strong>${user.name}</strong>,</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${message.split('\n').map((line: string) => `<p style="margin: 10px 0;">${line}</p>`).join('')}
            </div>

            ${includeHackathonDetails ? `
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #3ab666; margin-top: 0;">📅 تفاصيل الهاكاثون:</h3>
                <ul style="margin: 0; padding-right: 20px;">
                    <li><strong>العنوان:</strong> ${hackathon.title}</li>
                    <li><strong>الوصف:</strong> ${hackathon.description}</li>
                    <li><strong>تاريخ البداية:</strong> ${new Date(hackathon.startDate).toLocaleDateString('ar-SA')}</li>
                    <li><strong>تاريخ النهاية:</strong> ${new Date(hackathon.endDate).toLocaleDateString('ar-SA')}</li>
                    <li><strong>موعد انتهاء التسجيل:</strong> ${new Date(hackathon.registrationDeadline).toLocaleDateString('ar-SA')}</li>
                </ul>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}/hackathons/${hackathon.id}/register-form"
                       style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                        🚀 سجل الآن
                    </a>
                </div>
            </div>
            ` : ''}
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0;">© 2024 هاكاثون الابتكار التقني. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
        `

        await transporter.sendMail({
          from: `"${hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
          to: user.email,
          subject: emailSubject,
          text: emailContent,
          html: emailHtml
        })

        console.log(`✅ Email sent to: ${user.email}`)
        successCount++
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${user.email}:`, emailError)
        failureCount++
      }
    }

    console.log(`📊 Email sending complete: ${successCount} success, ${failureCount} failures`)

    return NextResponse.json({ 
      message: `تم إرسال ${successCount} إيميل بنجاح${failureCount > 0 ? ` (فشل في إرسال ${failureCount})` : ''}`,
      sentCount: successCount,
      failureCount,
      targetAudience,
      hackathonTitle: hackathon.title
    })

  } catch (error) {
    console.error('💥 Error in notify API:', error)
    return NextResponse.json({ 
      error: 'خطأ في إرسال الإشعارات',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
