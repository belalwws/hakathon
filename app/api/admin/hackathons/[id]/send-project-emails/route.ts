import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id: hackathonId } = await params

    // Get hackathon with teams and participants
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        teams: {
          include: {
            participants: {
              where: { status: 'approved' as any },
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    const teamsWithMembers = hackathon.teams.filter(team => team.participants.length > 0)

    if (teamsWithMembers.length === 0) {
      return NextResponse.json({ error: 'لا توجد فرق لإرسال الإيميلات إليها' }, { status: 400 })
    }

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    })

    // جمع جميع المشاركين في مصفوفة واحدة
    const allParticipants = []
    for (const team of teamsWithMembers) {
      for (const participant of team.participants) {
        allParticipants.push({ participant, team })
      }
    }

    console.log(`📧 Preparing to send ${allParticipants.length} emails...`)

    // إرسال الإيميلات بشكل متوازي مع تحديد عدد محدود في نفس الوقت
    const BATCH_SIZE = 5 // إرسال 5 إيميلات في نفس الوقت
    let emailsSent = 0
    let emailsFailed = 0

    for (let i = 0; i < allParticipants.length; i += BATCH_SIZE) {
      const batch = allParticipants.slice(i, i + BATCH_SIZE)

      const emailPromises = batch.map(async ({ participant, team }) => {
        try {
          const mailOptions = {
            from: process.env.MAIL_FROM,
            to: participant.user.email,
            subject: `🚀 حان وقت رفع مشروع فريقك - ${hackathon.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; border-radius: 10px; overflow: hidden;">
                <div style="padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px;">🚀 حان وقت رفع المشروع!</h1>
                </div>
                
                <div style="background: white; color: #333; padding: 30px; margin: 0;">
                  <h2 style="color: #01645e; margin-top: 0;">مرحباً ${participant.user.name}،</h2>
                  
                  <p style="font-size: 16px; line-height: 1.6;">
                    نتطلع لرؤية إبداعكم! حان الوقت لرفع العرض التقديمي لمشروع فريقكم <strong>"${team.name}"</strong> في هاكاثون <strong>"${hackathon.title}"</strong>.
                  </p>
                  
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #01645e; margin-top: 0;">📋 ما تحتاج لرفعه:</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                      <li>عنوان فكرة المشروع</li>
                      <li>وصف مختصر للفكرة</li>
                      <li>ملف العرض التقديمي (PowerPoint أو PDF)</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}/participant/dashboard"
                       style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                      🎯 رفع المشروع الآن
                    </a>
                  </div>
                  
                  <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #1976d2;">
                      💡 <strong>نصيحة:</strong> تأكد من أن العرض التقديمي يوضح فكرة مشروعكم بشكل واضح ومقنع للمحكمين.
                    </p>
                  </div>
                  
                  <p style="font-size: 14px; color: #666; margin-bottom: 0;">
                    بالتوفيق لفريقكم! 🌟<br>
                    فريق إدارة الهاكاثون
                  </p>
                </div>
              </div>
            `
          }

          await transporter.sendMail(mailOptions)
          console.log(`✅ Email sent to ${participant.user.email}`)
          return { success: true, email: participant.user.email }
        } catch (error) {
          console.error(`❌ Error sending email to ${participant.user.email}:`, error)
          return { success: false, email: participant.user.email, error: (error as any).message }
        }
      })

      // انتظار إرسال جميع إيميلات هذه المجموعة
      const results = await Promise.all(emailPromises)

      // حساب النتائج
      results.forEach(result => {
        if (result.success) {
          emailsSent++
        } else {
          emailsFailed++
        }
      })

      // انتظار قصير بين المجموعات لتجنب إرهاق الخادم
      if (i + BATCH_SIZE < allParticipants.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // انتظار ثانية واحدة
      }
    }

    const teamsNotified = new Set(allParticipants.map(({ team }) => team.id)).size

    console.log(`📊 Email results: ${emailsSent} successful, ${emailsFailed} failed`)

    return NextResponse.json({
      message: 'تم إرسال إيميلات رفع المشاريع بنجاح',
      emailsSent,
      emailsFailed,
      teamsNotified,
      totalTeams: teamsWithMembers.length,
      totalParticipants: allParticipants.length
    })

  } catch (error) {
    console.error('Error sending project emails:', error)
    return NextResponse.json({ error: 'خطأ في إرسال الإيميلات' }, { status: 500 })
  }
}
