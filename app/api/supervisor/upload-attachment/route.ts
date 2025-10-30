import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { uploadToCloudinary, uploadRawToCloudinary } from '@/lib/cloudinary'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface JWTPayload {
  userId: string
  role: string
  email: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload request received')

    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.log('❌ No auth token')
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    let payload: JWTPayload
    try {
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload
      console.log('✅ Token verified:', payload.role)
    } catch (error) {
      console.log('❌ Invalid token')
      return NextResponse.json({ message: 'رمز غير صالح' }, { status: 401 })
    }

    // Check if user is supervisor or admin
    if (!['admin', 'supervisor'].includes(payload.role)) {
      console.log('❌ Unauthorized role:', payload.role)
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
    }

    // Check Cloudinary config
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    }

    console.log('☁️ Cloudinary config:', {
      cloud_name: cloudinaryConfig.cloud_name ? '✓' : '✗',
      api_key: cloudinaryConfig.api_key ? '✓' : '✗',
      api_secret: cloudinaryConfig.api_secret ? '✓' : '✗',
    })

    if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
      console.error('❌ Missing Cloudinary configuration')
      return NextResponse.json(
        { message: 'خطأ في إعدادات التخزين السحابي' },
        { status: 500 }
      )
    }

    // Get the file from the request
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('❌ No file in request')
      return NextResponse.json({ message: 'لم يتم اختيار ملف' }, { status: 400 })
    }

    console.log('📄 File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json(
        { message: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
    const allowedDocTypes = ['application/pdf']
    const allowedTypes = [...allowedImageTypes, ...allowedDocTypes]

    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json(
        { message: 'نوع الملف غير مدعوم. الملفات المدعومة: JPG, PNG, GIF, WEBP, PDF' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    console.log('🔄 Converting file to buffer...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('✅ Buffer created, size:', buffer.length)

    // Determine folder based on file type
    const isImage = allowedImageTypes.includes(file.type)
    const folder = isImage ? 'email-attachments/images' : 'email-attachments/documents'

    console.log('☁️ Uploading to Cloudinary...', {
      isImage,
      folder,
      fileName: file.name,
    })

    // Upload to Cloudinary using helper functions
    try {
      let uploadResult

      if (isImage) {
        // Upload image
        uploadResult = await uploadToCloudinary(buffer, folder, file.name)
      } else {
        // Upload PDF/document
        uploadResult = await uploadRawToCloudinary(buffer, folder, file.name)
      }

      console.log('✅ Upload success:', uploadResult.url)

      // Return the secure URL
      return NextResponse.json({
        success: true,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        format: uploadResult.format,
        type: file.type,
      })
    } catch (cloudinaryError: any) {
      console.error('❌ Cloudinary upload failed:', cloudinaryError)
      return NextResponse.json(
        { 
          message: 'فشل رفع الملف إلى التخزين السحابي',
          error: cloudinaryError.message || 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Upload error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ أثناء رفع الملف', error: error.message },
      { status: 500 }
    )
  }
}

// Next.js 15 - no need for config export, uses route segment config instead
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
