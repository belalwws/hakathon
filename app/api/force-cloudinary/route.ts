import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 FORCE CLOUDINARY: Testing direct Cloudinary upload')
    
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    // Convert to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    console.log('🔄 Buffer created, size:', buffer.length)
    
    // Check environment variables
    console.log('🔧 Environment check:', {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    })
    
    // Force Cloudinary upload
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `force-test-${timestamp}.${fileExtension}`
    
    console.log('☁️ Forcing Cloudinary upload with filename:', fileName)
    
    const result = await uploadToCloudinary(buffer, fileName, 'certificates')
    
    console.log('📊 Cloudinary result:', result)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Cloudinary upload successful!',
        url: result.url,
        key: result.key
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Cloudinary upload failed: ' + result.error
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ Force Cloudinary error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      details: error.stack
    }, { status: 500 })
  }
}
