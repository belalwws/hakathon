import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary directly
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 QUICK FIX: Direct upload test')
    
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
    
    // Check Cloudinary config
    console.log('☁️ Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    })
    
    // Direct Cloudinary upload
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'quick-test',
          public_id: `test-${Date.now()}`,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary error:', error)
            reject(error)
          } else {
            console.log('✅ Cloudinary success:', result?.secure_url)
            resolve(result)
          }
        }
      ).end(buffer)
    })
    
    return NextResponse.json({
      success: true,
      message: 'Upload successful!',
      result: result
    })
    
  } catch (error: any) {
    console.error('❌ Quick fix upload error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      details: error.stack
    }, { status: 500 })
  }
}
