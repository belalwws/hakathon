import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'racein668@gmail.com',
    pass: process.env.GMAIL_PASS || 'gpbyxbbvrzfyluqt'
  }
})

// DELETE /api/admin/hackathons/[id]/teams/[teamId]/members/[participantId] - Remove member from team
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string; participantId: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId, teamId, participantId } = params

    // Check if participant exists and is in the team
    const participant = await prisma.participant.findFirst({
      where: {
        id: participantId,
        hackathonId: hackathonId,
        teamId: teamId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        team: {
          select: {
            name: true
          }
        }
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'العضو غير موجود في هذا الفريق' }, { status: 404 })
    }

    // Remove participant from team
    await prisma.participant.update({
      where: {
        id: participantId
      },
      data: {
        teamId: null
      }
    })

    // Get updated team information
    const updatedTeam = await prisma.team.findUnique({
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

    if (updatedTeam) {
      // Send email notification to all remaining team members about the change
      await sendTeamUpdateEmails(updatedTeam, `تم إزالة ${participant.user.name} من الفريق`)
      
      // Send email to the removed participant
      await sendRemovedFromTeamEmail(
        participant.user.email,
        participant.user.name,
        participant.team?.name || 'الفريق',
        updatedTeam.hackathon.title
      )
    }

    return NextResponse.json({
      message: `تم إزالة ${participant.user.name} من ${participant.team?.name} بنجاح`,
      removedMember: {
        name: participant.user.name,
        email: participant.user.email
      }
    })

  } catch (error) {
    console.error('Error removing member from team:', error)
    return NextResponse.json({ error: 'خطأ في إزالة العضو من الفريق' }, { status: 500 })
  }
}

// Helper function to send team update emails
async function sendTeamUpdateEmails(team: any, changeMessage: string) {
  if (team.participants.length === 0) return

  const teamMembersList = team.participants.map((member: any) => 
    `${member.user.name} (${member.user.preferredRole || 'مطور'})`
  ).join('\n')

  const emailPromises = team.participants.map(async (member: any) => {
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
        to: member.user.email,
        subject: `🔄 تحديث في ${team.name} - ${team.hackathon.title}`,
        html: getTeamChangeEmailContent(
          member.user.name,
          team.hackathon.title,
          team.name,
          changeMessage,
          teamMembersList
        )
      })
      console.log(`📧 Team update email sent to ${member.user.email}`)
    } catch (error) {
      console.error(`❌ Failed to send email to ${member.user.email}:`, error)
    }
  })

  await Promise.all(emailPromises)
}

// Helper function to send email to removed participant
async function sendRemovedFromTeamEmail(
  email: string,
  name: string,
  teamName: string,
  hackathonTitle: string
) {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
      to: email,
      subject: `📋 تم إزالتك من ${teamName} - ${hackathonTitle}`,
      html: getRemovedFromTeamEmailContent(name, hackathonTitle, teamName)
    })
    console.log(`📧 Removal notification sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send removal email to ${email}:`, error)
  }
}

function getTeamChangeEmailContent(
  userName: string,
  hackathonTitle: string,
  teamName: string,
  changeMessage: string,
  teamMembers: string
): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تحديث في الفريق</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🔄 تحديث في الفريق</h1>
          <p style="color: #c3e956; margin: 10px 0 0 0; font-size: 18px;">تغيير في تكوين فريقك</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #01645e; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${userName}! 👋</h2>
          
          <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            حدث تغيير في فريقك <strong style="color: #3ab666;">${teamName}</strong> في <strong>${hackathonTitle}</strong>
          </p>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">📢 التغيير:</h3>
            <p style="color: #856404; margin: 0; font-weight: bold;">${changeMessage}</p>
          </div>

          <h3 style="color: #01645e; margin: 30px 0 15px 0;">👥 الأعضاء الحاليون في الفريق:</h3>
          <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 15px 0;">
            <pre style="color: #333; margin: 0; font-family: inherit; white-space: pre-wrap; line-height: 1.6;">${teamMembers}</pre>
          </div>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}/profile" style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: transform 0.3s;">
              🏠 زيارة الملف الشخصي
            </a>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #3ab666; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="color: #01645e; margin: 0; font-weight: bold; text-align: center;">
              🚀 بالتوفيق لك ولفريقك في الهاكاثون!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            هل تحتاج مساعدة؟ تواصل معنا على 
            <a href="mailto:support@hackathon.gov.sa" style="color: #3ab666;">support@hackathon.gov.sa</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function getRemovedFromTeamEmailContent(
  userName: string,
  hackathonTitle: string,
  teamName: string
): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>إزالة من الفريق</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">📋 إشعار إزالة من الفريق</h1>
          <p style="color: #fff3cd; margin: 10px 0 0 0; font-size: 18px;">تغيير في حالة مشاركتك</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #01645e; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${userName}! 👋</h2>
          
          <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            نود إعلامك أنه تم إزالتك من فريق <strong style="color: #dc3545;">${teamName}</strong> في <strong>${hackathonTitle}</strong>
          </p>

          <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #721c24; margin: 0 0 10px 0;">📢 ما يعني هذا:</h3>
            <ul style="color: #721c24; margin: 10px 0; padding-right: 20px;">
              <li>لم تعد عضواً في ${teamName}</li>
              <li>يمكنك الآن الانضمام لفريق آخر أو تكوين فريق جديد</li>
              <li>مشاركتك في الهاكاثون لا تزال نشطة</li>
            </ul>
          </div>

          <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #0c5460; margin: 0 0 10px 0;">💡 الخطوات التالية:</h3>
            <ul style="color: #0c5460; margin: 10px 0; padding-right: 20px;">
              <li>تواصل مع منظمي الهاكاثون إذا كان لديك أسئلة</li>
              <li>ابحث عن فريق آخر للانضمام إليه</li>
              <li>أو قم بتكوين فريق جديد مع مشاركين آخرين</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}/profile" style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: transform 0.3s;">
              🏠 زيارة الملف الشخصي
            </a>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #3ab666; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="color: #01645e; margin: 0; font-weight: bold; text-align: center;">
              🚀 لا تيأس! لا تزال فرصتك قائمة للمشاركة والفوز!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            هل تحتاج مساعدة؟ تواصل معنا على 
            <a href="mailto:support@hackathon.gov.sa" style="color: #3ab666;">support@hackathon.gov.sa</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
