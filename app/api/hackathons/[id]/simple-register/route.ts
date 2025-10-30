import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, HackathonStatus, ParticipantStatus } from '@prisma/client'
import { sendTemplatedEmail } from '@/lib/mailer'

const prisma = new PrismaClient()

// POST /api/hackathons/[id]/simple-register - Simple registration without password
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const hackathonId = params.id
    const body = await request.json()

    const {
      name,
      email,
      phone,
      city,
      nationality = 'سعودي',
      teamName,
      projectTitle,
      projectDescription,
      githubRepo,
      teamRole,
      experience,
      motivation
    } = body

    // Validate required fields
    if (!name || !email || !phone || !teamRole) {
      return NextResponse.json({ 
        error: 'الحقول المطلوبة: الاسم، البريد الإلكتروني، رقم الهاتف، والدور المفضل' 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'صيغة البريد الإلكتروني غير صحيحة' 
      }, { status: 400 })
    }

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
    if (hackathon.status !== HackathonStatus.published) {
      return NextResponse.json({ 
        error: 'التسجيل غير متاح حالياً لهذا الهاكاثون' 
      }, { status: 400 })
    }

    // Check registration deadline
    if (new Date() > new Date(hackathon.registrationDeadline)) {
      return NextResponse.json({ 
        error: 'انتهى موعد التسجيل لهذا الهاكاثون' 
      }, { status: 400 })
    }

    // Check if hackathon is full
    if (hackathon.maxParticipants && hackathon._count.participants >= hackathon.maxParticipants) {
      return NextResponse.json({ 
        error: 'الهاكاثون ممتلئ. لا يمكن قبول مشاركين جدد' 
      }, { status: 400 })
    }

    // Check if user already registered with this email
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        hackathonId: hackathonId,
        user: {
          email: email
        }
      }
    })

    if (existingParticipant) {
      return NextResponse.json({ 
        error: 'هذا البريد الإلكتروني مسجل مسبقاً في هذا الهاكاثون' 
      }, { status: 400 })
    }

    // Check if user exists in the system
    let user = await prisma.user.findUnique({
      where: { email: email }
    })

    // If user doesn't exist, create a new one (without password)
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name,
          email: email,
          phone: phone,
          city: city || '',
          nationality: nationality,
          role: 'participant',
          // No password field - user can request one later
        }
      })
    } else {
      // Update existing user info if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name,
          phone: phone,
          city: city || user.city,
          nationality: nationality || user.nationality,
        }
      })
    }

    // Create participant record
    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        hackathonId: hackathonId,
        teamName: teamName || null,
        projectTitle: projectTitle || null,
        projectDescription: projectDescription || null,
        githubRepo: githubRepo || null,
        teamRole: teamRole,
        status: ParticipantStatus.pending, // Default to pending for admin review
        registeredAt: new Date(),
        // Store additional info in a JSON field if needed
        additionalInfo: {
          experience: experience || null,
          motivation: motivation || null,
          registrationType: 'simple' // Mark as simple registration
        }
      },
      include: {
        user: true,
        hackathon: true
      }
    })

    console.log('New Simple Registration:', participant)

    // Send confirmation email using template system
    try {
      await sendTemplatedEmail(
        'registration_confirmation',
        email,
        {
          participantName: name,
          participantEmail: email,
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
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      message: 'تم التسجيل بنجاح! سيتم مراجعة طلبك وإرسال تفاصيل إضافية عبر البريد الإلكتروني.',
      participant: {
        id: participant.id,
        name: user.name,
        email: user.email,
        teamRole: participant.teamRole,
        status: participant.status,
        registeredAt: participant.registeredAt
      },
      hackathon: {
        id: hackathon.id,
        title: hackathon.title
      }
    })

  } catch (error) {
    console.error('Simple registration error:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.' 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
