import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// ✅ Removed nodemailer import - now using template system only

// Lazy import prisma to avoid build-time errors
let prisma: any = null
async function getPrisma() {
  if (!prisma) {
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
    } catch (error) {
      console.error('Failed to import prisma:', error)
      return null
    }
  }
  return prisma
}

// POST /api/auth/register - Register new admin user with organization
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Multi-tenant Registration API called')
    const body = await request.json()
    console.log('📝 Registration data received:', {
      name: body.name,
      email: body.email,
      organizationName: body.organizationName,
      organizationSlug: body.organizationSlug,
      hasPassword: !!body.password
    })

    const {
      name,
      email,
      password,
      organizationName,
      organizationSlug
    } = body

    // Validate required fields
    if (!name || !email || !password || !organizationName || !organizationSlug) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ 
        error: 'الاسم والإيميل وكلمة المرور واسم المؤسسة ومعرّف المؤسسة مطلوبة' 
      }, { status: 400 })
    }

    // Validate slug format (URL-safe)
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(organizationSlug)) {
      console.log('❌ Invalid slug format:', organizationSlug)
      return NextResponse.json({ 
        error: 'معرّف المؤسسة يجب أن يحتوي على حروف صغيرة وأرقام وشرطات فقط' 
      }, { status: 400 })
    }

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    // Check if user already exists
    console.log('🔍 Checking if email exists:', email)
    const existingUser = await prismaClient.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email)
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
    }

    // Check if organization slug already exists
    console.log('🔍 Checking if organization slug exists:', organizationSlug)
    const existingOrg = await prismaClient.organization.findUnique({
      where: { slug: organizationSlug }
    })

    if (existingOrg) {
      console.log('❌ Organization slug already exists:', organizationSlug)
      return NextResponse.json({ error: 'معرّف المؤسسة مستخدم بالفعل. جرّب معرّفاً آخر' }, { status: 400 })
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create Organization + User + OrganizationUser in a transaction
    console.log('🏢 Creating organization and admin user...')
    const result = await prismaClient.$transaction(async (tx: any) => {
      // 1. Create Organization
      const newOrg = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationSlug,
          plan: 'free',
          status: 'active'
        }
      })
      console.log('✅ Organization created:', newOrg.name, 'ID:', newOrg.id)

      // 2. Create User with role='admin'
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'admin' as any
        }
      })
      console.log('✅ Admin user created:', newUser.email, 'ID:', newUser.id)

      // 3. Link User to Organization as owner
      const organizationUser = await tx.organizationUser.create({
        data: {
          userId: newUser.id,
          organizationId: newOrg.id,
          isOwner: true
        }
      })
      console.log('✅ User linked to organization as owner')

      return { user: newUser, organization: newOrg, organizationUser }
    })

    const { user, organization } = result
    console.log('✅ Multi-tenant registration completed successfully for:', user.email)

    // Create JWT token for automatic login
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: organization.id
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // Send welcome email using template system
    let emailSent = false
    try {
      console.log('📧 Attempting to send welcome email to:', user.email)
      const { sendTemplatedEmail } = await import('@/lib/mailer')

      const loginUrl = process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
        : 'https://hackpro.com/login'

      const emailResult = await sendTemplatedEmail(
        'welcome',
        user.email,
        {
          participantName: user.name,
          participantEmail: user.email,
          organizationName: organization.name,
          registrationDate: new Date().toLocaleDateString('ar-SA'),
          loginUrl: loginUrl,
          organizerName: 'فريق HackPro SaaS',
          organizerEmail: process.env.MAIL_FROM || 'no-reply@hackpro.com'
        }
      )
      
      if (emailResult && emailResult.actuallyMailed) {
        console.log('✅ Welcome email sent successfully to:', user.email)
        console.log('📧 Email ID:', emailResult.messageId)
        emailSent = true
      } else {
        console.warn('⚠️ Email not sent (SMTP not configured). Registration successful but no email sent.')
      }
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError)
      console.error('❌ Email error details:', emailError instanceof Error ? emailError.message : String(emailError))
      console.warn('⚠️ Registration successful but email failed to send')
      // Don't fail registration if email fails
    }

    // Create response with automatic login
    const response = NextResponse.json({
      message: emailSent 
        ? 'تم إنشاء المؤسسة والحساب بنجاح. تم إرسال إيميل ترحيبي إلى بريدك الإلكتروني' 
        : 'تم إنشاء المؤسسة والحساب بنجاح',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      },
      emailSent,
      autoLogin: true
    })

    // Set HTTP-only cookie for authentication
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    })

    console.log('✅ Cookie set successfully for user:', user.email)

    return response

  } catch (error) {
    console.error('❌ Error in multi-tenant registration:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error))
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ error: 'خطأ في التسجيل' }, { status: 500 })
  }
}

// ✅ Removed unused sendWelcomeEmail function - now using template system only

export const dynamic = 'force-dynamic'
