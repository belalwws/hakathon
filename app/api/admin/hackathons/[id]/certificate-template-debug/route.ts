import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 DEBUG: Certificate upload started')

    // Step 1: Get hackathon ID
    const { id: hackathonId } = await params
    console.log('✅ Step 1: Hackathon ID:', hackathonId)

    // Step 2: Check if we can import JWT
    try {
      const jwt = await import('jsonwebtoken')
      console.log('✅ Step 2: JWT imported successfully')
    } catch (error) {
      console.error('❌ Step 2: JWT import failed:', error)
      return NextResponse.json({ error: 'JWT import failed' }, { status: 500 })
    }
    
    // Step 3: Check if we can import Prisma and verify hackathon exists
    let prisma: any
    try {
      const prismaModule = await import('@/lib/prisma')
      prisma = prismaModule.prisma
      console.log('✅ Step 3: Prisma imported successfully')

      // Check if hackathon exists
      const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        select: { id: true, title: true, certificateTemplate: true }
      })

      if (!hackathon) {
        console.error('❌ Step 3: Hackathon not found:', hackathonId)
        return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
      }

      console.log('✅ Step 3: Hackathon found:', {
        id: hackathon.id,
        title: hackathon.title,
        currentTemplate: hackathon.certificateTemplate
      })

    } catch (error) {
      console.error('❌ Step 3: Prisma import or hackathon check failed:', error)
      return NextResponse.json({ error: 'Prisma import or hackathon check failed: ' + error.message }, { status: 500 })
    }
    
    // Step 4: Check if we can import storage
    try {
      const { uploadFile } = await import('@/lib/storage')
      console.log('✅ Step 4: Storage imported successfully')
    } catch (error) {
      console.error('❌ Step 4: Storage import failed:', error)
      return NextResponse.json({ error: 'Storage import failed' }, { status: 500 })
    }

    // Step 5: Check authentication (optional for debug)
    try {
      let token = request.headers.get('authorization')?.replace('Bearer ', '')
      if (!token) {
        token = request.cookies.get('auth-token')?.value
      }

      if (token) {
        const { verifyToken } = await import('@/lib/auth')
        const payload = await verifyToken(token)
        if (payload && payload.role === 'admin') {
          console.log('✅ Step 5: Admin authentication successful for:', payload.email)
        } else {
          console.log('⚠️ Step 5: Token found but not valid admin')
        }
      } else {
        console.log('⚠️ Step 5: No authentication token found (continuing anyway for debug)')
      }
    } catch (error) {
      console.log('⚠️ Step 5: Authentication check failed (continuing anyway for debug):', error.message)
    }

    // Step 6: Check environment variables
    try {
      console.log('✅ Step 6: Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        hasCloudinaryName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasCloudinaryKey: !!process.env.CLOUDINARY_API_KEY,
        hasCloudinarySecret: !!process.env.CLOUDINARY_API_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET
      })
    } catch (error) {
      console.error('❌ Step 6: Environment check failed:', error)
      return NextResponse.json({ error: 'Environment check failed' }, { status: 500 })
    }
    
    // Step 7: Try to parse form data
    let file: File
    try {
      const formData = await request.formData()
      console.log('✅ Step 7: Form data parsed, keys:', Array.from(formData.keys()))

      file = formData.get('certificateTemplate') as File
      if (!file) {
        return NextResponse.json({ error: 'No file in form data' }, { status: 400 })
      }

      console.log('✅ Step 7: File found:', {
        name: file.name,
        size: file.size,
        type: file.type
      })

    } catch (error) {
      console.error('❌ Step 7: Form data parsing failed:', error)
      return NextResponse.json({ error: 'Form data parsing failed' }, { status: 400 })
    }

    // Step 8: Try to convert file to buffer
    let buffer: Buffer
    try {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      console.log('✅ Step 8: Buffer conversion successful:', buffer.length, 'bytes')
    } catch (error) {
      console.error('❌ Step 8: Buffer conversion failed:', error)
      return NextResponse.json({ error: 'Buffer conversion failed' }, { status: 500 })
    }

    // Step 9: Try to upload file
    try {
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png'
      const fileName = `debug-${hackathonId}-${timestamp}.${fileExtension}`

      console.log('🔄 Step 9: Starting upload with filename:', fileName)

      const uploadResult = await uploadFile(buffer, fileName, file.type, 'certificates')

      console.log('✅ Step 9: Upload result:', {
        success: uploadResult.success,
        url: uploadResult.url,
        error: uploadResult.error
      })

      if (!uploadResult.success) {
        return NextResponse.json({
          error: 'Upload failed: ' + uploadResult.error,
          step: 9
        }, { status: 500 })
      }

      // Step 10: Try to update database
      try {
        console.log('💾 Step 10: Updating database with URL:', uploadResult.url)

        await prisma.hackathon.update({
          where: { id: hackathonId },
          data: {
            certificateTemplate: uploadResult.url
          }
        })

        console.log('✅ Step 10: Database updated successfully')

        return NextResponse.json({
          success: true,
          message: 'All steps completed successfully including database update',
          uploadResult: uploadResult,
          databaseUpdated: true
        })

      } catch (error) {
        console.error('❌ Step 10: Database update failed:', error)
        return NextResponse.json({
          error: 'Database update failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
          step: 10,
          uploadResult: uploadResult,
          uploadSuccessful: true
        }, { status: 500 })
      }

    } catch (error) {
      console.error('❌ Step 9: Upload failed:', error)
      return NextResponse.json({
        error: 'Upload step failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        step: 9
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ DEBUG: Unexpected error:', error)
    return NextResponse.json({
      error: 'Debug failed: ' + (error.message || 'Unknown error'),
      stack: error.stack
    }, { status: 500 })
  }
}
