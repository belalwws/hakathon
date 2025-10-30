import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Fetch feedback form design
export async function GET(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { id: hackathonId } = params

    // Verify admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch form design
    const design = await prisma.hackathonFeedbackForm.findUnique({
      where: { hackathonId }
    })

    if (!design) {
      // Return default design
      return NextResponse.json({
        design: {
          hackathonId,
          isEnabled: false,
          title: 'قيّم تجربتك في الهاكاثون',
          description: 'نود معرفة رأيك لتحسين تجربتك في الهاكاثونات القادمة',
          welcomeMessage: 'شكراً لمشاركتك! رأيك مهم جداً لنا',
          thankYouMessage: 'شكراً لك! تقييمك يساعدنا على التحسين',
          ratingScale: 5,
          primaryColor: '#01645e',
          secondaryColor: '#3ab666',
          accentColor: '#c3e956',
          backgroundColor: '#ffffff',
          questions: JSON.stringify([
            { id: 'q1', question: 'كيف كان مستوى التنظيم؟', type: 'rating', required: true },
            { id: 'q2', question: 'هل كانت المواضيع والتحديات مناسبة؟', type: 'rating', required: true },
            { id: 'q3', question: 'ما أكثر شيء أعجبك في الهاكاثون؟', type: 'textarea', required: false }
          ])
        }
      })
    }

    return NextResponse.json({ design })

  } catch (error) {
    console.error('Error fetching feedback form design:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Save feedback form design
export async function POST(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { id: hackathonId } = params

    // Verify admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    
    const isEnabled = formData.get('isEnabled') === 'true'
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const welcomeMessage = formData.get('welcomeMessage') as string | null
    const thankYouMessage = formData.get('thankYouMessage') as string | null
    const ratingScale = parseInt(formData.get('ratingScale') as string)
    const primaryColor = formData.get('primaryColor') as string
    const secondaryColor = formData.get('secondaryColor') as string
    const accentColor = formData.get('accentColor') as string
    const backgroundColor = formData.get('backgroundColor') as string
    const logoUrl = formData.get('logoUrl') as string | null
    const customCss = formData.get('customCss') as string | null
    const questions = formData.get('questions') as string
    const coverImageFile = formData.get('coverImage') as File | null

    // Handle cover image
    let coverImage: string | null = null
    if (coverImageFile) {
      const bytes = await coverImageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      coverImage = `data:${coverImageFile.type};base64,${buffer.toString('base64')}`
    }

    // Upsert form design
    const design = await prisma.hackathonFeedbackForm.upsert({
      where: { hackathonId },
      update: {
        isEnabled,
        title,
        description,
        welcomeMessage,
        thankYouMessage,
        ratingScale,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        logoUrl,
        customCss,
        questions,
        ...(coverImage && { coverImage })
      },
      create: {
        hackathonId,
        isEnabled,
        title,
        description,
        welcomeMessage,
        thankYouMessage,
        ratingScale,
        coverImage,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        logoUrl,
        customCss,
        questions
      }
    })

    return NextResponse.json({
      success: true,
      design
    })

  } catch (error) {
    console.error('Error saving feedback form design:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

