import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { deleteFromCloudinary } from '@/lib/cloudinary'

// DELETE /api/admin/teams/[teamId]/delete-presentation - Delete team presentation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get team to check if it has a presentation
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        ideaFile: true
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'الفريق غير موجود' }, { status: 404 })
    }

    if (!team.ideaFile) {
      return NextResponse.json({ error: 'لا يوجد عرض تقديمي لهذا الفريق' }, { status: 400 })
    }

    console.log('🗑️ Deleting presentation for team:', team.name)

    // Try to delete from Cloudinary if it's a Cloudinary URL
    if (team.ideaFile.includes('cloudinary.com')) {
      try {
        // Extract public ID from Cloudinary URL
        const urlParts = team.ideaFile.split('/')
        const fileNameWithExt = urlParts[urlParts.length - 1]
        const fileName = fileNameWithExt.split('.')[0]
        const folder = urlParts[urlParts.length - 2]
        const publicId = `${folder}/${fileName}`
        
        console.log('☁️ Deleting from Cloudinary:', publicId)
        await deleteFromCloudinary(publicId)
        console.log('✅ Deleted from Cloudinary')
      } catch (cloudinaryError) {
        console.error('⚠️ Failed to delete from Cloudinary:', cloudinaryError)
        // Continue anyway - we'll still remove from database
      }
    }

    // Update team in database
    await prisma.team.update({
      where: { id: teamId },
      data: {
        ideaFile: null,
        ideaTitle: null,
        ideaDescription: null
      }
    })

    console.log('✅ Presentation deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'تم حذف العرض التقديمي بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting presentation:', error)
    return NextResponse.json(
      { error: 'فشل في حذف العرض التقديمي' },
      { status: 500 }
    )
  }
}

