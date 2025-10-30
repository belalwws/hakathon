import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { makeCloudinaryFilePublic } from '@/lib/cloudinary'

/**
 * POST /api/admin/fix-attachment
 * Fix old private attachments by making them public
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('🔧 [fix-attachment] Fixing attachment:', url)

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/djva3nfy5/raw/upload/v1760907241/email-attachments/documents/filename.pdf
    const urlParts = url.split('/upload/')
    if (urlParts.length < 2) {
      return NextResponse.json({ error: 'Invalid Cloudinary URL' }, { status: 400 })
    }

    // Get the part after /upload/ and remove version number
    const pathWithVersion = urlParts[1]
    const pathParts = pathWithVersion.split('/')

    // Remove version (v1760907241) and reconstruct public_id
    const publicIdParts = pathParts.slice(1) // Skip version
    const publicIdWithExtension = publicIdParts.join('/')

    // Decode URL encoding
    const decodedPublicId = decodeURIComponent(publicIdWithExtension)

    // Remove extension
    const publicId = decodedPublicId.replace(/\.[^/.]+$/, '')

    console.log('📋 [fix-attachment] Extracted public_id:', publicId)
    console.log('📋 [fix-attachment] Decoded public_id:', decodedPublicId)

    // Make the file public
    const newUrl = await makeCloudinaryFilePublic(publicId)

    console.log('✅ [fix-attachment] File is now public:', newUrl)

    return NextResponse.json({
      success: true,
      oldUrl: url,
      newUrl: newUrl,
      message: 'الملف أصبح عام الآن ويمكن تحميله'
    })

  } catch (error: any) {
    console.error('❌ [fix-attachment] Error:', error)
    return NextResponse.json(
      { 
        error: 'فشل في تحديث الملف',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

