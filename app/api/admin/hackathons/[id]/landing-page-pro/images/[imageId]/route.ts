import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - جلب صورة محددة
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const resolvedParams = await params

    // جلب الصورة من قاعدة البيانات
    try {
      const images = await prisma.$queryRaw`
        SELECT * FROM landing_page_images 
        WHERE id = ${resolvedParams.imageId} AND "hackathonId" = ${resolvedParams.id}
        LIMIT 1
      ` as any[]

      if (images.length === 0) {
        return NextResponse.json({ error: 'الصورة غير موجودة' }, { status: 404 })
      }

      const image = images[0]
      const base64Data = image.base64Data
      const buffer = Buffer.from(base64Data, 'base64')

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': image.fileType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Access-Control-Allow-Origin': '*',
        },
      })

    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json({ error: 'خطأ في قاعدة البيانات' }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error fetching image:', error)
    return NextResponse.json({ error: 'خطأ في جلب الصورة' }, { status: 500 })
  }
}

// DELETE - حذف صورة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const resolvedParams = await params

    // حذف الصورة من قاعدة البيانات
    await prisma.$executeRaw`
      DELETE FROM landing_page_images 
      WHERE id = ${resolvedParams.imageId} AND "hackathonId" = ${resolvedParams.id}
    `

    return NextResponse.json({
      success: true,
      message: 'تم حذف الصورة بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting image:', error)
    return NextResponse.json({ error: 'خطأ في حذف الصورة' }, { status: 500 })
  }
}
