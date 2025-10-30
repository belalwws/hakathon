import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const hackathonId = formData.get('hackathonId') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string || null
    const bio = formData.get('bio') as string || null
    const experience = formData.get('experience') as string || null
    const expertise = formData.get('expertise') as string || null
    const linkedin = formData.get('linkedin') as string || null
    const twitter = formData.get('twitter') as string || null
    const website = formData.get('website') as string || null
    const motivation = formData.get('motivation') as string || null
    const availability = formData.get('availability') as string || null
    const previousWork = formData.get('previousWork') as string || null
    const profileImage = formData.get('profileImage') as File | null

    // Validation
    if (!hackathonId || !name || !email) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة مفقودة' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صالح' },
        { status: 400 }
      )
    }

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: 'الهاكاثون غير موجود' },
        { status: 404 }
      )
    }

    // Check for duplicate application
    const existingApplication = await prisma.adminApplication.findFirst({
      where: {
        hackathonId,
        email
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'لقد قمت بإرسال طلب مسبقاً لهذا الهاكاثون' },
        { status: 400 }
      )
    }

    let profileImageUrl = null

    // Handle profile image upload
    if (profileImage && profileImage.size > 0) {
      // Validate image
      if (profileImage.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json(
          { error: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' },
          { status: 400 }
        )
      }

      if (!profileImage.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'يرجى اختيار ملف صورة صالح' },
          { status: 400 }
        )
      }

      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'admin-profiles')
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const fileExtension = profileImage.name.split('.').pop()
        const fileName = `admin_${hackathonId}_${timestamp}.${fileExtension}`
        const filePath = join(uploadsDir, fileName)

        // Convert file to buffer and save
        const bytes = await profileImage.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        profileImageUrl = `/uploads/admin-profiles/${fileName}`
      } catch (error) {
        console.error('Error uploading profile image:', error)
        return NextResponse.json(
          { error: 'فشل في رفع الصورة' },
          { status: 500 }
        )
      }
    }

    // Create admin application
    const application = await prisma.adminApplication.create({
      data: {
        hackathonId,
        name,
        email,
        phone,
        bio,
        experience,
        expertise,
        linkedin,
        twitter,
        website,
        profileImage: profileImageUrl,
        motivation,
        availability,
        previousWork,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلبك بنجاح',
      applicationId: application.id
    })

  } catch (error) {
    console.error('Error creating admin application:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hackathonId = searchParams.get('hackathonId')
    const status = searchParams.get('status')

    let whereClause: any = {}
    
    if (hackathonId) {
      whereClause.hackathonId = hackathonId
    }
    
    if (status) {
      whereClause.status = status
    }

    const applications = await prisma.adminApplication.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: true
      }
    })

    return NextResponse.json(applications)

  } catch (error) {
    console.error('Error fetching admin applications:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الطلبات' },
      { status: 500 }
    )
  }
}
