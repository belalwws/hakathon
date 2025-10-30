import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { deleteFromCloudinary } from '@/lib/cloudinary'

const prisma = new PrismaClient()

// DELETE /api/admin/certificates/delete - Delete certificate
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type } = body

    if (!id || !type || !['judge', 'supervisor'].includes(type)) {
      return NextResponse.json({ error: "بيانات غير كاملة" }, { status: 400 })
    }

    let record: any

    // Get record
    if (type === 'judge') {
      record = await prisma.judge.findUnique({
        where: { id },
        select: { certificateUrl: true }
      })
    } else {
      record = await prisma.supervisor.findUnique({
        where: { id },
        select: { certificateUrl: true }
      })
    }

    if (!record || !record.certificateUrl) {
      return NextResponse.json({ error: "الشهادة غير موجودة" }, { status: 404 })
    }

    // Delete from Cloudinary
    try {
      const publicIdMatch = record.certificateUrl.match(/\/certificates\/[^\/]+\/([^\/]+)\.[^.]+$/)
      if (publicIdMatch) {
        const folder = type === 'judge' ? 'judges' : 'supervisors'
        const publicId = `certificates/${folder}/${publicIdMatch[1]}`
        await deleteFromCloudinary(publicId, 'image')
      }
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error)
    }

    // Update database
    const updateData = {
      certificateUrl: null,
      certificateSent: false,
      certificateSentAt: null
    }

    if (type === 'judge') {
      await prisma.judge.update({
        where: { id },
        data: updateData
      })
    } else {
      await prisma.supervisor.update({
        where: { id },
        data: updateData
      })
    }

    return NextResponse.json({
      message: "تم حذف الشهادة بنجاح"
    })
  } catch (error) {
    console.error("Error deleting certificate:", error)
    return NextResponse.json({ error: "حدث خطأ في حذف الشهادة" }, { status: 500 })
  }
}
