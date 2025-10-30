import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    // For supervisors, filter by their assigned hackathons
    if (userRole === "supervisor") {
      // Get supervisor's assigned hackathons
      const supervisorAssignments = await prisma.supervisor.findMany({
        where: {
          userId: userId!,
          isActive: true
        },
        select: {
          hackathonId: true
        }
      })

      const hackathonIds = supervisorAssignments
        .map(s => s.hackathonId)
        .filter((id): id is string => id !== null)

      // If supervisor has specific hackathon assignments, filter by them
      // If hackathonId is null, they're a general supervisor and can see all
      if (hackathonIds.length > 0) {
        where.hackathonId = {
          in: hackathonIds
        }
      }
    }
    
    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { teamName: { contains: search, mode: "insensitive" } },
        { projectTitle: { contains: search, mode: "insensitive" } }
      ]
    }

    // Get participants with user data
    const participants = await prisma.participant.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            skills: true,
            profilePicture: true
          }
        },
        hackathon: {
          select: {
            id: true,
            title: true
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            teamNumber: true
          }
        }
      },
      orderBy: {
        registeredAt: "desc"
      },
      skip,
      take: limit
    })

    // Get total count
    const total = await prisma.participant.count({ where })

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      participants,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    })

  } catch (error) {
    console.error("Error fetching participants:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب المشاركين" }, { status: 500 })
  }
}

// Update participant status
export async function PATCH(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const body = await request.json()
    const { participantId, status, feedback } = body

    if (!participantId || !status) {
      return NextResponse.json({ error: "معرف المشارك والحالة مطلوبان" }, { status: 400 })
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 })
    }

    // Update participant
    const updatedParticipant = await prisma.participant.update({
      where: { id: participantId },
      data: {
        status,
        feedback: feedback || null,
        approvedAt: status === "approved" ? new Date() : null,
        rejectedAt: status === "rejected" ? new Date() : null,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        hackathon: {
          select: {
            title: true
          }
        }
      }
    })

    // TODO: Send notification email to participant about status change

    return NextResponse.json({
      message: "تم تحديث حالة المشارك بنجاح",
      participant: updatedParticipant
    })

  } catch (error) {
    console.error("Error updating participant:", error)
    return NextResponse.json({ error: "حدث خطأ في تحديث المشارك" }, { status: 500 })
  }
}

// Get participant statistics
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    if (action === "stats") {
      const stats = await prisma.participant.groupBy({
        by: ["status"],
        _count: {
          status: true
        }
      })

      const totalParticipants = await prisma.participant.count()
      
      const formattedStats = {
        total: totalParticipants,
        pending: stats.find(s => s.status === "pending")?._count.status || 0,
        approved: stats.find(s => s.status === "approved")?._count.status || 0,
        rejected: stats.find(s => s.status === "rejected")?._count.status || 0
      }

      return NextResponse.json({ stats: formattedStats })
    }

    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 })

  } catch (error) {
    console.error("Error fetching participant stats:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب الإحصائيات" }, { status: 500 })
  }
}
