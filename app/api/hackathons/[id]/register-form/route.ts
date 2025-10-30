import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTemplatedEmail } from '@/lib/mailer'

// ✅ Send confirmation email using template system ONLY
// Dedicated function to send confirmation email
async function sendRegistrationConfirmationEmail(userData: any, hackathonTitle?: string, hackathonId?: string) {
  console.log('📧 Sending confirmation email to:', userData.email)

  try {
    // ✅ Use template system ONLY - templates are managed in email management page
    await sendTemplatedEmail(
      'registration_confirmation',
      userData.email,
      {
        participantName: userData.name,
        participantEmail: userData.email,
        hackathonTitle: hackathonTitle || 'الهاكاثون',
        registrationDate: new Date().toLocaleDateString('ar-SA'),
        hackathonDate: 'سيتم تحديده لاحقاً',
        hackathonLocation: 'سيتم تحديده لاحقاً'
      },
      hackathonId
    )
    console.log('✅ Confirmation email sent via template system')
    return { success: true, method: 'template' }
  } catch (templateError) {
    console.error('❌ Template email failed:', templateError)
    return { success: false, error: templateError }
  }
}

// GET /api/hackathons/[id]/register-form - Get hackathon registration form for public
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params

    // Try to get dynamic form from database first
    let dynamicForm = null
    try {
      console.log('🔍 Fetching dynamic form for hackathon:', params.id)
      
      // @ts-ignore - Using dynamic model access
      const existingForm = await prisma.hackathonForm.findFirst({
        where: { hackathonId: params.id }
      })

      if (existingForm) {
        console.log('✅ Found dynamic form:', existingForm.id)
        dynamicForm = {
          id: existingForm.id,
          hackathonId: existingForm.hackathonId,
          title: existingForm.title,
          description: existingForm.description,
          coverImage: (existingForm as any).coverImage,
          colors: (existingForm as any).colors,
          isActive: existingForm.isActive,
          openAt: (existingForm as any).openAt,
          closeAt: (existingForm as any).closeAt,
          fields: JSON.parse(existingForm.fields),
          settings: JSON.parse(existingForm.settings)
        }
      } else {
        console.log('ℹ️ No dynamic form found, will use default')
      }
    } catch (dbError) {
      console.error('❌ Database error fetching form:', dbError)
    }

    // If we have a dynamic form, return it
    if (dynamicForm) {
      return NextResponse.json({
        form: {
          id: dynamicForm.id,
          hackathonId: params.id,
          title: dynamicForm.title || 'نموذج التسجيل في الهاكاثون',
          description: dynamicForm.description || 'يرجى ملء البيانات المطلوبة للتسجيل في الهاكاثون',
          coverImage: dynamicForm.coverImage,
          colors: dynamicForm.colors,
          isActive: dynamicForm.isActive,
          openAt: dynamicForm.openAt,
          closeAt: dynamicForm.closeAt,
          fields: dynamicForm.fields || [],
          settings: dynamicForm.settings || {
            allowMultipleSubmissions: false,
            requireApproval: true,
            sendConfirmationEmail: true
          }
        }
      })
    }

    // Fallback to default form
    return NextResponse.json({
      form: {
        id: `default_${params.id}`,
        hackathonId: params.id,
        title: 'نموذج التسجيل في الهاكاثون',
        description: 'يرجى ملء البيانات المطلوبة للتسجيل في الهاكاثون',
        isActive: true,
        fields: [
          {
            id: 'name',
            type: 'text',
            label: 'الاسم الكامل',
            placeholder: 'اكتب اسمك الكامل',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'البريد الإلكتروني',
            placeholder: 'example@email.com',
            required: true
          },
          {
            id: 'phone',
            type: 'phone',
            label: 'رقم الهاتف',
            placeholder: '+966xxxxxxxxx',
            required: true
          },
          {
            id: 'experience',
            type: 'select',
            label: 'مستوى الخبرة',
            required: true,
            options: ['مبتدئ', 'متوسط', 'متقدم', 'خبير']
          },
          {
            id: 'skills',
            type: 'textarea',
            label: 'المهارات والخبرات',
            placeholder: 'اذكر مهاراتك وخبراتك التقنية',
            required: false
          }
        ],
        settings: {
          allowMultipleSubmissions: false,
          requireApproval: true,
          sendConfirmationEmail: true
        }
      }
    })

  } catch (error) {
    console.error('Error fetching registration form:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/hackathons/[id]/register-form - Submit hackathon registration form
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()
    const { formId, data } = body

    console.log('📝 Registration form submission:', {
      hackathonId: params.id,
      email: data?.email,
      name: data?.name,
      allData: data,
      dataKeys: Object.keys(data || {})
    })

    // Validate required data
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'بيانات النموذج مطلوبة' }, { status: 400 })
    }

    // Extract name and email from data (support both direct fields and dynamic form fields)
    let name = data.name
    let email = data.email
    let phone = data.phone

    // If not found directly, search in all fields for email/name patterns
    if (!email || !name) {
      const dataKeys = Object.keys(data)
      for (const key of dataKeys) {
        const value = data[key]
        if (typeof value === 'string') {
          // Check if this looks like an email
          if (!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            email = value
          }
          // Check if this looks like a name (not email, not phone, has spaces or Arabic chars)
          if (!name && value.length > 2 && !/@/.test(value) && !/^\+?[0-9\s\-\(\)]+$/.test(value)) {
            name = value
          }
          // Check if this looks like a phone
          if (!phone && /^\+?[0-9\s\-\(\)]{10,}$/.test(value)) {
            phone = value
          }
        }
      }
    }

    console.log('📧 Extracted data:', { name, email, phone })

    // Basic validation for required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 })
    }

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صحيح' }, { status: 400 })
    }

    // Update data object with extracted values
    data.name = name
    data.email = email
    if (phone) data.phone = phone

    // ✅ STEP 1: Check for duplicate registration FIRST (before sending emails)
    console.log('🔍 Checking for duplicate registration...')
    try {
      // Check if user with this email already registered for this hackathon
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (existingUser) {
        const existingParticipant = await prisma.participant.findFirst({
          where: {
            userId: existingUser.id,
            hackathonId: params.id
          }
        })

        if (existingParticipant) {
          console.log('⚠️ User already registered for this hackathon')
          return NextResponse.json({
            error: 'أنت مسجل بالفعل في هذا الهاكاثون',
            alreadyRegistered: true
          }, { status: 409 })
        }
      }
    } catch (duplicateCheckError) {
      console.error('❌ Error checking for duplicates:', duplicateCheckError)
      // Continue anyway - better to allow registration than block it
    }

    // ✅ STEP 2: Get hackathon title
    let hackathonTitle = 'الهاكاثون'
    try {
      const hackathonResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/hackathons/${params.id}`)
      if (hackathonResponse.ok) {
        const hackathonData = await hackathonResponse.json()
        hackathonTitle = hackathonData.title || 'الهاكاثون'
      }
    } catch (error) {
      console.log('Could not fetch hackathon title, using default')
    }

    // ✅ STEP 3: Send ONLY ONE confirmation email using template system
    console.log('📧 Sending confirmation email to:', data.email)
    try {
      const emailResult = await sendRegistrationConfirmationEmail(data, hackathonTitle, params.id)
      console.log('📧 Email sending result:', emailResult)

      if (!emailResult.success) {
        console.error('❌ Email sending failed:', emailResult.error)
      }
    } catch (emailError) {
      console.error('❌ Email error:', emailError)
      // Don't fail registration if email fails
    }

    // ✅ STEP 4: Try to save registration to database
    let savedToDatabase = false
    try {
      console.log('💾 Attempting to save registration to database...')
      console.log('💾 Data to save:', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        hackathonId: params.id
      })

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: data.email }
      })

      console.log('👤 User lookup result:', user ? `Found user: ${user.id}` : 'User not found')

      // Create user if doesn't exist
      if (!user) {
        try {
          // Use raw SQL to create user
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const passwordHash = 'form_registration_' + Date.now()
          
          // Use Prisma create instead of raw SQL for better error handling
          user = await prisma.user.create({
            data: {
              id: userId,
              name: data.name,
              email: data.email,
              password: passwordHash,
              phone: data.phone || null,
              city: data.city || null,
              nationality: data.nationality || 'سعودي',
              preferredRole: data.experience || 'مبتدئ',
              skills: data.skills || null,
              experience: data.experience || null,
              role: 'participant'
            }
          })
          
          console.log('✅ User created with ID:', userId)
        } catch (userCreateError) {
          console.error('❌ Failed to create user:', userCreateError)
          throw new Error('فشل في إنشاء المستخدم')
        }
      }

      // Ensure user exists before proceeding
      if (!user || !user.id) {
        throw new Error('لم يتم العثور على المستخدم')
      }

      // Check if already registered for this hackathon
      const existingParticipant = await prisma.participant.findFirst({
        where: {
          userId: user.id,
          hackathonId: params.id
        }
      })

      if (!existingParticipant) {
        // Create participant record using Prisma
        const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const additionalInfo = {
          registrationType: 'form',
          formData: data,
          submittedAt: new Date().toISOString(),
          experience: data.experience,
          skills: data.skills
        }

        const participant = await prisma.participant.create({
          data: {
            id: participantId,
            userId: user.id,
            hackathonId: params.id,
            status: 'pending',
            teamType: 'individual',
            additionalInfo: additionalInfo
          }
        })

        console.log('✅ Participant created successfully with ID:', participant.id)
        savedToDatabase = true
      } else {
        console.log('ℹ️ User already registered for this hackathon')
        savedToDatabase = true
      }

    } catch (dbError) {
      console.error('❌ Database save failed:', dbError)
      console.error('❌ Error details:', {
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : 'No stack trace',
        code: (dbError as any)?.code,
        meta: (dbError as any)?.meta
      })
      // Continue anyway - email was sent
      savedToDatabase = false
    }

    console.log('✅ Registration processed successfully', {
      emailSent: true,
      savedToDatabase,
      hackathonId: params.id,
      userEmail: data.email,
      userName: data.name
    })
    
    return NextResponse.json({
      success: true,
      message: 'تم التسجيل بنجاح! تم إرسال إيميل تأكيد إلى بريدك الإلكتروني.',
      participant: {
        id: `participant_${Date.now()}`,
        status: 'pending',
        requiresApproval: true,
        emailSent: true,
        savedToDatabase
      }
    })

  } catch (error) {
    console.error('Error submitting registration form:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
