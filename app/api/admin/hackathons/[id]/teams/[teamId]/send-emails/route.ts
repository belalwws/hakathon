import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
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

// POST /api/admin/hackathons/[id]/teams/[teamId]/send-emails - Send emails to team members
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const params = await context.params
    const { teamId } = params
    
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
    const team = await prisma.team.findUnique({
      where: {
        id: teamId
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
      return NextResponse.json({ error: 'لا توجد أعضاء في الفريق' }, { status: 400 })
    }

    // Prepare team members list for email
    // By default, only show names. Roles are shown if explicitly set by user.
    const teamMembersList = team.participants.map(member => {
      const role = member.user.preferredRole
      return role ? `${member.user.name} (${role})` : member.user.name
    }).join('\n')

    // Send emails to all team members using templated email system
    const { sendTemplatedEmail } = await import('@/lib/mailer')
    
    const emailPromises = team.participants.map(async (member) => {
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

        console.log(`✅ Team details email sent to ${member.user.email}`)
        return { success: true, email: member.user.email }
      } catch (error) {
        console.error(`❌ Failed to send email to ${member.user.email}:`, error)
        return { success: false, email: member.user.email, error: (error as any).message }
      }
    })

    const emailResults = await Promise.all(emailPromises)
    const successfulEmails = emailResults.filter(r => r.success).length
    const failedEmails = emailResults.filter(r => !r.success).length

    console.log(`📊 Team email results: ${successfulEmails} successful, ${failedEmails} failed`)

    return NextResponse.json({
      message: `تم إرسال الإيميلات بنجاح`,
      emailsSent: successfulEmails,
      emailsFailed: failedEmails,
      teamName: team.name
    })

  } catch (error) {
    console.error('❌ Error sending team emails:', error)
    return NextResponse.json({ error: 'خطأ في إرسال الإيميلات' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
