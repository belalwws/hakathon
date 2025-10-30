import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const params = await context.params
    const { filename } = params

    // Security: Only allow specific file patterns
    if (!filename || !filename.match(/^[a-zA-Z0-9\-_.]+\.(png|jpg|jpeg|webp)$/)) {
      return new NextResponse('Invalid filename', { status: 400 })
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'public', 'certificates', filename)
    
    console.log('🔍 Looking for certificate file:', filePath)

    // Check if file exists
    if (!existsSync(filePath)) {
      console.log('❌ Certificate file not found:', filePath)
      return new NextResponse('File not found', { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(filePath)
    
    // Determine content type
    const ext = path.extname(filename).toLowerCase()
    let contentType = 'image/png'
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.webp':
        contentType = 'image/webp'
        break
    }

    console.log('✅ Serving certificate file:', filename, 'Type:', contentType)

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('❌ Error serving certificate file:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
