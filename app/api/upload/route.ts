import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'

// POST /api/upload - Upload file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'hackathon'

    if (!file) {
      return NextResponse.json(
        { error: 'الملف مطلوب' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, folder, file.name)

    console.log('✅ File uploaded to Cloudinary:', result.url)

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      width: result.width,
      height: result.height,
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json(
      { error: 'فشل في رفع الملف' },
      { status: 500 }
    )
  }
}

