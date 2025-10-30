import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    console.log('🚀 Upload idea request received')

    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.log('❌ No auth token found')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      console.log('❌ Invalid token')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('✅ User authenticated:', payload.userId, payload.email)

    const { teamId } = await params
    console.log('🎯 Target team ID:', teamId)
    
    // Check if user is member of this team
    console.log(`🔍 Checking team membership for user ${payload.userId} in team ${teamId}`)

    const participant = await prisma.participant.findFirst({
      where: {
        userId: payload.userId,
        teamId: teamId,
        status: 'approved' as any
      },
      include: {
        user: true,
        team: true
      }
    })

    console.log('👤 Participant found:', participant ? 'Yes' : 'No')
    if (participant) {
      console.log('✅ User:', participant.user.name, participant.user.email)
      console.log('✅ Team:', participant.team?.name)
    }

    if (!participant) {
      // البحث عن أي عضوية للمستخدم
      const anyParticipant = await prisma.participant.findFirst({
        where: {
          userId: payload.userId,
          status: 'approved' as any
        },
        include: {
          user: true,
          team: true
        }
      })

      console.log('🔍 User has membership in any team:', anyParticipant ? 'Yes' : 'No')
      if (anyParticipant) {
        console.log('📍 User is member of team:', anyParticipant.team?.name, anyParticipant.teamId)
      }

      return NextResponse.json({
        error: 'غير مصرح لرفع ملفات لهذا الفريق',
        debug: {
          userId: payload.userId,
          teamId: teamId,
          userTeam: anyParticipant?.teamId || 'none'
        }
      }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file || !title) {
      return NextResponse.json({ error: 'الملف وعنوان الفكرة مطلوبان' }, { status: 400 })
    }

    // Validate file size (max 4MB)
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'حجم الملف كبير جداً. الحد الأقصى المسموح 4 ميجابايت'
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'نوع الملف غير مدعوم. يجب أن يكون PowerPoint أو PDF'
      }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `team-${teamId}-${timestamp}${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Update team in database
    await prisma.team.update({
      where: { id: teamId },
      data: {
        ideaFile: fileName,
        ideaTitle: title,
        ideaDescription: description || null
      }
    })

    return NextResponse.json({
      message: 'تم رفع العرض التقديمي بنجاح',
      fileName: fileName
    })

  } catch (error) {
    console.error('Error uploading idea file:', error)
    return NextResponse.json({ error: 'خطأ في رفع الملف' }, { status: 500 })
  }
}
