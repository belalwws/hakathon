import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Supervisor certificate template upload started...')

    // Verify supervisor authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.log('❌ No auth token provided')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      console.log('❌ Invalid token or not supervisor/admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('certificateImage') as File
    const hackathonId = formData.get('hackathonId') as string
    const certificateType = formData.get('certificateType') as string

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ error: 'ملف الشهادة مطلوب' }, { status: 400 })
    }

    if (!hackathonId) {
      console.log('❌ No hackathon ID provided')
      return NextResponse.json({ error: 'معرف الهاكاثون مطلوب' }, { status: 400 })
    }

    if (!certificateType || !['participant', 'judge', 'expert', 'supervisor'].includes(certificateType)) {
      console.log('❌ Invalid certificate type:', certificateType)
      return NextResponse.json({ error: 'نوع الشهادة غير صحيح' }, { status: 400 })
    }

    console.log('✅ Valid certificate type:', certificateType)

    console.log('📁 File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. يرجى رفع صورة (PNG, JPG, SVG, WEBP)' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' },
        { status: 400 }
      )
    }

    // Convert file to base64
    console.log('🔄 Converting file to base64...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    console.log('☁️ Uploading to Cloudinary...')
    const uploadResult = await uploadToCloudinary(
      dataUrl,
      `certificates/templates/${hackathonId}/${certificateType}`,
      `template-${certificateType}-${Date.now()}`
    )

    console.log('✅ Upload successful:', uploadResult.url)

    return NextResponse.json({
      message: 'تم رفع قالب الشهادة بنجاح',
      url: uploadResult.url,
      publicId: uploadResult.publicId
    })

  } catch (error) {
    console.error('❌ Certificate template upload error:', error)
    return NextResponse.json(
      { error: 'فشل رفع قالب الشهادة' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

