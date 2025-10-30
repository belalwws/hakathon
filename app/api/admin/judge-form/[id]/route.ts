import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Get judge form configuration
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ التحقق من الـ authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const params = await context.params
    const hackathonId = params.id

    // Check if form exists
    const form = await prisma.judgeFormDesign.findUnique({
      where: { hackathonId }
    })

    if (!form) {
      return NextResponse.json({ form: null })
    }

    // Parse settings JSON
    const settings = form.settings ? JSON.parse(form.settings as string) : {}

    return NextResponse.json({
      form: {
        title: form.title,
        description: form.description,
        welcomeMessage: form.welcomeMessage,
        successMessage: form.successMessage,
        fields: settings.fields || [],
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        backgroundColor: form.backgroundColor,
        coverImage: form.coverImage,
        logoUrl: form.logoUrl,
        customCss: form.customCss
      }
    })
  } catch (error) {
    console.error('Error fetching judge form:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الفورم' },
      { status: 500 }
    )
  }
}

// POST - Save judge form configuration
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ التحقق من الـ authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const params = await context.params
    const hackathonId = params.id
    const body = await request.json()

    const {
      title,
      description,
      welcomeMessage,
      successMessage,
      fields,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      coverImage,
      logoUrl,
      customCss
    } = body

    // Validate hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: 'الهاكاثون غير موجود' },
        { status: 404 }
      )
    }

    // Prepare settings object
    const settings = {
      fields: fields || [],
      customSettings: {}
    }

    // Upsert form design
    const form = await prisma.judgeFormDesign.upsert({
      where: { hackathonId },
      create: {
        hackathonId,
        isEnabled: true,
        title: title || 'طلب الانضمام كمحكم',
        description: description || '',
        welcomeMessage: welcomeMessage || '',
        successMessage: successMessage || 'تم إرسال طلبك بنجاح!',
        primaryColor: primaryColor || '#01645e',
        secondaryColor: secondaryColor || '#3ab666',
        accentColor: accentColor || '#c3e956',
        backgroundColor: backgroundColor || '#ffffff',
        coverImage: coverImage || null,
        logoUrl: logoUrl || null,
        customCss: customCss || null,
        settings: JSON.stringify(settings)
      },
      update: {
        isEnabled: true,
        title: title || 'طلب الانضمام كمحكم',
        description: description || '',
        welcomeMessage: welcomeMessage || '',
        successMessage: successMessage || 'تم إرسال طلبك بنجاح!',
        primaryColor: primaryColor || '#01645e',
        secondaryColor: secondaryColor || '#3ab666',
        accentColor: accentColor || '#c3e956',
        backgroundColor: backgroundColor || '#ffffff',
        coverImage: coverImage || null,
        logoUrl: logoUrl || null,
        customCss: customCss || null,
        settings: JSON.stringify(settings)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الفورم بنجاح',
      form
    })
  } catch (error) {
    console.error('Error saving judge form:', error)
    return NextResponse.json(
      { error: 'فشل في حفظ الفورم' },
      { status: 500 }
    )
  }
}

