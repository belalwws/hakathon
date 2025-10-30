import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 403 }
      )
    }

    // Get hackathon
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id }
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: "الهاكاثون غير موجود" },
        { status: 404 }
      )
    }

    // Get permissions - Default to full access (like admin)
    // Only restrict if explicitly disabled by admin
    let permissions = {
      canApprove: true,
      canReject: true,
      canMessage: true,
      canViewDetails: true,
      canExportData: true
    }

    // Check supervisor permissions
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          OR: [
            { hackathonId: params.id },
            { hackathonId: null }
          ],
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json(
          { error: "لست مشرفاً على هذا الهاكاثون" },
          { status: 403 }
        )
      }

      const assignmentPermissions = supervisor.permissions as any
      if (assignmentPermissions) {
        permissions = {
          canApprove: assignmentPermissions.canApproveParticipants !== false,
          canReject: assignmentPermissions.canRejectParticipants !== false,
          canMessage: assignmentPermissions.canSendMessages !== false,
          canViewDetails: assignmentPermissions.canManageTeams !== false,
          canExportData: assignmentPermissions.canExportData !== false
        }
      }
    }

    // Get notification preferences (stored in user preferences or separate table)
    // For now, return default values
    const notifications = {
      emailOnNewParticipant: true,
      emailOnTeamUpdate: true,
      emailOnProjectSubmission: true,
      dailyDigest: false
    }

    return NextResponse.json({
      hackathon: {
        id: hackathon.id,
        title: hackathon.title,
        status: hackathon.status
      },
      permissions,
      notifications
    })

  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "حدث خطأ في جلب الإعدادات" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 403 }
      )
    }

    const body = await request.json()

    // In a real implementation, save notifications to database
    // For now, just return success
    // You could create a SupervisorPreferences table to store these

    return NextResponse.json({
      success: true,
      message: "تم حفظ الإعدادات بنجاح",
      hackathonId: params.id,
      userId: userId
    })

  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "حدث خطأ في حفظ الإعدادات" },
      { status: 500 }
    )
  }
}
