import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import { generateCertificateImage, CertificateData } from '@/lib/certificate-pdf'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'racein668@gmail.com',
    pass: process.env.GMAIL_PASS || 'xquiynevjqfbyoxp'
  }
})

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح - الأدمن فقط' }, { status: 403 })
    }

    const body = await request.json()
    const {
      recipientType, // 'participant', 'judge', 'expert'
      recipientId,   // ID of the participant/judge/expert
      hackathonId,
      customEmail    // Optional custom email content
    } = body

    console.log('📦 Received body:', { recipientType, recipientId, hackathonId })

    if (!recipientType || !recipientId || !hackathonId) {
      console.log('❌ Missing data:', { recipientType, recipientId, hackathonId })
      return NextResponse.json({ error: 'بيانات غير كاملة' }, { status: 400 })
    }

    console.log(`📧 Sending individual certificate: Type=${recipientType}, ID=${recipientId}, Hackathon=${hackathonId}`)

    // Get hackathon details
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    const startDate = hackathon.startDate 
      ? new Date(hackathon.startDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' })
      : '21 أكتوبر'
    const endDate = hackathon.endDate 
      ? new Date(hackathon.endDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })
      : '23 أكتوبر 2025'

    let recipientName = ''
    let recipientEmail = ''
    let certificateType = recipientType
    let emailSubject = ''
    let emailHtml = ''

    if (recipientType === 'participant') {
      // Get participant details
      const participant = await prisma.participant.findUnique({
        where: { id: recipientId },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          team: {
            include: {
              scores: true
            }
          }
        }
      })

      if (!participant) {
        return NextResponse.json({ error: 'المشارك غير موجود' }, { status: 404 })
      }

      recipientName = participant.user.name
      recipientEmail = participant.user.email

      // Calculate team rank
      const teams = await prisma.team.findMany({
        where: { hackathonId },
        include: {
          scores: true
        }
      })

      const teamsWithScores = teams.map(team => ({
        ...team,
        totalScore: team.scores.reduce((sum, score) => sum + score.score, 0)
      })).sort((a, b) => b.totalScore - a.totalScore)

      const teamIndex = teamsWithScores.findIndex(t => t.id === participant.teamId)
      const rank = teamIndex + 1
      const isWinner = rank <= 3
      const totalScore = teamsWithScores[teamIndex]?.totalScore || 0

      // Generate certificate
      const certificateData: CertificateData = {
        participantName: recipientName,
        hackathonTitle: hackathon.title,
        teamName: participant.team?.name || 'مشارك فردي',
        rank,
        isWinner,
        totalScore,
        date: new Date().toLocaleDateString('ar-SA')
      }

      const certificateBuffer = await generateCertificateImage(certificateData, hackathonId, 'participant')
      const certificateFileName = `certificate-participant-${recipientName.replace(/\s+/g, '-')}.png`

      emailSubject = customEmail?.subject || `شهادة مشاركة – ${hackathon.title}`
      emailHtml = customEmail?.content || getParticipantCertificateEmail(recipientName, hackathon.title, startDate, endDate)

      // Send email
      await transporter.sendMail({
        from: `"${hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            filename: certificateFileName,
            content: certificateBuffer,
            contentType: 'image/png'
          }
        ]
      })

    } else if (recipientType === 'judge') {
      // Get judge application details
      const judgeApp = await prisma.judgeApplication.findUnique({
        where: { id: recipientId }
      })

      if (!judgeApp) {
        return NextResponse.json({ error: 'المحكم غير موجود' }, { status: 404 })
      }

      recipientName = judgeApp.name
      recipientEmail = judgeApp.email

      // Generate certificate
      const certificateData: CertificateData = {
        participantName: recipientName,
        hackathonTitle: hackathon.title,
        teamName: '',
        rank: 0,
        isWinner: false,
        totalScore: 0,
        date: new Date().toLocaleDateString('ar-SA')
      }

      const certificateBuffer = await generateCertificateImage(certificateData, hackathonId, 'judge')
      const certificateFileName = `certificate-judge-${recipientName.replace(/\s+/g, '-')}.png`

      emailSubject = customEmail?.subject || `شهادة تقدير – ${hackathon.title}`
      emailHtml = customEmail?.content || getJudgeCertificateEmail(recipientName, hackathon.title, startDate, endDate)

      // Send email
      await transporter.sendMail({
        from: `"${hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            filename: certificateFileName,
            content: certificateBuffer,
            contentType: 'image/png'
          }
        ]
      })

    } else if (recipientType === 'expert') {
      // Get expert application details
      const expertApp = await prisma.expertApplication.findUnique({
        where: { id: recipientId }
      })

      if (!expertApp) {
        return NextResponse.json({ error: 'الخبير غير موجود' }, { status: 404 })
      }

      recipientName = expertApp.name
      recipientEmail = expertApp.email

      // Generate certificate
      const certificateData: CertificateData = {
        participantName: recipientName,
        hackathonTitle: hackathon.title,
        teamName: '',
        rank: 0,
        isWinner: false,
        totalScore: 0,
        date: new Date().toLocaleDateString('ar-SA')
      }

      const certificateBuffer = await generateCertificateImage(certificateData, hackathonId, 'expert')
      const certificateFileName = `certificate-expert-${recipientName.replace(/\s+/g, '-')}.png`

      emailSubject = customEmail?.subject || `شهادة تقدير – ${hackathon.title}`
      emailHtml = customEmail?.content || getExpertCertificateEmail(recipientName, hackathon.title, startDate, endDate)

      // Send email
      await transporter.sendMail({
        from: `"${hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            filename: certificateFileName,
            content: certificateBuffer,
            contentType: 'image/png'
          }
        ]
      })
    }

    console.log(`✅ Certificate sent successfully to ${recipientEmail}`)

    return NextResponse.json({
      success: true,
      message: `تم إرسال الشهادة بنجاح إلى ${recipientName} (${recipientEmail})`
    })

  } catch (error: any) {
    console.error('❌ Error sending individual certificate:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ في إرسال الشهادة' },
      { status: 500 }
    )
  }
}

function getParticipantCertificateEmail(
  name: string,
  hackathonTitle: string,
  startDate: string,
  endDate: string
): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شهادة مشاركة</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">شهادة مشاركة</h1>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">السادة المشاركون في ${hackathonTitle}،</p>
            <p style="font-size: 16px; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته،</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                نتوجه إليك بخالص الشكر والتقدير على مشاركتك الفاعلة في ${hackathonTitle}، الذي أُقيم في الفترة من ${startDate} إلى ${endDate}.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                لقد كنت جزءًا مهمًا من رحلة ملهمة مليئة بالإبداع، التعاون، والرغبة الصادقة في إحداث تأثير إيجابي في مجال الصحة النفسية.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                يسعدنا أن نُرفق لك شهادة المشاركة تقديرًا لجهودك المتميزة ومساهمتك القيمة في إنجاح هذا الحدث.
            </p>
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px solid #01645e;">
                <p style="font-size: 14px; color: #01645e; margin: 0;">📎 الشهادة مرفقة مع هذا الإيميل</p>
            </div>
            <p style="font-size: 16px; margin-top: 30px;">مع خالص التقدير،</p>
            <p style="font-size: 16px; font-weight: bold; color: #01645e;">فريق ${hackathonTitle}</p>
        </div>
        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                ${new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
        </div>
    </div>
</body>
</html>
`
}

function getJudgeCertificateEmail(
  name: string,
  hackathonTitle: string,
  startDate: string,
  endDate: string
): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شهادة تقدير</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">شهادة تقدير</h1>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">الأستاذ/ ${name} المحترم،</p>
            <p style="font-size: 16px; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته،</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                يتقدم فريق ${hackathonTitle} بجزيل الشكر والتقدير لجهودكم المتميزة ومساهمتكم الفعّالة كعضو في لجنة التحكيم.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                يسعدنا أن نُرفق لكم شهادة التقدير عرفانًا بدوركم المؤثر وإسهاماتكم القيمة.
            </p>
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px solid #8b5cf6;">
                <p style="font-size: 14px; color: #8b5cf6; margin: 0;">📎 الشهادة مرفقة مع هذا الإيميل</p>
            </div>
            <p style="font-size: 16px; margin-top: 30px;">مع خالص الشكر والتقدير،</p>
            <p style="font-size: 16px; font-weight: bold; color: #8b5cf6;">اللجنة التنظيمية لـ ${hackathonTitle}</p>
        </div>
    </div>
</body>
</html>
`
}

function getExpertCertificateEmail(
  name: string,
  hackathonTitle: string,
  startDate: string,
  endDate: string
): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شهادة تقدير</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #0891b2 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">شهادة تقدير</h1>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">الأستاذ/ ${name} المحترم،</p>
            <p style="font-size: 16px; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته،</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                يتقدم فريق ${hackathonTitle} بخالص الشكر والتقدير لجهودكم القيّمة ومساهمتكم الفعّالة كعضو في لجنة الخبراء.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                يسعدنا أن نُرفق لكم شهادة التقدير، عرفانًا بدوركم الملهم وجهودكم المثمرة.
            </p>
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px solid #0891b2;">
                <p style="font-size: 14px; color: #0891b2; margin: 0;">📎 الشهادة مرفقة مع هذا الإيميل</p>
            </div>
            <p style="font-size: 16px; margin-top: 30px;">مع خالص التقدير،</p>
            <p style="font-size: 16px; font-weight: bold; color: #0891b2;">اللجنة التنظيمية لـ ${hackathonTitle}</p>
        </div>
    </div>
</body>
</html>
`
}

export const dynamic = 'force-dynamic'

