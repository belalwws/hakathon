import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/certificates/supervisors - Get all supervisors
export async function GET(request: NextRequest) {
  try {
    const supervisors = await prisma.supervisor.findMany({
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
