import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Email transporter configuration
function getTransporter() {
  const gmailUser = process.env.GMAIL_USER || process.env.MAIL_USER
  const gmailPass = process.env.GMAIL_PASS || process.env.MAIL_PASS

  if (!gmailUser || !gmailPass) {
    throw new Error('Gmail credentials not configured')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  })
}

// POST /api/supervisor/hackathons/[id]/teams/[teamId]/send-emails - Send emails to all team members
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId, teamId } = params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // Verify supervisor is assigned to this hackathon
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          hackathonId: hackathonId,
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json({ 
          error: "غير مصرح - لست مشرفاً على هذا الهاكاثون" 
        }, { status: 403 })
      }

      // Check permissions
      const permissions = supervisor.permissions as any
      if (permissions && permissions.canSendMessages === false) {
        return NextResponse.json({ 
          error: "ليس لديك صلاحية إرسال الرسائل" 
        }, { status: 403 })
      }
    }

    // Get custom email content from request body (optional)
    let customSubject: string | undefined
    let customMessage: string | undefined
    let pdfLink: string | undefined
    let additionalNotes: string | undefined
    
    try {
      const body = await request.json()
      customSubject = body.customSubject
      customMessage = body.customMessage
      pdfLink = body.pdfLink
      additionalNotes = body.additionalNotes
    } catch (e) {
      // No body sent, use defaults
      console.log('📧 [send-emails] No custom content provided, using defaults')
    }

    // Get team with members and hackathon info
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        hackathonId: hackathonId
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                preferredRole: true
              }
            }
          }
        },
        hackathon: {
          select: {
            title: true
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'الفريق غير موجود' }, { status: 404 })
    }

    if (team.participants.length === 0) {
      return NextResponse.json({ error: 'لا يوجد أعضاء في هذا الفريق' }, { status: 400 })
    }

    // Prepare team members list
    // By default, only show names. Roles are shown if explicitly set by user.
    const teamMembersList = team.participants.map((member: any) => {
      const role = member.user.preferredRole
      return role ? `${member.user.name} (${role})` : member.user.name
    }).join('\n')

    // Send emails to all team members using templated email system
    const { sendTemplatedEmail } = await import('@/lib/mailer')
    let emailsSent = 0
    
    const emailPromises = team.participants.map(async (member: any) => {
      try {
        console.log(`� Sending team details email to ${member.user.email}`)
        
        // Use the templated email system to get the template from database
        await sendTemplatedEmail(
          'team_details',
          member.user.email,
          {
            participantName: member.user.name,
            hackathonTitle: team.hackathon.title,
            teamName: team.name,
            teamMembers: teamMembersList,
            // Optional custom fields for template variables
            customSubject: customSubject, // Will be used in template subject if provided
            customMessage: customMessage,
            pdfLink: pdfLink,
            additionalNotes: additionalNotes
          },
          team.hackathonId
        )
        
        emailsSent++
        console.log(`✅ Team details email sent to ${member.user.email}`)
      } catch (error) {
        console.error(`❌ Failed to send email to ${member.user.email}:`, error)
      }
    })

    await Promise.all(emailPromises)

    return NextResponse.json({
      message: `تم إرسال الإيميلات بنجاح`,
      emailsSent
    })

  } catch (error) {
    console.error('Error sending team emails:', error)
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف'

    // Check if it's a mailer configuration error
    const mailUser = process.env.MAIL_USER || process.env.GMAIL_USER
    const mailPass = process.env.MAIL_PASS || process.env.GMAIL_PASS

    if (errorMessage.includes('MAIL_USER') || errorMessage.includes('MAIL_PASS') || errorMessage.includes('GMAIL') || !mailUser || !mailPass) {
      return NextResponse.json({
        error: 'البريد الإلكتروني غير مُعد بشكل صحيح. يرجى التحقق من إعدادات Gmail في ملف .env',
        details: 'MAIL_USER/GMAIL_USER و MAIL_PASS/GMAIL_PASS مطلوبان',
        mailerConfigured: false,
        hasMailUser: !!mailUser,
        hasMailPass: !!mailPass
      }, { status: 500 })
    }

    return NextResponse.json({
      error: 'خطأ في إرسال الإيميلات',
      details: errorMessage
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'