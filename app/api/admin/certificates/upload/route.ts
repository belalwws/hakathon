import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { uploadToCloudinary } from '@/lib/cloudinary'

const prisma = new PrismaClient()

// POST /api/admin/certificates/upload - Upload certificate
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('certificate') as File
    const id = formData.get('id') as string
    const type = formData.get('type') as 'judge' | 'supervisor'

    if (!file || !id || !type) {
      return NextResponse.json({ error: "بيانات غير كاملة" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: "نوع الملف غير مدعوم" }, { status: 400 })
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
      message: "تم رفع الشهادة بنجاح",
      url: uploadResult.url
    })
  } catch (error) {
    console.error("Error uploading certificate:", error)
    return NextResponse.json({ error: "حدث خطأ في رفع الشهادة" }, { status: 500 })
  }
}
