import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params
    
    const userRole = request.headers.get("x-user-role")
    
    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'participant'

    if (!file) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. يرجى رفع صورة (PNG, JPG, SVG, WEBP)' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const timestamp = Date.now()
    const fileName = `${type}-template-${hackathonId}-${timestamp}`
    
    const uploadResult = await uploadToCloudinary(
      buffer,
      `certificates/templates/${hackathonId}`,
      fileName
    )

    console.log('✅ Certificate template uploaded:', uploadResult.url)

    return NextResponse.json({
      message: 'تم رفع قالب الشهادة بنجاح',
      url: uploadResult.url,
      publicId: uploadResult.publicId
    })

  } catch (error) {
    console.error('❌ Error uploading certificate template:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في رفع قالب الشهادة' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

