import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // تحويل الملف إلى Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // رفع على Cloudinary
    const result = await uploadToCloudinary(
      buffer,
      'blog-images', // مجلد الصور
      file.name.split('.')[0] // اسم الملف بدون الامتداد
    )

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

// زيادة حجم الملف المسموح
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}
