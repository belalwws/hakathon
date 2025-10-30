import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 TEST: Simple upload test started')
    
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
    
    // Step 3: Try to upload file
    try {
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png'
      const fileName = `test-${timestamp}.${fileExtension}`
      
      console.log('🔄 Step 3: Starting upload with filename:', fileName)
      
      const uploadResult = await uploadFile(buffer, fileName, file.type, 'test')
      
      console.log('✅ Step 3: Upload result:', {
        success: uploadResult.success,
        url: uploadResult.url,
        error: uploadResult.error
      })
      
      if (!uploadResult.success) {
        return NextResponse.json({ 
          error: 'Upload failed: ' + uploadResult.error,
          step: 3
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Test upload completed successfully',
        uploadResult: uploadResult
      })
      
    } catch (error) {
      console.error('❌ Step 3: Upload failed:', error)
      return NextResponse.json({ 
        error: 'Upload step failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        step: 3
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
