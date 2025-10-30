import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { id: hackathonId } = params

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

    // Get form design or return default
    const formDesign = await prisma.adminFormDesign.findUnique({
      where: { hackathonId }
    })

    if (!formDesign) {
      // Return default design
      return NextResponse.json({
        hackathonId,
        isEnabled: true,
        coverImage: null,
        primaryColor: "#01645e",
        secondaryColor: "#3ab666",
        accentColor: "#c3e956",
        backgroundColor: "#ffffff",
        title: "طلب انضمام كمشرف",
        description: "انضم إلى فريق الإشراف في الهاكاثون",
        welcomeMessage: "نرحب بانضمامك إلى فريق الإشراف. يرجى ملء النموذج أدناه.",
        successMessage: "شكراً لك! تم إرسال طلبك بنجاح. سيتم مراجعته والرد عليك قريباً.",
        logoUrl: null,
        customCss: null,
        settings: null
      })
    }

    return NextResponse.json(formDesign)

  } catch (error) {
    console.error('Error fetching admin form design:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب تصميم النموذج' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { id: hackathonId } = params
    const formData = await request.formData()

    // Extract form fields
    const isEnabled = formData.get('isEnabled') === 'true'
    const primaryColor = formData.get('primaryColor') as string || "#01645e"
    const secondaryColor = formData.get('secondaryColor') as string || "#3ab666"
    const accentColor = formData.get('accentColor') as string || "#c3e956"
    const backgroundColor = formData.get('backgroundColor') as string || "#ffffff"
    const title = formData.get('title') as string || null
    const description = formData.get('description') as string || null
    const welcomeMessage = formData.get('welcomeMessage') as string || null
    const successMessage = formData.get('successMessage') as string || null
    const logoUrl = formData.get('logoUrl') as string || null
    const customCss = formData.get('customCss') as string || null
    const settings = formData.get('settings') as string || null
    
    const coverImage = formData.get('coverImage') as File | null

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

    let coverImageUrl = null

    // Handle cover image upload
    if (coverImage && coverImage.size > 0) {
      // Validate image
      if (coverImage.size > 10 * 1024 * 1024) { // 10MB limit for cover images
        return NextResponse.json(
          { error: 'حجم صورة الغلاف يجب أن يكون أقل من 10 ميجابايت' },
          { status: 400 }
        )
      }

      if (!coverImage.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'يرجى اختيار ملف صورة صالح للغلاف' },
          { status: 400 }
        )
      }

      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'admin-form-covers')
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const fileExtension = coverImage.name.split('.').pop()
        const fileName = `admin_form_cover_${hackathonId}_${timestamp}.${fileExtension}`
        const filePath = join(uploadsDir, fileName)

        // Convert file to buffer and save
        const bytes = await coverImage.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        coverImageUrl = `/uploads/admin-form-covers/${fileName}`
      } catch (error) {
        console.error('Error uploading cover image:', error)
        return NextResponse.json(
          { error: 'فشل في رفع صورة الغلاف' },
          { status: 500 }
        )
      }
    }

    // Create or update form design
    const formDesign = await prisma.adminFormDesign.upsert({
      where: { hackathonId },
      update: {
        isEnabled,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        title,
        description,
        welcomeMessage,
        successMessage,
        logoUrl,
        customCss,
        settings,
        ...(coverImageUrl && { coverImage: coverImageUrl })
      },
      create: {
        hackathonId,
        isEnabled,
        coverImage: coverImageUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        title,
        description,
        welcomeMessage,
        successMessage,
        logoUrl,
        customCss,
        settings
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حفظ تصميم النموذج بنجاح',
      formDesign
    })

  } catch (error) {
    console.error('Error saving admin form design:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ تصميم النموذج' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { id: hackathonId } = params
    const body = await request.json()

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

    // Update form design
    const formDesign = await prisma.adminFormDesign.upsert({
      where: { hackathonId },
      update: body,
      create: {
        hackathonId,
        ...body
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث تصميم النموذج بنجاح',
      formDesign
    })

  } catch (error) {
    console.error('Error updating admin form design:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث تصميم النموذج' },
      { status: 500 }
    )
  }
}
