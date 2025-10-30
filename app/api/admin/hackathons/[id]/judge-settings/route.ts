import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/hackathons/[id]/judge-settings - Get judge settings for hackathon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { 
        id: true,
        title: true,
        judgeSettings: true 
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Default judge settings
    const defaultSettings = {
      showTeamNames: true,           // إظهار أسماء الفرق
      showProjectTitles: true,       // إظهار عناوين المشاريع
      showProjectDescriptions: true, // إظهار وصف المشاريع
      showPresentationFiles: true,   // إظهار ملفات العروض التقديمية
      showTeamMembers: true,         // إظهار أعضاء الفريق
      allowFileDownload: true,       // السماح بتحميل الملفات
      evaluationOnly: false,         // التقييم فقط (إخفاء كل شيء عدا النماذج)
      showPreviousScores: false,     // إظهار درجات المحكمين الآخرين
      anonymousMode: false,          // الوضع المجهول (إخفاء أسماء الفرق والأعضاء)
      customMessage: '',             // رسالة مخصصة للمحكمين
    }

    const currentSettings = hackathon.judgeSettings || defaultSettings

    return NextResponse.json({
      hackathonId: hackathon.id,
      hackathonTitle: hackathon.title,
      settings: { ...defaultSettings, ...currentSettings }
    })

  } catch (error) {
    console.error('Error fetching judge settings:', error)
    return NextResponse.json({ error: 'خطأ في جلب إعدادات المحكم' }, { status: 500 })
  }
}

// PUT /api/admin/hackathons/[id]/judge-settings - Update judge settings for hackathon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const {
      showTeamNames,
      showProjectTitles,
      showProjectDescriptions,
      showPresentationFiles,
      showTeamMembers,
      allowFileDownload,
      evaluationOnly,
      showPreviousScores,
      anonymousMode,
      customMessage
    } = body

    // Validate hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { id: true, title: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Prepare settings object
    const judgeSettings = {
      showTeamNames: Boolean(showTeamNames),
      showProjectTitles: Boolean(showProjectTitles),
      showProjectDescriptions: Boolean(showProjectDescriptions),
      showPresentationFiles: Boolean(showPresentationFiles),
      showTeamMembers: Boolean(showTeamMembers),
      allowFileDownload: Boolean(allowFileDownload),
      evaluationOnly: Boolean(evaluationOnly),
      showPreviousScores: Boolean(showPreviousScores),
      anonymousMode: Boolean(anonymousMode),
      customMessage: String(customMessage || ''),
      updatedAt: new Date().toISOString(),
      updatedBy: payload.userId
    }

    // Update hackathon with new judge settings
    const updatedHackathon = await prisma.hackathon.update({
      where: { id: hackathonId },
      data: { judgeSettings },
      select: { 
        id: true,
        title: true,
        judgeSettings: true 
      }
    })

    console.log('✅ Judge settings updated for hackathon:', hackathonId)

    return NextResponse.json({
      message: 'تم تحديث إعدادات المحكم بنجاح',
      hackathonId: updatedHackathon.id,
      hackathonTitle: updatedHackathon.title,
      settings: updatedHackathon.judgeSettings
    })

  } catch (error) {
    console.error('Error updating judge settings:', error)
    return NextResponse.json({ error: 'خطأ في تحديث إعدادات المحكم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
