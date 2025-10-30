import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get current user from token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: "لا يوجد token" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token غير صالح" }, { status: 401 })
    }

    console.log('🔍 Token payload:', payload)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        supervisor: true,
        participant: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    // Get recent supervisor invitations
    const invitations = await prisma.supervisorInvitation.findMany({
      where: {
        email: user.email,
        status: 'accepted'
      },
      orderBy: {
        acceptedAt: 'desc'
      },
      take: 3
    })

    const debugInfo = {
      tokenInfo: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name
      },
      databaseUser: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      relatedRecords: {
        hasSupervisor: !!user.supervisor,
        hasParticipant: !!user.participant,
        supervisorDetails: user.supervisor ? {
          id: user.supervisor.id,
          isActive: user.supervisor.isActive,
          hackathonId: user.supervisor.hackathonId,
          department: user.supervisor.department,
          createdAt: user.supervisor.createdAt
        } : null,
        participantDetails: user.participant ? {
          id: user.participant.id,
          isActive: user.participant.isActive,
          hackathonId: user.participant.hackathonId,
          createdAt: user.participant.createdAt
        } : null
      },
      invitations: invitations.map(inv => ({
        id: inv.id,
        status: inv.status,
        acceptedAt: inv.acceptedAt,
        createdAt: inv.createdAt
      })),
      mismatch: {
        tokenVsDatabase: payload.role !== user.role,
        shouldBeSupervisor: invitations.length > 0,
        hasCorrectRecords: !!user.supervisor && !user.participant
      }
    }

    return NextResponse.json(debugInfo)

  } catch (error) {
    console.error("Debug check error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في فحص المستخدم", details: error.message },
      { status: 500 }
    )
  }
}
