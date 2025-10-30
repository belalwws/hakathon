import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Load all submissions for hackathon
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')

    console.log('📋 Loading submissions for hackathon:', hackathonId)

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Build where clause
    const whereClause: any = { hackathonId }
    if (status && status !== 'all') {
      whereClause.status = status
    }

    // Get submissions
    const submissions = await prisma.participant.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            university: true,
            major: true,
            skills: true,
            portfolio: true,
            experience: true
          }
        }
      }
    })

    // Transform data for frontend
    const transformedSubmissions = submissions.map(submission => ({
      id: submission.id,
      submittedAt: submission.createdAt.toISOString(),
      status: submission.status || 'pending',
      userData: {
        name: submission.user?.name || 'غير محدد',
        email: submission.user?.email || 'غير محدد',
        phone: submission.user?.phone || '',
        university: submission.user?.university || '',
        major: submission.user?.major || '',
        skills: submission.user?.skills || '',
        portfolio: submission.user?.portfolio || '',
        experience: submission.user?.experience || '',
        motivation: submission.motivation || '',
        teamPreference: submission.teamPreference || '',
        dietaryRestrictions: submission.dietaryRestrictions || '',
        emergencyContact: submission.emergencyContact || '',
        ...submission.additionalInfo ? (typeof submission.additionalInfo === 'string' ? JSON.parse(submission.additionalInfo) : submission.additionalInfo) : {}
      },
      reviewedBy: submission.additionalNotes || '',
      reviewedAt: submission.updatedAt?.toISOString(),
      notes: submission.additionalNotes || ''
    }))

    console.log('✅ Submissions loaded:', transformedSubmissions.length)

    return NextResponse.json({
      success: true,
      submissions: transformedSubmissions,
      total: transformedSubmissions.length
    })

  } catch (error) {
    console.error('❌ Error loading submissions:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل الطلبات' },
      { status: 500 }
    )
  }
}

// POST - Create new submission (for testing or manual entry)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params
    const body = await request.json()

    console.log('📝 Creating new submission for hackathon:', hackathonId)

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'الاسم والبريد الإلكتروني مطلوبان' }, { status: 400 })
    }

    // Check if user already registered
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        hackathonId,
        email: body.email
      }
    })

    if (existingParticipant) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }, { status: 400 })
    }

    // Create submission
    const submission = await prisma.participant.create({
      data: {
        hackathonId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        university: body.university,
        major: body.major,
        skills: body.skills,
        portfolio: body.portfolio,
        experience: body.experience,
        motivation: body.motivation,
        teamPreference: body.teamPreference,
        dietaryRestrictions: body.dietaryRestrictions,
        emergencyContact: body.emergencyContact,
        status: 'pending',
        customFields: body.customFields ? JSON.stringify(body.customFields) : null
      }
    })

    console.log('✅ Submission created:', submission.id)

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      submission: {
        id: submission.id,
        submittedAt: submission.createdAt.toISOString(),
        status: submission.status
      }
    })

  } catch (error) {
    console.error('❌ Error creating submission:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الطلب' },
      { status: 500 }
    )
  }
}
