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
    const limit = parseInt(searchParams.get("limit") || "10000") // Get all teams for presentations page
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const hackathonId = searchParams.get("hackathonId") // Filter by specific hackathon

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // If hackathonId is provided, filter by it
    if (hackathonId) {
      where.hackathonId = hackathonId
    } else if (userRole === "supervisor" && userId) {
      // If supervisor and no specific hackathon, only get teams from their assigned hackathons
      const supervisorAssignments = await prisma.supervisor.findMany({
        where: {
          userId: userId,
          isActive: true
        },
        select: {
          hackathonId: true
        }
      })

      const hackathonIds = supervisorAssignments
        .map(s => s.hackathonId)
        .filter((id): id is string => id !== null)

      if (hackathonIds.length > 0) {
        where.hackathonId = { in: hackathonIds }
      } else {
        // No hackathons assigned, return empty
        return NextResponse.json({
          teams: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        })
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { projectName: { contains: search, mode: "insensitive" } },
        { ideaTitle: { contains: search, mode: "insensitive" } }
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    // Get teams with related data
    const teams = await prisma.team.findMany({
      where,
      include: {
        hackathon: {
          select: {
            id: true,
            title: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        scores: {
          include: {
            judge: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            },
            criterion: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    })

    // Get total count
    const total = await prisma.team.count({ where })

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    // Format teams data
    const formattedTeams = teams.map(team => ({
      ...team,
      memberCount: team.participants.length,
      averageScore: team.scores.length > 0
        ? team.scores.reduce((sum, score) => {
            // Convert score back to stars: (score / maxScore) * 5
            const stars = (score.score / score.maxScore) * 5
            return sum + stars
          }, 0) / team.scores.length
        : null,
      evaluationCount: team.scores.length
    }))

    return NextResponse.json({
      teams: formattedTeams,
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
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب الفرق" }, { status: 500 })
  }
}

// Update team information
export async function PATCH(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const body = await request.json()
    const { teamId, updates } = body

    if (!teamId) {
      return NextResponse.json({ error: "معرف الفريق مطلوب" }, { status: 400 })
    }

    // Validate allowed updates for supervisor
    const allowedFields = [
      "name", 
      "projectName", 
      "projectDescription", 
      "status", 
      "notes",
      "projectUrl",
      "githubUrl",
      "demoUrl"
    ]

    const filteredUpdates: any = {}
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key]
      }
    })

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: "لا توجد حقول صالحة للتحديث" }, { status: 400 })
    }

    // Update team
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...filteredUpdates,
        updatedAt: new Date()
      },
      include: {
        participants: {
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
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "تم تحديث الفريق بنجاح",
      team: updatedTeam
    })

  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ error: "حدث خطأ في تحديث الفريق" }, { status: 500 })
  }
}

// Get team statistics
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    if (action === "stats") {
      const totalTeams = await prisma.team.count()
      
      const teamsWithProjects = await prisma.team.count({
        where: {
          OR: [
            { projectName: { not: null } },
            { projectUrl: { not: null } },
            { githubUrl: { not: null } }
          ]
        }
      })

      const teamsWithSubmissions = await prisma.team.count({
        where: {
          submissionUrl: { not: null }
        }
      })

      const evaluatedTeams = await prisma.team.count({
        where: {
          scores: {
            some: {}
          }
        }
      })

      const stats = {
        total: totalTeams,
        withProjects: teamsWithProjects,
        withSubmissions: teamsWithSubmissions,
        evaluated: evaluatedTeams,
        completionRate: totalTeams > 0 ? Math.round((teamsWithProjects / totalTeams) * 100) : 0
      }

      return NextResponse.json({ stats })
    }

    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 })

  } catch (error) {
    console.error("Error fetching team stats:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب الإحصائيات" }, { status: 500 })
  }
}
