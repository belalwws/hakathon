import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/supervisor/hackathons/[id]/email-settings - Get email notification settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // Verify supervisor is assigned to this hackathon
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          hackathonId: hackathonId,
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json({ 
          error: "غير مصرح - لست مشرفاً على هذا الهاكاثون" 
        }, { status: 403 })
      }
    }

    // Get hackathon with settings
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        title: true,
        settings: true
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Extract email notification settings from hackathon.settings
    const settings = hackathon.settings as any
    const emailNotifications = settings?.emailNotifications || {
      teamFormation: true,
      memberTransfer: true,
      participantAcceptance: true,
      participantRejection: true
    }

    return NextResponse.json({
      hackathonTitle: hackathon.title,
      emailNotifications
    })

  } catch (error) {
    console.error('Error fetching email settings:', error)
    return NextResponse.json({ error: 'خطأ في تحميل الإعدادات' }, { status: 500 })
  }
}

// PATCH /api/supervisor/hackathons/[id]/email-settings - Update email notification settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // Verify supervisor is assigned to this hackathon
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          hackathonId: hackathonId,
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json({ 
          error: "غير مصرح - لست مشرفاً على هذا الهاكاثون" 
        }, { status: 403 })
      }
    }

    const body = await request.json()
    const { emailNotifications } = body

    if (!emailNotifications) {
      return NextResponse.json({ error: 'إعدادات الإيميلات مطلوبة' }, { status: 400 })
    }

    // Get current hackathon settings
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { settings: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Merge with existing settings
    const currentSettings = (hackathon.settings as any) || {}
    const updatedSettings = {
      ...currentSettings,
      emailNotifications: {
        teamFormation: emailNotifications.teamFormation !== false,
        memberTransfer: emailNotifications.memberTransfer !== false,
        participantAcceptance: emailNotifications.participantAcceptance !== false,
        participantRejection: emailNotifications.participantRejection !== false
      }
    }

    // Update hackathon settings
    await prisma.hackathon.update({
      where: { id: hackathonId },
      data: { settings: updatedSettings }
    })

    return NextResponse.json({
      message: 'تم حفظ إعدادات الإيميلات بنجاح',
      emailNotifications: updatedSettings.emailNotifications
    })

  } catch (error) {
    console.error('Error updating email settings:', error)
    return NextResponse.json({ error: 'خطأ في حفظ الإعدادات' }, { status: 500 })
  }
}
