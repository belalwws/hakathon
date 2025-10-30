import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sendMail } from '@/lib/mailer'

// POST /api/admin/emails/test - Send test email
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'عنوان البريد الإلكتروني مطلوب' }, { status: 400 })
    }

    // Send test email
    const subject = 'اختبار نظام الإيميل - هاكاثون الابتكار التقني'
    const text = `مرحباً،

هذه رسالة اختبار من نظام إدارة هاكاثون الابتكار التقني.

إذا تلقيت هذه الرسالة، فهذا يعني أن نظام الإيميل يعمل بشكل صحيح! ✅

تفاصيل الاختبار:
- التاريخ والوقت: ${new Date().toLocaleString('ar-SA')}
- المرسل: نظام هاكاثون الابتكار التقني
- نوع الرسالة: اختبار إعدادات SMTP

مع أطيب التحيات،
فريق هاكاثون الابتكار التقني`

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>اختبار نظام الإيميل</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 50%, #c3e956 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🧪 اختبار نظام الإيميل</h1>
            <p style="margin: 10px 0 0 0;">هاكاثون الابتكار التقني</p>
        </div>
        <div style="padding: 30px;">
            <p>مرحباً،</p>
            <p>هذه رسالة اختبار من نظام إدارة هاكاثون الابتكار التقني.</p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h2 style="color: #3ab666; margin-top: 0;">✅ نظام الإيميل يعمل بشكل صحيح!</h2>
                <p style="margin: 0;">إذا تلقيت هذه الرسالة، فهذا يعني أن إعدادات SMTP تعمل بنجاح.</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #01645e; margin-top: 0;">📋 تفاصيل الاختبار:</h3>
                <ul style="margin: 0; padding-right: 20px;">
                    <li><strong>التاريخ والوقت:</strong> ${new Date().toLocaleString('ar-SA')}</li>
                    <li><strong>المرسل:</strong> نظام هاكاثون الابتكار التقني</li>
                    <li><strong>نوع الرسالة:</strong> اختبار إعدادات SMTP</li>
                    <li><strong>الحالة:</strong> <span style="color: #3ab666; font-weight: bold;">نجح الإرسال</span></li>
                </ul>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
                <strong style="color: #01645e;">يمكنك الآن استخدام نظام الإيميل بثقة! 🚀</strong>
            </p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666;">© 2024 هاكاثون الابتكار التقني. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
    `

    await sendMail({
      to: email,
      subject,
      text,
      html
    })

    return NextResponse.json({ 
      message: 'تم إرسال الإيميل التجريبي بنجاح',
      sentTo: email,
      sentAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error sending test email:', error)
    
    // Check if it's a mailer configuration error
    if (error instanceof Error) {
      if (error.message.includes('SMTP') || error.message.includes('authentication')) {
        return NextResponse.json({ 
          error: 'خطأ في إعدادات SMTP. تأكد من صحة إعدادات البريد الإلكتروني في ملف البيئة.' 
        }, { status: 500 })
      }
      
      if (error.message.includes('network') || error.message.includes('connection')) {
        return NextResponse.json({ 
          error: 'خطأ في الاتصال. تأكد من اتصالك بالإنترنت وإعدادات الشبكة.' 
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({ 
      error: 'فشل في إرسال الإيميل التجريبي. تحقق من إعدادات SMTP.' 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
