import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/supervisor/hackathons - Get hackathons assigned to supervisor
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    console.log('🔍 [supervisor/hackathons] User role:', userRole, 'User ID:', userId)

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    let hackathons: any[] = []

    if (userRole === "admin") {
      // Admin can see all hackathons
      hackathons = await prisma.hackathon.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
          _count: {
            select: {
              participants: true,
              teams: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Supervisor can only see assigned hackathons
      const supervisorAssignments = await prisma.supervisor.findMany({
        where: {
          userId: userId || '',
          isActive: true
        },
        include: {
          hackathon: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              startDate: true,
              endDate: true,
              _count: {
                select: {
                  participants: true,
                  teams: true
                }
              }
            }
          }
        }
      })

      hackathons = supervisorAssignments
        .map(assignment => assignment.hackathon)
        .filter(h => h !== null)
    }

    console.log('✅ [supervisor/hackathons] Found', hackathons.length, 'hackathons')

    return NextResponse.json({ hackathons })
  } catch (error) {
    console.error("❌ [supervisor/hackathons] Error:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب البيانات" }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

