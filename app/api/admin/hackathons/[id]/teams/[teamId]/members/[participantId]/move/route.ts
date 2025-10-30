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

// POST /api/admin/hackathons/[id]/teams/[teamId]/members/[participantId]/move - Move member to another team
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string; participantId: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId, teamId: sourceTeamId, participantId } = params
    const { targetTeamId } = await request.json()

    if (!targetTeamId) {
      return NextResponse.json({ error: 'معرف الفريق المستهدف مطلوب' }, { status: 400 })
    }

    // Check if participant exists and is in the source team
    const participant = await prisma.participant.findFirst({
      where: {
        id: participantId,
        hackathonId: hackathonId,
        teamId: sourceTeamId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            preferredRole: true
          }
        }
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'العضو غير موجود في الفريق المصدر' }, { status: 404 })
    }

    // Check if target team exists
    const targetTeam = await prisma.team.findFirst({
      where: {
        id: targetTeamId,
        hackathonId: hackathonId
      }
    })

    if (!targetTeam) {
      return NextResponse.json({ error: 'الفريق المستهدف غير موجود' }, { status: 404 })
    }

    // Get source team info
    const sourceTeam = await prisma.team.findUnique({
      where: { id: sourceTeamId }
    })

    // Move participant to target team
    await prisma.participant.update({
      where: {
        id: participantId
      },
      data: {
        teamId: targetTeamId
      }
    })

    // Get updated teams information for email notifications
    const [updatedSourceTeam, updatedTargetTeam] = await Promise.all([
      prisma.team.findUnique({
        where: { id: sourceTeamId },
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
            select: { title: true }
          }
        }
      }),
      prisma.team.findUnique({
        where: { id: targetTeamId },
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
            select: { title: true }
          }
        }
      })
    ])

    // Send email notifications
    if (updatedSourceTeam && updatedSourceTeam.participants.length > 0) {
      await sendTeamUpdateEmails(
        updatedSourceTeam, 
        `تم نقل ${participant.user.name} إلى فريق ${targetTeam.name}`
      )
    }

    if (updatedTargetTeam) {
      await sendTeamUpdateEmails(
        updatedTargetTeam, 
        `تم إضافة ${participant.user.name} من فريق ${sourceTeam?.name || 'فريق آخر'}`
      )
      
      // Send welcome email to the moved participant
      await sendMovedToTeamEmail(
        participant.user.email,
        participant.user.name,
        sourceTeam?.name || 'الفريق السابق',
        targetTeam.name,
        updatedTargetTeam.hackathon.title
      )
    }

    return NextResponse.json({
      message: `تم نقل ${participant.user.name} من ${sourceTeam?.name} إلى ${targetTeam.name} بنجاح`,
      movedMember: {
        name: participant.user.name,
        email: participant.user.email,
        fromTeam: sourceTeam?.name,
        toTeam: targetTeam.name
      }
    })

  } catch (error) {
    console.error('Error moving member between teams:', error)
    return NextResponse.json({ error: 'خطأ في نقل العضو بين الفرق' }, { status: 500 })
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

// Helper function to send email to moved participant
async function sendMovedToTeamEmail(
  email: string,
  name: string,
  fromTeamName: string,
  toTeamName: string,
  hackathonTitle: string
) {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
      to: email,
      subject: `🎉 تم نقلك إلى ${toTeamName} - ${hackathonTitle}`,
      html: getMovedToTeamEmailContent(name, hackathonTitle, fromTeamName, toTeamName)
    })
    console.log(`📧 Move notification sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send move email to ${email}:`, error)
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

function getMovedToTeamEmailContent(
  userName: string,
  hackathonTitle: string,
  fromTeamName: string,
  toTeamName: string
): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>نقل إلى فريق جديد</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #17a2b8 0%, #3ab666 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 مرحباً بك في فريقك الجديد!</h1>
          <p style="color: #c3e956; margin: 10px 0 0 0; font-size: 18px;">تم نقلك بنجاح</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #01645e; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${userName}! 👋</h2>
          
          <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            تم نقلك بنجاح في <strong>${hackathonTitle}</strong>
          </p>

          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #155724; margin: 0 0 15px 0;">📋 تفاصيل النقل:</h3>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
              <div style="text-align: center; flex: 1;">
                <p style="color: #dc3545; margin: 0; font-weight: bold; font-size: 18px;">${fromTeamName}</p>
                <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">الفريق السابق</p>
              </div>
              <div style="text-align: center; flex: 0 0 auto; margin: 0 20px;">
                <span style="font-size: 24px;">➡️</span>
              </div>
              <div style="text-align: center; flex: 1;">
                <p style="color: #28a745; margin: 0; font-weight: bold; font-size: 18px;">${toTeamName}</p>
                <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">فريقك الجديد</p>
              </div>
            </div>
          </div>

          <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #0c5460; margin: 0 0 10px 0;">💡 الخطوات التالية:</h3>
            <ul style="color: #0c5460; margin: 10px 0; padding-right: 20px;">
              <li>تواصل مع أعضاء فريقك الجديد</li>
              <li>تعرف على مشروع الفريق وأهدافه</li>
              <li>ناقش دورك في الفريق الجديد</li>
              <li>ابدأ التعاون والعمل معاً</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}/profile" style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: transform 0.3s;">
              🏠 زيارة الملف الشخصي
            </a>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #3ab666; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="color: #01645e; margin: 0; font-weight: bold; text-align: center;">
              🚀 بالتوفيق لك مع فريقك الجديد في الهاكاثون!
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
