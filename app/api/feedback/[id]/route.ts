import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch feedback form
export async function GET(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { id: hackathonId } = params

    // Fetch hackathon
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
    }

    // Fetch feedback form
    let form = await prisma.hackathonFeedbackForm.findUnique({
      where: { hackathonId }
    })

    // If no form exists, create default one
    if (!form) {
      form = await prisma.hackathonFeedbackForm.create({
        data: {
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
            {
              id: 'q1',
              question: 'كيف كان مستوى التنظيم؟',
              type: 'rating',
              required: true
            },
            {
              id: 'q2',
              question: 'هل كانت المواضيع والتحديات مناسبة؟',
              type: 'rating',
              required: true
            },
            {
              id: 'q3',
              question: 'ما أكثر شيء أعجبك في الهاكاثون؟',
              type: 'textarea',
              required: false
            }
          ])
        }
      })
    }

    // Parse questions
    const formData = {
      ...form,
      questions: JSON.parse(form.questions)
    }

    return NextResponse.json({
      form: formData,
      hackathonTitle: hackathon.title
    })

  } catch (error) {
    console.error('Error fetching feedback form:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Submit feedback
export async function POST(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { id: hackathonId } = params
    const body = await request.json()
    const { participantName, participantEmail, overallRating, responses, suggestions } = body

    // Validate required fields
    if (!participantName || !participantEmail || !overallRating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
    }

    // Get form
    const form = await prisma.hackathonFeedbackForm.findUnique({
      where: { hackathonId }
    })

    if (!form || !form.isEnabled) {
      return NextResponse.json({ error: 'Feedback form not available' }, { status: 400 })
    }

    // Check if already submitted
    const existing = await prisma.hackathonFeedback.findUnique({
      where: {
        hackathonId_participantEmail: {
          hackathonId,
          participantEmail
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'You have already submitted feedback' }, { status: 400 })
    }

    // Create feedback
    const feedback = await prisma.hackathonFeedback.create({
      data: {
        hackathonId,
        formId: form.id,
        participantEmail,
        participantName,
        overallRating,
        responses: JSON.stringify(responses),
        suggestions
      }
    })

    return NextResponse.json({
      success: true,
      feedback
    })

  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

