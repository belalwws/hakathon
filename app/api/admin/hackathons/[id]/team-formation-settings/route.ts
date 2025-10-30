import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/hackathons/[id]/team-formation-settings - Get team formation settings
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get hackathon settings
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      select: { settings: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    const settings = hackathon.settings as any
    const teamFormationSettings = settings?.teamFormationSettings || {
      teamSize: 4,
      minTeamSize: 3,
      maxTeamSize: 5,
      allowPartialTeams: true,
      rules: []
    }

    return NextResponse.json({ settings: teamFormationSettings })

  } catch (error) {
    console.error('Error fetching team formation settings:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/admin/hackathons/[id]/team-formation-settings - Save team formation settings
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { teamSize, minTeamSize, maxTeamSize, allowPartialTeams, rules } = body

    // Validate
    if (!teamSize || teamSize < 2) {
      return NextResponse.json({ error: 'حجم الفريق يجب أن يكون 2 على الأقل' }, { status: 400 })
    }

    // Get current hackathon settings
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      select: { settings: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    const currentSettings = (hackathon.settings as any) || {}
    
    // Update settings
    const updatedSettings = {
      ...currentSettings,
      teamFormationSettings: {
        teamSize,
        minTeamSize,
        maxTeamSize,
        allowPartialTeams,
        rules
      },
      maxTeamSize: teamSize // Also update the old maxTeamSize for backward compatibility
    }

    await prisma.hackathon.update({
      where: { id: params.id },
      data: { settings: updatedSettings }
    })

    console.log('✅ Team formation settings saved:', {
      hackathonId: params.id,
      teamSize,
      rulesCount: rules.length
    })

    return NextResponse.json({
      success: true,
      message: 'تم حفظ إعدادات تكوين الفرق بنجاح',
      settings: updatedSettings.teamFormationSettings
    })

  } catch (error) {
    console.error('Error saving team formation settings:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

