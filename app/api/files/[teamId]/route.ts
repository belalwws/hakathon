import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Find the team and its file
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        ideaFile: true,
        ideaTitle: true,
        participants: {
          select: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'الفريق غير موجود' }, { status: 404 })
    }

    if (!team.ideaFile) {
      return NextResponse.json({ error: 'لا يوجد ملف مرفوع لهذا الفريق' }, { status: 404 })
    }

    // Check access permissions
    const isAdmin = payload.role === 'admin'
    const isSupervisor = payload.role === 'supervisor'
    const isJudge = payload.role === 'judge'
    const isTeamMember = team.participants.some(p => p.user.id === payload.userId)

    if (!isAdmin && !isSupervisor && !isJudge && !isTeamMember) {
      return NextResponse.json({ error: 'غير مصرح بالوصول لهذا الملف' }, { status: 403 })
    }

    // If it's a Cloudinary URL, fix it if needed and redirect
    if (team.ideaFile.includes('cloudinary.com')) {
      let fileUrl = team.ideaFile

      // Fix Cloudinary URL for PDF/PPT files
      // Change /image/upload/ to /raw/upload/ for non-image files
      if (fileUrl.includes('/image/upload/') &&
          (fileUrl.endsWith('.pdf') || fileUrl.endsWith('.ppt') || fileUrl.endsWith('.pptx'))) {
        fileUrl = fileUrl.replace('/image/upload/', '/raw/upload/')
        console.log('🔧 Fixed Cloudinary URL:', fileUrl)
      }

      return NextResponse.redirect(fileUrl)
    }

    // If it's a local file, serve it through the uploads endpoint
    return NextResponse.redirect(`/api/uploads/${team.ideaFile}`)

  } catch (error) {
    console.error("Error accessing team file:", error)
    return NextResponse.json({ error: "حدث خطأ في الوصول للملف" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
