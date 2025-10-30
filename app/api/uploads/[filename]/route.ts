import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Check if user has access to this file
    // Extract team ID from filename (format: team-{teamId}-{timestamp}.ext)
    const teamIdMatch = filename.match(/^team-([^-]+)-\d+\.(pdf|ppt|pptx)$/)
    if (!teamIdMatch) {
      return NextResponse.json({ error: 'اسم الملف غير صحيح' }, { status: 400 })
    }

    const teamId = teamIdMatch[1]

    // Check if user is admin, judge, or team member
    let hasAccess = false

    if (payload.role === 'admin') {
      hasAccess = true
    } else if (payload.role === 'judge') {
      // Check if judge is assigned to the hackathon containing this team
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          hackathon: {
            include: {
              judges: {
                where: { userId: payload.userId }
              }
            }
          }
        }
      })
      
      hasAccess = team && team.hackathon.judges.length > 0
    } else {
      // Check if user is a member of this team
      const participant = await prisma.participant.findFirst({
        where: {
          userId: payload.userId,
          teamId: teamId,
          status: 'approved'
        }
      })
      
      hasAccess = !!participant
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لعرض هذا الملف' }, { status: 403 })
    }

    // Check if this is a Cloudinary URL stored in database
    if (filename.startsWith('http')) {
      // This is a full URL (Cloudinary), redirect to it
      return NextResponse.redirect(filename)
    }

    // Try to find the file in database first (for Cloudinary URLs)
    try {
      const team = await prisma.team.findFirst({
        where: {
          ideaFile: {
            contains: filename
          }
        }
      })

      if (team && team.ideaFile && team.ideaFile.includes('cloudinary.com')) {
        // Redirect to Cloudinary URL
        return NextResponse.redirect(team.ideaFile)
      }
    } catch (dbError) {
      console.log('Database lookup failed, trying local file')
    }

    // Read and serve the local file (fallback)
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename)

    try {
      const fileBuffer = await readFile(filePath)

      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase()
      let contentType = 'application/octet-stream'

      switch (ext) {
        case '.pdf':
          contentType = 'application/pdf'
          break
        case '.ppt':
          contentType = 'application/vnd.ms-powerpoint'
          break
        case '.pptx':
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          break
      }

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${filename}"`,
          'Cache-Control': 'private, max-age=3600'
        }
      })
      
    } catch (fileError) {
      console.error('File not found:', filePath)
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })
    }

  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'خطأ في عرض الملف' }, { status: 500 })
  }
}
