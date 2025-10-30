import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // Get supervisor's assigned hackathons
    const supervisorAssignments = await prisma.supervisor.findMany({
      where: {
        userId: userId || '',
        isActive: true
      },
      select: {
        hackathonId: true
      }
    })

    const hackathonIds = supervisorAssignments
      .map(s => s.hackathonId)
      .filter((id): id is string => id !== null)

    if (hackathonIds.length === 0) {
      return NextResponse.json({ supervisors: [] })
    }

    // Get supervisors for these hackathons (excluding the current supervisor)
    const supervisors = await prisma.supervisor.findMany({
      where: {
        hackathonId: { in: hackathonIds },
        userId: { not: userId || '' }
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
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    return NextResponse.json({ supervisors })
  } catch (error) {
    console.error("Error fetching supervisors:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب البيانات" }, { status: 500 })
  }
}

