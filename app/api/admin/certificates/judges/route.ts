import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/certificates/judges - Get all judges
export async function GET(request: NextRequest) {
  try {
    const judges = await prisma.judge.findMany({
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

    return NextResponse.json({ judges })
  } catch (error) {
    console.error("Error fetching judges:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب البيانات" }, { status: 500 })
  }
}
