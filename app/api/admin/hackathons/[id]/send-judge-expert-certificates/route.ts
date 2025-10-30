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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح - الأدمن فقط' }, { status: 403 })
    }

    const hackathonId = params.id
    const body = await request.json()
    const { certificateType } = body // 'judge' or 'expert'

    if (!certificateType || !['judge', 'expert'].includes(certificateType)) {
      return NextResponse.json({ error: 'نوع الشهادة غير صحيح' }, { status: 400 })
    }

    console.log(`📧 Starting to send ${certificateType} certificates for hackathon ${hackathonId}...`)

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

    let recipients: Array<{ name: string; email: string }> = []
    let successCount = 0
    let failureCount = 0
    const results: Array<{ name: string; email: string; status: string; error?: string }> = []

    if (certificateType === 'judge') {
      // Get all approved judge applications for this hackathon
      const judgeApplications = await prisma.judgeApplication.findMany({
        where: {
          hackathonId,
          status: 'approved'
        }
      })

      recipients = judgeApplications.map(app => ({
        name: app.name,
        email: app.email
      }))

      console.log(`📋 Found ${recipients.length} approved judges`)

    } else if (certificateType === 'expert') {
      // Get all approved expert applications for this hackathon
      const expertApplications = await prisma.expertApplication.findMany({
        where: {
          hackathonId,
          status: 'approved'
        }
      })

      recipients = expertApplications.map(app => ({
        name: app.name,
        email: app.email
      }))

      console.log(`📋 Found ${recipients.length} approved experts`)
    }

    if (recipients.length === 0) {
      return NextResponse.json({
        message: `لا يوجد ${certificateType === 'judge' ? 'محكمين' : 'خبراء'} معتمدين لهذا الهاكاثون`,
        successCount: 0,
        failureCount: 0,
        results: []
      })
    }

    // Send certificates to all recipients
    for (const recipient of recipients) {
      try {
        console.log(`📧 Sending certificate to ${recipient.name} (${recipient.email})...`)

        // Generate certificate
        const certificateData: CertificateData = {
          participantName: recipient.name,
          hackathonTitle: hackathon.title,
          teamName: '',
          rank: 0,
          isWinner: false,
          totalScore: 0,
          date: new Date().toLocaleDateString('ar-SA')
        }

        const certificateBuffer = await generateCertificateImage(certificateData, hackathonId, certificateType)
        const certificateFileName = `certificate-${certificateType}-${recipient.name.replace(/\s+/g, '-')}.png`

        // Generate email content
        const emailSubject = `شهادة تقدير – ${hackathon.title}`
        const emailHtml = certificateType === 'judge' 
          ? getJudgeCertificateEmail(recipient.name, hackathon.title, startDate, endDate)
          : getExpertCertificateEmail(recipient.name, hackathon.title, startDate, endDate)

        // Send email
        await transporter.sendMail({
          from: `"${hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
          to: recipient.email,
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

        console.log(`✅ Certificate sent successfully to ${recipient.email}`)
        successCount++
        results.push({
          name: recipient.name,
          email: recipient.email,
          status: 'success'
        })

      } catch (error: any) {
        console.error(`❌ Failed to send certificate to ${recipient.email}:`, error)
        failureCount++
        results.push({
          name: recipient.name,
          email: recipient.email,
          status: 'failed',
          error: error.message
        })
      }
    }

    console.log(`✅ Finished sending certificates. Success: ${successCount}, Failed: ${failureCount}`)

    return NextResponse.json({
      success: true,
      message: `تم إرسال ${successCount} شهادة بنجاح، فشل في إرسال ${failureCount} شهادة`,
      successCount,
      failureCount,
      results
    })

  } catch (error) {
    console.error('❌ Error sending certificates:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إرسال الشهادات' },
      { status: 500 }
    )
  }
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
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">شهادة تقدير</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">الأستاذ/ ${name} المحترم،</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته،</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                يتقدم فريق ${hackathonTitle} بجزيل الشكر والتقدير لجهودكم المتميزة ومساهمتكم الفعّالة كعضو في لجنة التحكيم خلال فعاليات ${hackathonTitle}، الذي أُقيم في الفترة من ${startDate} إلى ${endDate}.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                لقد كان لخبرتكم القيّمة ومكانتكم الأكاديمية والمهنية أثر بالغ في إثراء عملية التقييم، وضمان اختيار المشاريع الأكثر تميزًا وإبداعًا، بما يحقق الأهداف المرجوة من هذا الحدث ويعزز أثره في دعم الصحة النفسية وجودة الحياة.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                يسعدنا أن نُرفق لكم شهادة التقدير عرفانًا بدوركم المؤثر وإسهاماتكم القيمة خلال الهاكاثون.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
                نتمنى لكم دوام التوفيق والتميز، وأن تستمر جهودكم الملهمة في دعم المبادرات الهادفة إلى خدمة المجتمع.
            </p>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px solid #8b5cf6;">
                <p style="font-size: 14px; color: #8b5cf6; margin: 0;">📎 الشهادة مرفقة مع هذا الإيميل</p>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">مع خالص الشكر والتقدير،</p>
            <p style="font-size: 16px; font-weight: bold; color: #8b5cf6;">اللجنة التنظيمية لـ ${hackathonTitle}</p>
        </div>
        
        <!-- Footer -->
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
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0891b2 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">شهادة تقدير</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">الأستاذ/ ${name} المحترم،</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته،</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                يتقدم فريق ${hackathonTitle} بخالص الشكر والتقدير لجهودكم القيّمة ومساهمتكم الفعّالة كعضو في لجنة الخبراء خلال فعاليات ${hackathonTitle}، الذي أُقيم في الفترة من ${startDate} إلى ${endDate}.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                لقد كان لعطائكم وإرشادكم الأثر الكبير في تمكين الفرق المشاركة، وتوجيهها نحو تطوير أفكار مبتكرة قابلة للتنفيذ، بما يسهم في تعزيز الوعي بالصحة النفسية ودعم جودة الحياة.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                يسعدنا أن نُرفق لكم شهادة التقدير، عرفانًا بدوركم الملهم وجهودكم المثمرة خلال الهاكاثون.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
                نتمنى لكم دوام التوفيق والعطاء، وأن تستمر مسيرتكم الحافلة بالتميز والإلهام.
            </p>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px solid #0891b2;">
                <p style="font-size: 14px; color: #0891b2; margin: 0;">📎 الشهادة مرفقة مع هذا الإيميل</p>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">مع خالص التقدير،</p>
            <p style="font-size: 16px; font-weight: bold; color: #0891b2;">اللجنة التنظيمية لـ ${hackathonTitle}</p>
        </div>
        
        <!-- Footer -->
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

export const dynamic = 'force-dynamic'

