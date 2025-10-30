import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { sendTemplatedEmail } from '@/lib/mailer'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Generate a random password
function generatePassword(length: number = 8): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// POST /api/admin/send-password - Generate and send password to a simple registration user
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { participantId, email } = body

    if (!participantId || !email) {
      return NextResponse.json({ 
        error: 'معرف المشارك والبريد الإلكتروني مطلوبان' 
      }, { status: 400 })
    }

    // Get participant details
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        user: true,
        hackathon: true
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'المشارك غير موجود' }, { status: 404 })
    }

    if (participant.user.email !== email) {
      return NextResponse.json({ 
        error: 'البريد الإلكتروني غير مطابق' 
      }, { status: 400 })
    }

    // Check if user already has a password
    if (participant.user.password) {
      return NextResponse.json({ 
        error: 'المستخدم لديه كلمة مرور بالفعل' 
      }, { status: 400 })
    }

    // Generate a new password
    const newPassword = generatePassword(10)
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user with the new password
    await prisma.user.update({
      where: { id: participant.user.id },
      data: { password: hashedPassword }
    })

    // Send password via email using template system
    try {
      await sendTemplatedEmail(
        'welcome', // Use welcome template or create a new password template
        email,
        {
          participantName: participant.user.name,
          participantEmail: email,
          hackathonTitle: participant.hackathon.title,
          temporaryPassword: newPassword,
          loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login`,
          organizerName: 'فريق الهاكاثون',
          organizerEmail: process.env.MAIL_FROM || 'no-reply@hackathon.com',
          // Additional context for password email
          isPasswordEmail: true,
          passwordInstructions: 'يمكنك الآن تسجيل الدخول باستخدام بريدك الإلكتروني وكلمة المرور المرسلة. ننصحك بتغيير كلمة المرور بعد تسجيل الدخول.'
        },
        participant.hackathon.id
      )
    } catch (emailError) {
      console.error('Failed to send password email:', emailError)
      
      // If email fails, we should revert the password update
      await prisma.user.update({
        where: { id: participant.user.id },
        data: { password: null }
      })
      
      return NextResponse.json({ 
        error: 'فشل في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.' 
      }, { status: 500 })
    }

    console.log(`Password sent to ${email} for participant ${participantId}`)

    return NextResponse.json({
      message: 'تم إنشاء وإرسال كلمة المرور بنجاح',
      participant: {
        id: participant.id,
        name: participant.user.name,
        email: participant.user.email,
        hasPassword: true
      }
    })

  } catch (error) {
    console.error('Error sending password:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في الخادم' 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
