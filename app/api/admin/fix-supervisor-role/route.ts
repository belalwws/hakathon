import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    console.log('🔧 Admin fixing supervisor roles...')

    // Find recent accepted invitations
    const invitations = await prisma.supervisorInvitation.findMany({
      where: {
        status: 'accepted'
      },
      orderBy: {
        acceptedAt: 'desc'
      },
      take: 10
    })

    const results = []

    for (const invitation of invitations) {
      const user = await prisma.user.findUnique({
        where: { email: invitation.email },
        include: {
          supervisor: true,
          participant: true
        }
      })

      if (!user) {
        results.push({
          email: invitation.email,
          status: 'user_not_found'
        })
        continue
      }

      const needsFix = user.role !== 'supervisor' || user.participant || !user.supervisor

      if (needsFix) {
        await prisma.$transaction(async (tx) => {
          // Update user role
          await tx.user.update({
            where: { id: user.id },
            data: { 
              role: 'supervisor',
              isActive: true,
              emailVerified: true
            }
          })

          // Delete participant record if exists
          if (user.participant) {
            await tx.participant.deleteMany({
              where: { userId: user.id }
            })
          }

          // Create or update supervisor record
          if (!user.supervisor) {
            await tx.supervisor.create({
              data: {
                userId: user.id,
                hackathonId: invitation.hackathonId,
                permissions: invitation.permissions || {},
                department: invitation.department,
                isActive: true
              }
            })
          } else {
            await tx.supervisor.update({
              where: { id: user.supervisor.id },
              data: {
                isActive: true,
                hackathonId: invitation.hackathonId || user.supervisor.hackathonId,
                permissions: invitation.permissions || user.supervisor.permissions,
                department: invitation.department || user.supervisor.department
              }
            })
          }
        })

        results.push({
          email: invitation.email,
          status: 'fixed',
          previousRole: user.role,
          hadParticipant: !!user.participant,
          hadSupervisor: !!user.supervisor
        })
      } else {
        results.push({
          email: invitation.email,
          status: 'already_correct',
          role: user.role
        })
      }
    }

    return NextResponse.json({
      message: "تم إصلاح أدوار المشرفين بنجاح",
      results,
      totalProcessed: results.length
    })

  } catch (error) {
    console.error("Error fixing supervisor roles:", error)
    return NextResponse.json(
      { error: "حدث خطأ في إصلاح أدوار المشرفين" },
      { status: 500 }
    )
  }
}
