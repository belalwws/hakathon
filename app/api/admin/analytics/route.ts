import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    // Get date range for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Participants by day (last 30 days)
    const participantsByDay = await prisma.participant.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group by date (day)
    const participantsChart = participantsByDay.reduce((acc: any[], item) => {
      const date = new Date(item.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
      const existing = acc.find(a => a.date === date)
      if (existing) {
        existing.count += item._count
      } else {
        acc.push({ date, count: item._count })
      }
      return acc
    }, [])

    // Participants by status
    const participantsByStatus = await prisma.participant.groupBy({
      by: ['status'],
      _count: true
    })

    const statusChart = participantsByStatus.map(item => ({
      name: item.status === 'pending' ? 'معلق' : item.status === 'approved' ? 'مقبول' : 'مرفوض',
      value: item._count,
      status: item.status
    }))

    // Hackathons by status
    const hackathonsByStatus = await prisma.hackathon.groupBy({
      by: ['status'],
      _count: true
    })

    const hackathonsChart = hackathonsByStatus.map(item => ({
      name: item.status === 'draft' ? 'مسودة' : 
            item.status === 'published' ? 'منشور' :
            item.status === 'active' ? 'نشط' :
            item.status === 'completed' ? 'مكتمل' : 'ملغي',
      value: item._count,
      status: item.status
    }))

    // Top hackathons by participants
    const topHackathons = await prisma.hackathon.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            participants: true
          }
        }
      },
      orderBy: {
        participants: {
          _count: 'desc'
        }
      },
      take: 5
    })

    const topHackathonsChart = topHackathons.map(h => ({
      name: h.title.length > 20 ? h.title.substring(0, 20) + '...' : h.title,
      participants: h._count.participants
    }))

    // User registrations by day (last 30 days)
    const usersByDay = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const usersChart = usersByDay.reduce((acc: any[], item) => {
      const date = new Date(item.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
      const existing = acc.find(a => a.date === date)
      if (existing) {
        existing.count += item._count
      } else {
        acc.push({ date, count: item._count })
      }
      return acc
    }, [])

    // Users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    })

    const rolesChart = usersByRole.map(item => ({
      name: item.role === 'admin' ? 'مدير' :
            item.role === 'supervisor' ? 'مشرف' :
            item.role === 'judge' ? 'محكم' :
            item.role === 'expert' ? 'خبير' : 'مشارك',
      value: item._count,
      role: item.role
    }))

    return NextResponse.json({
      participantsChart,
      statusChart,
      hackathonsChart,
      topHackathonsChart,
      usersChart,
      rolesChart
    })

  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"

