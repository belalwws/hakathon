import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 TEST: Cloudinary upload test started')
    
    // Step 1: Parse form data
    let file: File
    try {
      const formData = await request.formData()
      console.log('✅ Step 1: Form data parsed, keys:', Array.from(formData.keys()))
      
      file = formData.get('file') as File
      if (!file) {
        return NextResponse.json({ error: 'No file in form data' }, { status: 400 })
      }
      
      console.log('✅ Step 1: File found:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
    } catch (error) {
      console.error('❌ Step 1: Form data parsing failed:', error)
      return NextResponse.json({ error: 'Form data parsing failed' }, { status: 400 })
    }
    
    // Step 2: Convert file to buffer
    let buffer: Buffer
    try {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      console.log('✅ Step 2: Buffer conversion successful:', buffer.length, 'bytes')
    } catch (error) {
      console.error('❌ Step 2: Buffer conversion failed:', error)
      return NextResponse.json({ error: 'Buffer conversion failed' }, { status: 500 })
    }
    
    // Step 3: Test Cloudinary configuration
    try {
      console.log('✅ Step 3: Cloudinary config check:', {
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME
      })
    } catch (error) {
      console.error('❌ Step 3: Config check failed:', error)
      return NextResponse.json({ error: 'Config check failed' }, { status: 500 })
    }
    
    // Step 4: Try direct Cloudinary upload
    try {
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png'
      const fileName = `test-cloudinary-${timestamp}.${fileExtension}`
      
      console.log('🔄 Step 4: Starting Cloudinary upload with filename:', fileName)
      
      const uploadResult = await uploadToCloudinary(buffer, fileName, 'test')
      
      console.log('✅ Step 4: Cloudinary upload result:', {
        success: uploadResult.success,
        url: uploadResult.url,
        error: uploadResult.error
      })
      
      if (!uploadResult.success) {
        return NextResponse.json({ 
          error: 'Cloudinary upload failed: ' + uploadResult.error,
          step: 4
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Cloudinary upload test completed successfully',
        uploadResult: uploadResult
      })
      
    } catch (error) {
      console.error('❌ Step 4: Cloudinary upload failed:', error)
      return NextResponse.json({ 
        error: 'Cloudinary upload step failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        step: 4,
        stack: error instanceof Error ? error.stack : undefined
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ TEST: Unexpected error:', error)
    return NextResponse.json({
      error: 'Test failed: ' + (error.message || 'Unknown error'),
      stack: error.stack
    }, { status: 500 })
  }
}
