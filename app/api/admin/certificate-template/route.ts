import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Certificate template upload started...')

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.log('❌ No auth token provided')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      console.log('❌ Invalid token or not admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('certificateImage') as File

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ error: 'ملف الشهادة مطلوب' }, { status: 400 })
    }

    console.log('📁 File received:', file.name, 'Size:', file.size, 'Type:', file.type)

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json({
        error: 'نوع الملف غير مدعوم. يجب أن يكون صورة (JPG, PNG, WebP)'
      }, { status: 400 })
    }

    // Validate file size (max 4MB)
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json({
        error: 'حجم الملف كبير جداً. الحد الأقصى المسموح 4 ميجابايت'
      }, { status: 400 })
    }

    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(process.cwd(), 'public', 'certificates')
    console.log('📁 Certificates directory:', certificatesDir)

    try {
      await mkdir(certificatesDir, { recursive: true })
      console.log('✅ Certificates directory created/verified')
    } catch (error) {
      console.log('⚠️ Directory creation error (might already exist):', error)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `default-certificate-${timestamp}${fileExtension}`
    const filePath = path.join(certificatesDir, fileName)

    console.log('💾 Saving file to:', filePath)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    console.log('✅ File saved successfully')

    // Update certificate settings with new template path
    const publicPath = `/certificates/${fileName}`
    console.log('🔄 Updating certificate settings with new template path:', publicPath)

    // Try to update database settings first
    try {
      const settingsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/certificate-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namePositionY: 0.52,
          namePositionX: 0.50,
          nameFont: 'bold 48px Arial',
          nameColor: '#1a472a',
          certificateTemplate: publicPath,
          updatedBy: payload.name || 'admin'
        })
      })

      if (settingsResponse.ok) {
        console.log('✅ Certificate settings updated in database')
      } else {
        console.log('⚠️ Failed to update database settings, will continue anyway')
      }
    } catch (dbError) {
      console.log('⚠️ Database settings update failed:', dbError)
    }

    console.log('🎉 Certificate template upload completed successfully')

    return NextResponse.json({
      success: true,
      message: 'تم رفع قالب الشهادة بنجاح',
      fileName: fileName,
      filePath: publicPath
    })

  } catch (error: any) {
    console.error('❌ Error uploading certificate template:', error)
    return NextResponse.json({
      error: 'خطأ في رفع قالب الشهادة: ' + (error.message || 'خطأ غير معروف')
    }, { status: 500 })
  }
}
