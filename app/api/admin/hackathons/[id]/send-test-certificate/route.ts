import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
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
    const { email, certificateType, previewName, hackathonTitle, hackathonDates } = body

    if (!email || !certificateType || !previewName || !hackathonTitle) {
      return NextResponse.json({ error: 'بيانات غير كاملة' }, { status: 400 })
    }

    console.log(`📧 Sending test certificate email to ${email}...`)

    // Generate certificate
    const certificateData: CertificateData = {
      participantName: previewName,
      hackathonTitle: hackathonTitle,
      teamName: 'فريق تجريبي',
      rank: 1,
      isWinner: false,
      totalScore: 0,
      date: new Date().toLocaleDateString('ar-SA')
    }

    const certificateBuffer = await generateCertificateImage(certificateData, hackathonId, certificateType)
    const certificateFileName = `certificate-test-${certificateType}-${previewName.replace(/\s+/g, '-')}.png`

    // Format dates
    const startDate = hackathonDates?.start 
      ? new Date(hackathonDates.start).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' })
      : '21 أكتوبر'
    const endDate = hackathonDates?.end 
      ? new Date(hackathonDates.end).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })
      : '23 أكتوبر 2025'

    // Generate email content based on certificate type
    let emailSubject = ''
    let emailHtml = ''

    if (certificateType === 'participant') {
      emailSubject = `شهادة مشاركة – ${hackathonTitle}`
      emailHtml = getParticipantCertificateEmail(previewName, hackathonTitle, startDate, endDate)
    } else if (certificateType === 'judge') {
      emailSubject = `شهادة تقدير – ${hackathonTitle}`
      emailHtml = getJudgeCertificateEmail(previewName, hackathonTitle, startDate, endDate)
    } else if (certificateType === 'expert') {
      emailSubject = `شهادة تقدير – ${hackathonTitle}`
      emailHtml = getExpertCertificateEmail(previewName, hackathonTitle, startDate, endDate)
    }

    // Send email
    await transporter.sendMail({
      from: `"${hackathonTitle}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
      to: email,
      subject: `[تجريبي] ${emailSubject}`,
      html: emailHtml,
      attachments: [
        {
          filename: certificateFileName,
          content: certificateBuffer,
          contentType: 'image/png'
        }
      ]
    })

    console.log(`✅ Test certificate email sent successfully to ${email}`)

    return NextResponse.json({
      success: true,
      message: 'تم إرسال الإيميل التجريبي بنجاح'
    })

  } catch (error) {
    console.error('❌ Error sending test certificate:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إرسال الإيميل التجريبي' },
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
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">شهادة مشاركة</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">السادة المشاركون في ${hackathonTitle}،</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته،</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                نتوجه إليك بخالص الشكر والتقدير على مشاركتك الفاعلة في ${hackathonTitle}، الذي أُقيم خلال الفترة من ${startDate} إلى ${endDate}.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                لقد كنت جزءًا مهمًا من رحلة ملهمة مليئة بالإبداع، التعاون، والرغبة الصادقة في إحداث أثر إيجابي في مجال الصحة النفسية.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                يسعدنا أن نُرفق لك شهادة المشاركة تقديرًا لجهودك المتميزة، وأفكارك التي ساهمت في إثراء التجربة وإلهام الآخرين.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                نؤمن أن هذه المشاركة ليست سوى بداية لمسارٍ مليء بالابتكار والعطاء.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
                نتمنى لك دوام النجاح والإبداع، على أمل أن نراك في فعاليات قادمة بإذن الله.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 14px; color: #666;">📎 الشهادة مرفقة مع هذا الإيميل</p>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">مع خالص التقدير،</p>
            <p style="font-size: 16px; font-weight: bold; color: #01645e;">فريق ${hackathonTitle}</p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                هذا إيميل تجريبي للمعاينة فقط
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
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 14px; color: #666;">📎 الشهادة مرفقة مع هذا الإيميل</p>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">مع خالص الشكر والتقدير،</p>
            <p style="font-size: 16px; font-weight: bold; color: #8b5cf6;">اللجنة التنظيمية لـ ${hackathonTitle}</p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                هذا إيميل تجريبي للمعاينة فقط
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
    <div style="max-width: 600px; margin: 0; auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
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
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 14px; color: #666;">📎 الشهادة مرفقة مع هذا الإيميل</p>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">مع خالص التقدير،</p>
            <p style="font-size: 16px; font-weight: bold; color: #0891b2;">اللجنة التنظيمية لـ ${hackathonTitle}</p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                هذا إيميل تجريبي للمعاينة فقط
            </p>
        </div>
    </div>
</body>
</html>
`
}

export const dynamic = 'force-dynamic'

