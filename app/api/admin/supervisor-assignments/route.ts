import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/admin/supervisor-assignments - Get all supervisor assignments
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get all users with supervisor role
    const supervisorUsers = await prisma.user.findMany({
      where: {
        role: 'supervisor'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        profilePicture: true,
        bio: true,
        skills: true,
        github: true,
        linkedin: true,
        portfolio: true,
        university: true,
        major: true,
        graduationYear: true,
        workExperience: true,
        createdAt: true,
        isActive: true,
        lastLogin: true,
        isOnline: true,
        lastActivity: true,
        loginCount: true,
        supervisorAssignments: {
          include: {
            hackathon: {
              select: {
                id: true,
                title: true,
                status: true,
                startDate: true,
                endDate: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response
    const supervisors = supervisorUsers.map(user => ({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        profilePicture: user.profilePicture,
        bio: user.bio,
        skills: user.skills,
        github: user.github,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        university: user.university,
        major: user.major,
        graduationYear: user.graduationYear,
        workExperience: user.workExperience,
        createdAt: user.createdAt,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        isOnline: user.isOnline,
        lastActivity: user.lastActivity,
        loginCount: user.loginCount
      },
      assignments: user.supervisorAssignments.map(assignment => ({
        id: assignment.id,
        hackathonId: assignment.hackathonId,
        hackathon: assignment.hackathon,
        department: assignment.department,
        permissions: assignment.permissions,
        isActive: assignment.isActive,
        assignedAt: assignment.assignedAt
      }))
    }))

    return NextResponse.json({
      supervisors
    })

  } catch (error) {
    console.error("Error fetching supervisor assignments:", error)
    console.error("Full error details:", JSON.stringify(error, null, 2))

    return NextResponse.json({
      error: "حدث خطأ في جلب تعيينات المشرفين",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// POST /api/admin/supervisor-assignments - Create new supervisor assignment
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, hackathonId, department, permissions } = body

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 })
    }

    // Check if user exists and has supervisor role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    if (user.role !== 'supervisor') {
      return NextResponse.json({ error: 'المستخدم ليس مشرفاً' }, { status: 400 })
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.supervisor.findFirst({
      where: {
        userId,
        hackathonId: hackathonId || null
      }
    })

    if (existingAssignment) {
      return NextResponse.json({
        error: hackathonId
          ? 'المشرف معين بالفعل لهذا الهاكاثون'
          : 'المشرف معين بالفعل كمشرف عام'
      }, { status: 400 })
    }

    // Create new assignment
    const assignment = await prisma.supervisor.create({
      data: {
        userId,
        hackathonId: hackathonId || null,
        department: department || null,
        permissions: permissions || null,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        hackathon: hackathonId ? {
          select: {
            id: true,
            title: true,
            status: true
          }
        } : undefined
      }
    })

    return NextResponse.json({
      message: 'تم تعيين المشرف بنجاح',
      assignment
    })

  } catch (error) {
    console.error("Error creating supervisor assignment:", error)
    return NextResponse.json({ 
      error: "حدث خطأ في تعيين المشرف" 
    }, { status: 500 })
  }
}

// DELETE /api/admin/supervisor-assignments - Remove supervisor assignment
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('id')

    if (!assignmentId) {
      return NextResponse.json({ error: 'معرف التعيين مطلوب' }, { status: 400 })
    }

    // Delete the assignment
    await prisma.supervisor.delete({
      where: { id: assignmentId }
    })

    return NextResponse.json({
      message: 'تم إلغاء تعيين المشرف بنجاح'
    })

  } catch (error) {
    console.error("Error removing supervisor assignment:", error)
    return NextResponse.json({ 
      error: "حدث خطأ في إلغاء تعيين المشرف" 
    }, { status: 500 })
  }
}
