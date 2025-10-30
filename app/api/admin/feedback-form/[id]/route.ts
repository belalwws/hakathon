import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get feedback form configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { id: hackathonId } = params

    // Check if form exists
    const form = await prisma.hackathonFeedbackForm.findUnique({
      where: { hackathonId }
    })

    if (!form) {
      return NextResponse.json({ form: null })
    }

    // Parse questions as fields
    const questions = JSON.parse(form.questions as string)
    
    return NextResponse.json({
      form: {
        title: form.title,
        description: form.description,
        welcomeMessage: form.welcomeMessage,
        successMessage: form.thankYouMessage,
        fields: questions,
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
    console.error('Error fetching feedback form:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الفورم' },
      { status: 500 }
    )
  }
}

// POST - Save feedback form configuration
export async function POST(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { id: hackathonId } = params
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

    // Upsert form design
    const form = await prisma.hackathonFeedbackForm.upsert({
      where: { hackathonId },
      create: {
        hackathonId,
        isEnabled: true,
        title: title || 'قيّم تجربتك في الهاكاثون',
        description: description || '',
        welcomeMessage: welcomeMessage || '',
        thankYouMessage: successMessage || 'شكراً لك! تقييمك يساعدنا على التحسين',
        ratingScale: 5,
        primaryColor: primaryColor || '#01645e',
        secondaryColor: secondaryColor || '#3ab666',
        accentColor: accentColor || '#c3e956',
        backgroundColor: backgroundColor || '#ffffff',
        coverImage: coverImage || null,
        logoUrl: logoUrl || null,
        customCss: customCss || null,
        questions: JSON.stringify(fields || [])
      },
      update: {
        isEnabled: true,
        title: title || 'قيّم تجربتك في الهاكاثون',
        description: description || '',
        welcomeMessage: welcomeMessage || '',
        thankYouMessage: successMessage || 'شكراً لك! تقييمك يساعدنا على التحسين',
        primaryColor: primaryColor || '#01645e',
        secondaryColor: secondaryColor || '#3ab666',
        accentColor: accentColor || '#c3e956',
        backgroundColor: backgroundColor || '#ffffff',
        coverImage: coverImage || null,
        logoUrl: logoUrl || null,
        customCss: customCss || null,
        questions: JSON.stringify(fields || [])
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الفورم بنجاح',
      form
    })
  } catch (error) {
    console.error('Error saving feedback form:', error)
    return NextResponse.json(
      { error: 'فشل في حفظ الفورم' },
      { status: 500 }
    )
  }
}

