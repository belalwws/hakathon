import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "overview"

    switch (reportType) {
      case "overview":
        return await getOverviewReport()
      case "participants":
        return await getParticipantsReport()
      case "teams":
        return await getTeamsReport()
      case "progress":
        return await getProgressReport()
      default:
        return NextResponse.json({ error: "نوع تقرير غير صالح" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "حدث خطأ في إنشاء التقرير" }, { status: 500 })
  }
}

async function getOverviewReport() {
  // Get basic statistics
  const totalParticipants = await prisma.participant.count()
  const approvedParticipants = await prisma.participant.count({
    where: { status: "approved" }
  })
  const pendingParticipants = await prisma.participant.count({
    where: { status: "pending" }
  })

  const totalTeams = await prisma.team.count()
  const teamsWithProjects = await prisma.team.count({
    where: {
      OR: [
        { projectName: { not: null } },
        { projectUrl: { not: null } }
      ]
    }
  })

  // Get registration trend (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const registrationTrend = await prisma.participant.groupBy({
    by: ["registeredAt"],
    where: {
      registeredAt: {
        gte: sevenDaysAgo
      }
    },
    _count: {
      id: true
    }
  })

  // Format trend data
  const trendData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const count = registrationTrend.filter(item => 
      item.registeredAt.toISOString().split('T')[0] === dateStr
    ).reduce((sum, item) => sum + item._count.id, 0)
    
    trendData.push({
      date: dateStr,
      count: count
    })
  }

  const overview = {
    participants: {
      total: totalParticipants,
      approved: approvedParticipants,
      pending: pendingParticipants,
      rejected: totalParticipants - approvedParticipants - pendingParticipants
    },
    teams: {
      total: totalTeams,
      withProjects: teamsWithProjects,
      completionRate: totalTeams > 0 ? Math.round((teamsWithProjects / totalTeams) * 100) : 0
    },
    registrationTrend: trendData
  }

  return NextResponse.json({ overview })
}

async function getParticipantsReport() {
  // Participants by status
  const participantsByStatus = await prisma.participant.groupBy({
    by: ["status"],
    _count: {
      status: true
    }
  })

  // Participants by city
  const participantsByCity = await prisma.participant.groupBy({
    by: ["user"],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: "desc"
      }
    },
    take: 10
  })

  // Get city names
  const cityStats = await prisma.user.groupBy({
    by: ["city"],
    where: {
      city: { not: null }
    },
    _count: {
      city: true
    },
    orderBy: {
      _count: {
        city: "desc"
      }
    },
    take: 10
  })

  // Skills distribution
  const skillsData = await prisma.user.findMany({
    where: {
      skills: { not: null },
      participations: {
        some: {}
      }
    },
    select: {
      skills: true
    }
  })

  // Process skills data
  const skillsMap = new Map()
  skillsData.forEach(user => {
    if (user.skills) {
      const skills = user.skills.split(',').map(s => s.trim())
      skills.forEach(skill => {
        skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1)
      })
    }
  })

  const topSkills = Array.from(skillsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }))

  const participantsReport = {
    byStatus: participantsByStatus.map(item => ({
      status: item.status,
      count: item._count.status
    })),
    byCity: cityStats.map(item => ({
      city: item.city || "غير محدد",
      count: item._count.city
    })),
    topSkills
  }

  return NextResponse.json({ participantsReport })
}

async function getTeamsReport() {
  // Teams by project status
  const teamsWithProjects = await prisma.team.count({
    where: {
      projectName: { not: null }
    }
  })

  const teamsWithUrls = await prisma.team.count({
    where: {
      projectUrl: { not: null }
    }
  })

  const teamsWithGithub = await prisma.team.count({
    where: {
      githubUrl: { not: null }
    }
  })

  const totalTeams = await prisma.team.count()

  // Team sizes distribution
  const teamSizes = await prisma.team.findMany({
    include: {
      participants: true
    }
  })

  const sizeDistribution = teamSizes.reduce((acc, team) => {
    const size = team.participants.length
    const category = size === 1 ? "فردي" : 
                    size <= 3 ? "صغير (2-3)" :
                    size <= 5 ? "متوسط (4-5)" : "كبير (6+)"
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const teamsReport = {
    projectStatus: {
      withNames: teamsWithProjects,
      withUrls: teamsWithUrls,
      withGithub: teamsWithGithub,
      total: totalTeams
    },
    sizeDistribution: Object.entries(sizeDistribution).map(([size, count]) => ({
      size,
      count
    }))
  }

  return NextResponse.json({ teamsReport })
}

async function getProgressReport() {
  // Daily registration progress
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const dailyRegistrations = await prisma.participant.groupBy({
    by: ["registeredAt"],
    where: {
      registeredAt: {
        gte: thirtyDaysAgo
      }
    },
    _count: {
      id: true
    }
  })

  // Format daily data
  const progressData = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const count = dailyRegistrations.filter(item => 
      item.registeredAt.toISOString().split('T')[0] === dateStr
    ).reduce((sum, item) => sum + item._count.id, 0)
    
    progressData.push({
      date: dateStr,
      registrations: count
    })
  }

  // Weekly team creation
  const weeklyTeams = await prisma.team.groupBy({
    by: ["createdAt"],
    where: {
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    _count: {
      id: true
    }
  })

  const progressReport = {
    dailyRegistrations: progressData,
    weeklyTeams: weeklyTeams.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id
    }))
  }

  return NextResponse.json({ progressReport })
}
