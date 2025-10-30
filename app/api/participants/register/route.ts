import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { saveParticipant } from '@/lib/participants-storage'

// Validation schema for participant registration
const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  nationality: z.string().min(2, 'الجنسية مطلوبة'),
  teamType: z.enum(['individual', 'team']),
  preferredRole: z.string().min(1, 'يجب اختيار الدور المفضل في الفريق'),
  teamPreference: z.string().optional(),
  experience: z.string().optional(),
  motivation: z.string().optional(),
  skills: z.string().optional()
})

// POST /api/participants/register - Register new participant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'بيانات غير صحيحة',
        details: validationResult.error.errors 
      }, { status: 400 })
    }

    const data = validationResult.data

    try {
      // Try to check if email already exists in DB (optional). If Prisma isn't generated, skip.
      try {
        const { prisma } = await import('@/lib/prisma')
        try {
          const existingJudge = await prisma.judge.findFirst({
            where: {
              user: {
                email: data.email
              }
            }
          })

          const existingAdmin = await prisma.admin.findFirst({
            where: {
              user: {
                email: data.email
              }
            }
          })
  
          if (existingJudge || existingAdmin) {
            return NextResponse.json({
              error: 'البريد الإلكتروني مستخدم بالفعل في النظام'
            }, { status: 400 })
          }
        } catch (innerDbError) {
          console.log('Database query failed, continuing with file storage')
        }
      } catch (dbImportError) {
        console.log('Prisma client not available, using file storage')
      }

      // Save participant data to temporary storage
      // Hash password and save participant with file storage
      let passwordHash = ''
      try {
        const { hashPassword } = await import('@/lib/password')
        passwordHash = await hashPassword(data.password)
      } catch (e) {
        return NextResponse.json({ error: 'فشل تشفير كلمة المرور' }, { status: 500 })
      }

      const participant = saveParticipant({
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        city: data.city,
        nationality: data.nationality,
        teamType: data.teamType,
        preferredRole: data.preferredRole,
        teamPreference: data.teamPreference,
        experience: data.experience,
        motivation: data.motivation,
        skills: data.skills
      })

      console.log('New Participant Registration:', participant)

      // Send welcome email
      try {
        const { sendMail } = await import('@/lib/mailer')

        await sendMail({
          to: data.email,
          subject: 'مرحباً بك في منصة هاكاثون الابتكار التقني',
          text: `مرحباً ${data.name},

شكراً لك على التسجيل في منصة هاكاثون الابتكار التقني!

تم إنشاء حسابك بنجاح وهو الآن في انتظار المراجعة. سيتم إشعارك عبر البريد الإلكتروني فور الموافقة على طلبك.

ما يمكنك توقعه:
- مراجعة طلبك خلال 24-48 ساعة
- إشعار بالموافقة أو الرفض عبر البريد الإلكتروني
- عند توفر هاكاثونات جديدة، ستتلقى دعوة للمشاركة

في الوقت الحالي، حسابك في حالة "في انتظار المراجعة". يمكنك تسجيل الدخول لمتابعة حالة طلبك.

مع أطيب التحيات،
فريق هاكاثون الابتكار التقني`,
          html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مرحباً بك</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 50%, #c3e956 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🚀 مرحباً بك!</h1>
            <p style="margin: 10px 0 0 0;">منصة هاكاثون الابتكار التقني</p>
        </div>
        <div style="padding: 30px;">
            <p>مرحباً <strong>${data.name}</strong>,</p>
            <p>شكراً لك على التسجيل في منصة هاكاثون الابتكار التقني!</p>

            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #3ab666; margin-top: 0;">✅ تم إنشاء حسابك بنجاح</h3>
                <p style="margin: 0;">حسابك الآن في انتظار المراجعة من قبل فريقنا.</p>
            </div>

            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #8b7632; margin-top: 0;">⏳ ما يمكنك توقعه:</h3>
                <ul style="margin: 0; padding-right: 20px;">
                    <li>مراجعة طلبك خلال 24-48 ساعة</li>
                    <li>إشعار بالموافقة أو الرفض عبر البريد الإلكتروني</li>
                    <li>عند توفر هاكاثونات جديدة، ستتلقى دعوة للمشاركة</li>
                </ul>
            </div>

            <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #01645e; margin-top: 0;">📋 حالة حسابك الحالية:</h3>
                <p style="margin: 0;"><strong>في انتظار المراجعة</strong> - يمكنك تسجيل الدخول لمتابعة حالة طلبك</p>
            </div>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0;">© 2024 هاكاثون الابتكار التقني. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
          `
        })
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't fail registration if email fails
      }

      return NextResponse.json({
        message: 'تم التسجيل بنجاح! سيتم التواصل معك عند إطلاق هاكاثونات جديدة',
        participantId: participant.id,
        status: 'REGISTERED'
      })

    } catch (error) {
      console.error('Registration error:', error)

      if (error instanceof Error) {
        return NextResponse.json({
          error: error.message
        }, { status: 400 })
      }

      return NextResponse.json({
        error: 'حدث خطأ في التسجيل'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error registering participant:', error)
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ 
        error: 'البريد الإلكتروني مستخدم بالفعل' 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
