import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

const prisma = new PrismaClient()

// POST /api/supervisor/certificates/upload - Upload certificate for judge or supervisor
export async function POST(request: NextRequest) {
  try {
    // Verify supervisor authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('certificate') as File
    const id = formData.get('id') as string
    const type = formData.get('type') as 'judge' | 'supervisor'

    if (!file || !id || !type) {
      return NextResponse.json({ error: 'بيانات غير كاملة' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      dataUrl,
      `certificates/${type}s`,
      `${id}-${Date.now()}`
    )

    // Update database
    if (type === 'judge') {
      await prisma.judge.update({
        where: { id },
        data: {
          certificateUrl: uploadResult.url,
          certificateSent: false,
          certificateSentAt: null
        }
      })
    } else {
      await prisma.supervisor.update({
        where: { id },
        data: {
          certificateUrl: uploadResult.url,
          certificateSent: false,
          certificateSentAt: null
        }
      })
    }

    return NextResponse.json({
      message: 'تم رفع الشهادة بنجاح',
      url: uploadResult.url
    })

  } catch (error) {
    console.error('Error uploading certificate:', error)
    return NextResponse.json(
      { error: 'فشل رفع الشهادة' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

