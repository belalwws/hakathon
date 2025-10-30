import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, HackathonStatus, UserRole, ParticipantStatus } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'racein668@gmail.com',
    pass: process.env.GMAIL_PASS || 'gpbyxbbvrzfyluqt'
  }
})



// POST /api/hackathons/[id]/register - Register for a hackathon
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'جلسة غير صالحة' }, { status: 401 })
    }

    const hackathonId = params.id

    // Get hackathon details
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        _count: {
          select: {
            participants: true
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Check if hackathon is open for registration
    if (hackathon.status !== HackathonStatus.open) {
      return NextResponse.json({
        error: 'التسجيل غير متاح لهذا الهاكاثون حالياً'
      }, { status: 400 })
    }

    // Check registration deadline
    const now = new Date()
    const deadline = new Date(hackathon.registrationDeadline)

    if (now > deadline) {
      return NextResponse.json({
        error: 'انتهى موعد التسجيل لهذا الهاكاثون'
      }, { status: 400 })
    }

    // Check participant limit
    if (hackathon.maxParticipants && hackathon._count.participants >= hackathon.maxParticipants) {
      return NextResponse.json({
        error: 'تم الوصول للحد الأقصى من المشاركين'
      }, { status: 400 })
    }

    const body = await request.json()
    const { teamName, projectTitle, projectDescription, githubRepo, teamRole } = body

    // Validate required fields
    if (!teamRole) {
      return NextResponse.json({
        error: 'يجب اختيار دور في الفريق'
      }, { status: 400 })
    }

    try {
      // Check if user already registered for this hackathon
      const existingParticipation = await prisma.participant.findUnique({
        where: {
          userId_hackathonId: {
            userId: payload.userId,
            hackathonId: hackathonId
          }
        }
      })

      if (existingParticipation) {
        return NextResponse.json({
          error: 'أنت مسجل بالفعل في هذا الهاكاثون'
        }, { status: 400 })
      }

      // First, ensure user exists in the database
      let user = await prisma.user.findUnique({
        where: { id: payload.userId }
      })

      if (!user) {
        // Create user if doesn't exist
        user = await prisma.user.create({
          data: {
            id: payload.userId,
            email: payload.email,
            name: payload.name,
            role: UserRole.participant, // Use correct enum value
            password_hash: 'temp_hash_' + Date.now() // Temporary hash for OAuth users
          }
        })
      }

      // Register user for hackathon
      const participation = await prisma.participant.create({
        data: {
          userId: payload.userId,
          hackathonId: hackathonId,
          teamName: teamName || null,
          projectTitle: projectTitle || null,
          projectDescription: projectDescription || null,
          githubRepo: githubRepo || null,
          teamRole: teamRole,
          status: ParticipantStatus.pending,
          registeredAt: new Date()
        }
      })

      // Send confirmation email
      console.log(`📧 Sending registration confirmation email to ${payload.email}`)

      try {
        // Use the new templated email system
        const { sendTemplatedEmail } = await import('@/lib/mailer')

        await sendTemplatedEmail(
          'registration_confirmation',
          payload.email,
          {
            participantName: user.name,
            participantEmail: payload.email,
            hackathonTitle: hackathon.title,
            hackathonDate: hackathon.startDate.toLocaleDateString('ar-SA'),
            hackathonTime: hackathon.startDate.toLocaleTimeString('ar-SA'),
            hackathonLocation: 'سيتم الإعلان عنه قريباً',
            registrationDate: new Date().toLocaleDateString('ar-SA'),
            organizerName: 'فريق الهاكاثون',
            organizerEmail: process.env.MAIL_FROM || 'no-reply@hackathon.com',
            teamRole: teamRole,
            teamName: teamName || 'غير محدد',
            projectTitle: projectTitle || 'غير محدد'
          },
          hackathon.id
        )
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the registration if email fails
      }

      return NextResponse.json({
        message: 'تم التسجيل بنجاح! سيتم مراجعة طلبك قريباً.',
        participation: {
          id: participation.id,
          hackathonId: participation.hackathonId,
          teamName: participation.teamName,
          projectTitle: participation.projectTitle,
          status: participation.status,
          registeredAt: participation.registeredAt
        }
      })

    } catch (registrationError) {
      console.error('Registration error:', registrationError)
      return NextResponse.json({
        error: 'حدث خطأ في التسجيل. يرجى المحاولة مرة أخرى.'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error registering for hackathon:', error)

    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({
          error: 'أنت مسجل بالفعل في هذا الهاكاثون'
        }, { status: 400 })
      }

      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({
          error: 'خطأ في البيانات. تأكد من صحة معرف الهاكاثون.'
        }, { status: 400 })
      }

      console.error('Detailed error:', error.message)
    }

    return NextResponse.json({
      error: 'خطأ في التسجيل للهاكاثون. يرجى المحاولة مرة أخرى.'
    }, { status: 500 })
  }
}
