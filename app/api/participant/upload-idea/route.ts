import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { uploadRawToCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Participant upload idea request received')
    
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

    // البحث عن فريق المستخدم
    const participant = await prisma.participant.findFirst({
      where: {
        userId: payload.userId,
        status: 'approved' as any
      },
      include: {
        team: true,
        user: true
      }
    })

    if (!participant || !participant.team) {
      console.log('❌ User is not member of any team')
      return NextResponse.json({ error: 'لست عضواً في أي فريق' }, { status: 403 })
    }

    console.log('✅ User team found:', participant.team.name, participant.team.id)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file || !title) {
      return NextResponse.json({ error: 'الملف وعنوان الفكرة مطلوبان' }, { status: 400 })
    }

    console.log('📁 File details:', file.name, file.type, file.size)

    // Validate file size (max 10MB for Cloudinary)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'حجم الملف كبير جداً. الحد الأقصى المسموح 10 ميجابايت'
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

    // Upload to Cloudinary
    console.log('☁️ Uploading to Cloudinary...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const fileName = `team-${participant.team.id}-${timestamp}`

    const cloudinaryResult = await uploadRawToCloudinary(buffer, 'presentations', fileName)

    console.log('✅ File uploaded to Cloudinary:', cloudinaryResult.url)
    
    // Keep the URL as-is from Cloudinary - the client will fix it when needed
    const fileUrl = cloudinaryResult.url

    // Update team in database
    await prisma.team.update({
      where: { id: participant.team.id },
      data: {
        ideaFile: fileUrl,
        ideaTitle: title,
        ideaDescription: description || null
      }
    })

    return NextResponse.json({
      message: 'تم رفع العرض التقديمي بنجاح',
      fileUrl: cloudinaryResult.url,
      teamId: participant.team.id,
      teamName: participant.team.name
    })

  } catch (error) {
    console.error('💥 Error uploading idea file:', error)
    return NextResponse.json({ error: 'خطأ في رفع الملف' }, { status: 500 })
  }
}
