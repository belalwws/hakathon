import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTemplatedEmail } from '@/lib/mailer'
import crypto from 'crypto'

// POST /api/supervisor/teams/[teamId]/send-upload-links - إرسال روابط رفع العرض لجميع أعضاء الفريق
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const params = await context.params
    const { teamId } = params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    console.log('📧 [send-upload-links] Sending upload links for team:', teamId)

    // جلب بيانات الفريق مع جميع الأعضاء
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        participants: {
          where: {
            status: 'approved'
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        hackathon: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'الفريق غير موجود' }, { status: 404 })
    }

    if (team.participants.length === 0) {
      return NextResponse.json({ error: 'لا يوجد أعضاء مقبولين في الفريق' }, { status: 400 })
    }

    // Verify supervisor is assigned to this hackathon
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          hackathonId: team.hackathon.id,
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json({ 
          error: "غير مصرح - لست مشرفاً على هذا الهاكاثون" 
        }, { status: 403 })
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    let successCount = 0
    let failCount = 0
    const results: any[] = []

    // إرسال رابط لكل عضو في الفريق
    for (const participant of team.participants) {
      try {
        // التحقق من وجود token سابق غير مستخدم
        let uploadToken = await prisma.uploadToken.findFirst({
          where: {
            participantId: participant.id,
            used: false,
            expiresAt: {
              gte: new Date()
            }
          }
        })

        if (!uploadToken) {
          // إنشاء token جديد
          const tokenString = crypto.randomBytes(32).toString('hex')
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 14) // صالح لمدة 14 يوم

          uploadToken = await prisma.uploadToken.create({
            data: {
              token: tokenString,
              participantId: participant.id,
              teamId: team.id,
              hackathonId: team.hackathon.id,
              expiresAt: expiresAt
            }
          })

          console.log('✅ [send-upload-links] Created new token for:', participant.user.email)
        } else {
          console.log('♻️ [send-upload-links] Using existing token for:', participant.user.email)
        }

        // إنشاء رابط الرفع
        const uploadLink = `${baseUrl}/upload-presentation?token=${uploadToken.token}`

        // تنسيق تاريخ الانتهاء
        const expiryDate = new Date(uploadToken.expiresAt).toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })

        // إرسال الإيميل
        try {
          await sendTemplatedEmail(
            'upload_link',
            participant.user.email,
            {
              participantName: participant.user.name,
              hackathonTitle: team.hackathon.title,
              teamName: team.name,
              uploadLink: uploadLink,
              expiryDate: expiryDate
            },
            team.hackathonId
          )
          console.log('✅ [send-upload-links] Email sent to:', participant.user.email)
          successCount++
          results.push({
            email: participant.user.email,
            name: participant.user.name,
            success: true
          })
        } catch (emailError) {
          console.warn('⚠️ [send-upload-links] Email not sent to:', participant.user.email, emailError)
          failCount++
          results.push({
            email: participant.user.email,
            name: participant.user.name,
            success: false,
            error: 'فشل إرسال الإيميل'
          })
        }
      } catch (error) {
        console.error('❌ [send-upload-links] Error for participant:', participant.user.email, error)
        failCount++
        results.push({
          email: participant.user.email,
          name: participant.user.name,
          success: false,
          error: 'خطأ في إنشاء الرابط'
        })
      }
    }

    return NextResponse.json({
      message: `تم إرسال ${successCount} رابط من أصل ${team.participants.length}`,
      teamName: team.name,
      totalMembers: team.participants.length,
      successCount,
      failCount,
      results
    })

  } catch (error) {
    console.error('❌ [send-upload-links] Error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إرسال الروابط' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

