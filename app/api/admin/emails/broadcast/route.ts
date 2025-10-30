import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// Enhanced email sending function
async function sendEmailDirect(to: string, subject: string, html: string) {
  console.log('📧 [sendEmailDirect] Attempting to send email to:', to)
  
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_PASS

  console.log('🔧 [sendEmailDirect] Gmail credentials check:', {
    hasUser: !!gmailUser,
    hasPass: !!gmailPass,
    userEmail: gmailUser
  })

  if (!gmailUser || !gmailPass) {
    console.log('⚠️ [sendEmailDirect] Gmail credentials not configured')
    return { success: false, mocked: true, error: 'Gmail credentials not configured' }
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    })

    console.log('📤 [sendEmailDirect] Sending email...')
    const result = await transporter.sendMail({
      from: `منصة هاكاثون الابتكار التقني <${gmailUser}>`,
      to: to,
      subject: subject,
      html: html
    })
    
    console.log('✅ [sendEmailDirect] Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ [sendEmailDirect] Failed to send email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// POST /api/admin/emails/broadcast - Send broadcast emails
export async function POST(request: NextRequest) {
  try {
    console.log('📧 [broadcast] Starting email broadcast request')
    
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.log('❌ [broadcast] No auth token')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      console.log('❌ [broadcast] Invalid token or not admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('✅ [broadcast] Auth verified, using Prisma client')

    const body = await request.json()
    const { 
      subject,
      message,
      content,
      selectedUsers,
      selectedHackathon,
      includeHackathonDetails = false,
      recipients,
      hackathonId,
      formId
    } = body

    // Handle form email sending
    if (formId) {
      console.log('📋 [broadcast] Form email request detected')
      console.log('📋 [broadcast] Form ID:', formId)
      console.log('📋 [broadcast] Subject:', subject)
      console.log('📋 [broadcast] Recipients:', recipients)
      console.log('📋 [broadcast] Hackathon ID:', hackathonId)
      
      if (!subject || !content) {
        console.log('❌ [broadcast] Missing required data')
        return NextResponse.json({ error: 'البيانات المطلوبة مفقودة' }, { status: 400 })
      }

      let targetUsers = []
      
      if (recipients === 'all') {
        console.log('👥 [broadcast] Fetching all users')
        try {
          targetUsers = await prisma.user.findMany({
            select: { email: true, name: true }
          })
          // Filter out users without valid emails
          targetUsers = targetUsers.filter(user => user.email && user.email.trim() !== '')
        } catch (error) {
          console.error('❌ [broadcast] Error fetching users:', error)
          return NextResponse.json({ error: 'خطأ في جلب المستخدمين' }, { status: 500 })
        }
      } else if (recipients === 'hackathon' && hackathonId) {
        console.log('👥 [broadcast] Fetching hackathon participants')
        try {
          const participants = await prisma.participant.findMany({
            where: {
              hackathonId: hackathonId,
              status: 'approved'
            },
            include: {
              user: {
                select: { email: true, name: true }
              }
            }
          })
          targetUsers = participants.map(p => p.user).filter(u => u.email)
        } catch (dbError) {
          console.error('❌ [broadcast] Database error:', dbError)
          return NextResponse.json({ error: 'خطأ في قاعدة البيانات' }, { status: 500 })
        }
      }
      
      console.log('👥 [broadcast] Found', targetUsers.length, 'target users')

      if (targetUsers.length === 0) {
        return NextResponse.json({ error: 'لا يوجد مستخدمون للرسالة' }, { status: 400 })
      }

      // Send emails using direct method
      console.log('📧 [broadcast] Starting to send emails to', targetUsers.length, 'users')
      const emailPromises = targetUsers.map(async (user: any) => {
        try {
          console.log('📧 [broadcast] Sending email to:', user.email)
          const result = await sendEmailDirect(
            user.email,
            subject,
            content.replace(/\n/g, '<br>')
          )
          
          // Check if email was actually sent or just mocked
          if (result.mocked) {
            console.warn(`📧 [broadcast] Email mocked for ${user.email} (mailer not configured)`)
            return { success: true, email: user.email, mocked: true }
          }
          
          console.log('✅ [broadcast] Email sent successfully to:', user.email)
          return { success: true, email: user.email, messageId: result.messageId }
        } catch (error) {
          console.error(`❌ [broadcast] Failed to send email to ${user.email}:`, error)
          return { success: false, email: user.email, error: error instanceof Error ? error.message : 'خطأ غير معروف' }
        }
      })

      const results = await Promise.all(emailPromises)
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length
      const mocked = results.filter(r => r.mocked).length

      let responseMessage = `تم إرسال ${successful} رسالة بنجاح`
      if (failed > 0) responseMessage += `، فشل ${failed} رسالة`
      if (mocked > 0) responseMessage += `، تم محاكاة ${mocked} رسالة (البريد غير مُعد)`

      return NextResponse.json({
        success: true,
        message: responseMessage,
        details: results,
        stats: {
          total: targetUsers.length,
          successful,
          failed,
          mocked
        }
      })
    }

    // Original broadcast email logic
    if (!subject || !message || !selectedUsers || selectedUsers.length === 0) {
      return NextResponse.json({ error: 'البيانات المطلوبة مفقودة' }, { status: 400 })
    }

    // Get users data
    const users = await prisma.user.findMany({
      where: {
        id: { in: selectedUsers }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    // Get hackathon data if selected
    let hackathon = null
    if (selectedHackathon) {
      hackathon = await prisma.hackathon.findUnique({
        where: { id: selectedHackathon }
      })
    }

    // Send emails to all selected users
    const emailPromises = users.map(async (user: any) => {
      const emailSubject = subject
      
      let emailContent = `مرحباً ${user.name},

${message}

${includeHackathonDetails && hackathon ? `
تفاصيل الهاكاثون:
- العنوان: ${hackathon.title}
- الوصف: ${hackathon.description}
- تاريخ البداية: ${new Date(hackathon.startDate).toLocaleDateString('ar-SA')}
- تاريخ النهاية: ${new Date(hackathon.endDate).toLocaleDateString('ar-SA')}
- موعد انتهاء التسجيل: ${new Date(hackathon.registrationDeadline).toLocaleDateString('ar-SA')}

للتسجيل في الهاكاثون، يرجى زيارة:
${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/hackathons/${hackathon.id}/register-form
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
            <h1 style="margin: 0; font-size: 28px;">📢 رسالة مهمة</h1>
            <p style="margin: 10px 0 0 0;">هاكاثون الابتكار التقني</p>
        </div>
        <div style="padding: 30px;">
            <p>مرحباً <strong>${user.name}</strong>,</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${message.split('\n').map((line: string) => `<p style="margin: 10px 0;">${line}</p>`).join('')}
            </div>
            
            ${includeHackathonDetails && hackathon ? `
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #3ab666; margin-top: 0;">🎯 تفاصيل الهاكاثون:</h3>
                <ul style="margin: 0; padding-right: 20px;">
                    <li><strong>العنوان:</strong> ${hackathon.title}</li>
                    <li><strong>الوصف:</strong> ${hackathon.description}</li>
                    <li><strong>تاريخ البداية:</strong> ${new Date(hackathon.startDate).toLocaleDateString('ar-SA')}</li>
                    <li><strong>تاريخ النهاية:</strong> ${new Date(hackathon.endDate).toLocaleDateString('ar-SA')}</li>
                    <li><strong>موعد انتهاء التسجيل:</strong> ${new Date(hackathon.registrationDeadline).toLocaleDateString('ar-SA')}</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/hackathons/${hackathon.id}/register-form" 
                   style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    سجل الآن في الهاكاثون 🚀
                </a>
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

      try {
        const result = await sendEmailDirect(user.email, emailSubject, emailHtml)
        
        return { 
          success: result.success, 
          email: user.email, 
          messageId: result.messageId, 
          mocked: result.mocked,
          error: result.error 
        }
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error)
        return { success: false, email: user.email, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    })

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    const mocked = results.filter(r => r.mocked).length

    let responseMessage = `تم إرسال ${successful} رسالة بنجاح`
    if (failed > 0) responseMessage += `، فشل ${failed} رسالة`
    if (mocked > 0) responseMessage += `، تم محاكاة ${mocked} رسالة (البريد غير مُعد)`

    return NextResponse.json({ 
      success: true,
      message: responseMessage,
      details: results,
      stats: {
        total: emailPromises.length,
        successful,
        failed,
        mocked
      }
    })

  } catch (error) {
    console.error('❌ [broadcast] Error sending broadcast emails:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Check if it's a mailer configuration error
    if (errorMessage.includes('mailer') || errorMessage.includes('Gmail')) {
      console.log('❌ [broadcast] Mailer configuration error detected')
      return NextResponse.json({ 
        error: 'البريد الإلكتروني غير مُعد بشكل صحيح. يرجى التحقق من إعدادات Gmail.',
        details: errorMessage,
        mailerConfigured: false
      }, { status: 500 })
    }
    
    console.log('❌ [broadcast] General error, returning generic message')
    return NextResponse.json({ 
      error: 'خطأ في إرسال الإيميلات',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
