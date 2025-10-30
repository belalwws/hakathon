import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

/**
 * POST /api/register
 * Register new user with automatic organization creation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, organizationName } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create organization slug from name or email
    const orgSlug = (organizationName || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now().toString().slice(-6)

    // Create user and organization in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the user with admin role
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'admin', // New users are admins of their org
          isActive: true,
          emailVerified: false,
        }
      })

      // 2. Create organization for the user
      const organization = await tx.organization.create({
        data: {
          name: organizationName || `${name}'s Organization`,
          slug: orgSlug,
          plan: 'free', // Start with free plan
          status: 'active',
          primaryColor: '#01645e',
          secondaryColor: '#3ab666',
          accentColor: '#c3e956',
          maxHackathons: 1,
          maxUsers: 10,
          maxParticipants: 50,
          maxStorage: BigInt(1073741824), // 1GB
          maxEmailsPerMonth: 100,
          billingEmail: email,
        }
      })

      // 3. Link user to organization as owner
      await tx.organizationUser.create({
        data: {
          userId: newUser.id,
          organizationId: organization.id,
          role: 'owner',
          isOwner: true,
        }
      })

      // 4. Create initial usage metrics
      const now = new Date()
      const period = new Date(now.getFullYear(), now.getMonth(), 1)
      
      await tx.usageMetrics.create({
        data: {
          organizationId: organization.id,
          period,
          hackathonsUsed: 0,
          usersUsed: 1,
          participantsUsed: 0,
          emailsSent: 0,
          storageUsed: BigInt(0),
          apiCallsMade: 0,
        }
      })

      return { user: newUser, organization }
    })

    console.log('✅ User registered:', {
      userId: result.user.id,
      email: result.user.email,
      organizationId: result.organization.id,
      organizationName: result.organization.name
    })

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
        plan: result.organization.plan,
      }
    })

  } catch (error: any) {
    console.error('❌ Registration error:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء إنشاء الحساب',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
