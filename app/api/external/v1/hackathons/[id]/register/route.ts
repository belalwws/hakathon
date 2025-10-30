import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// CORS headers for external API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
}

// Validation schema for registration
const registrationSchema = z.object({
  // Required fields
  name: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين').max(100),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  
  // Optional fields
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل').optional(),
  city: z.string().optional(),
  nationality: z.string().optional(),
  university: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.string().optional(),
  preferredRole: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  motivation: z.string().optional(),
  teamRole: z.string().optional(),
  source: z.string().optional(), // من أين سمع عن الهاكاثون
  
  // Custom form data
  customData: z.record(z.any()).optional()
})

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

// GET /api/external/v1/hackathons/[id]/register - Get hackathon registration info
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params

    // Get API key from headers
    const apiKey = request.headers.get('X-API-Key')
    if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' }, 
        { status: 401, headers: corsHeaders }
      )
    }

    // Get hackathon info
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        maxParticipants: true,
        requirements: true,
        categories: true,
        settings: true,
        _count: {
          select: {
            participants: true
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' }, 
        { status: 404, headers: corsHeaders }
      )
    }

    // Check if registration is open
    const now = new Date()
    const registrationOpen = hackathon.status === 'open' && 
                           (!hackathon.registrationDeadline || hackathon.registrationDeadline > now)

    // Get registration form if exists
    let registrationForm = null
    try {
      const form = await prisma.$queryRaw`
        SELECT * FROM hackathon_forms 
        WHERE hackathonId = ${hackathonId} AND isActive = 1
        LIMIT 1
      ` as any[]
      
      if (form.length > 0) {
        registrationForm = {
          id: form[0].id,
          title: form[0].title,
          description: form[0].description,
          fields: JSON.parse(form[0].fields || '[]'),
          settings: JSON.parse(form[0].settings || '{}')
        }
      }
    } catch (error) {
      console.log('Could not fetch registration form:', error)
    }

    return NextResponse.json({
      hackathon: {
        id: hackathon.id,
        title: hackathon.title,
        description: hackathon.description,
        status: hackathon.status,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        registrationDeadline: hackathon.registrationDeadline,
        maxParticipants: hackathon.maxParticipants,
        currentParticipants: hackathon._count.participants,
        requirements: hackathon.requirements,
        categories: hackathon.categories,
        settings: hackathon.settings,
        registrationOpen
      },
      registrationForm
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error fetching hackathon info:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST /api/external/v1/hackathons/[id]/register - Register for hackathon
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params

    // Get API key from headers
    const apiKey = request.headers.get('X-API-Key')
    if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' }, 
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    
    // Validate input data
    const validationResult = registrationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        }, 
        { status: 400, headers: corsHeaders }
      )
    }

    const data = validationResult.data

    // Check if hackathon exists and is open for registration
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        title: true,
        status: true,
        registrationDeadline: true,
        maxParticipants: true,
        _count: {
          select: {
            participants: true
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' }, 
        { status: 404, headers: corsHeaders }
      )
    }

    // Check if registration is open
    const now = new Date()
    if (hackathon.status !== 'open') {
      return NextResponse.json(
        { error: 'Registration is not open for this hackathon' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    if (hackathon.registrationDeadline && hackathon.registrationDeadline < now) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Check participant limit
    if (hackathon.maxParticipants && hackathon._count.participants >= hackathon.maxParticipants) {
      return NextResponse.json(
        { error: 'Maximum number of participants reached' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    // Create user if doesn't exist
    if (!user) {
      const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null
      
      user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          phone: data.phone || '',
          city: data.city || '',
          nationality: data.nationality || '',
          preferredRole: data.preferredRole || '',
          skills: data.skills || '',
          experience: data.experience || '',
          role: 'participant'
        }
      })
    }

    // Check if already registered for this hackathon
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        userId: user.id,
        hackathonId: hackathonId
      }
    })

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'User already registered for this hackathon' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Create participant record
    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        hackathonId: hackathonId,
        teamRole: data.teamRole || data.preferredRole || 'مطور',
        status: 'pending', // Will be reviewed by admin
        registeredAt: new Date(),
        // Store additional data as JSON
        projectDescription: JSON.stringify({
          university: data.university,
          major: data.major,
          graduationYear: data.graduationYear,
          portfolioUrl: data.portfolioUrl,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          motivation: data.motivation,
          source: data.source,
          customData: data.customData
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      participant: {
        id: participant.id,
        status: participant.status,
        registeredAt: participant.registeredAt
      },
      hackathon: {
        id: hackathon.id,
        title: hackathon.title
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error registering participant:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    )
  }
}
