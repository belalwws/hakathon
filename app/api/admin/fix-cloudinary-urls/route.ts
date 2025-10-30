import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/admin/fix-cloudinary-urls - إصلاح روابط Cloudinary للملفات PDF/PPT
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    
    if (userRole !== "admin") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    console.log('🔧 Starting Cloudinary URL fix...')

    // Find all teams with Cloudinary URLs that need fixing
    const teams = await prisma.team.findMany({
      where: {
        ideaFile: {
          contains: '/image/upload/'
        }
      },
      select: {
        id: true,
        name: true,
        ideaFile: true
      }
    })

    console.log(`📊 Found ${teams.length} teams with potential URL issues`)

    let fixedCount = 0
    const results: any[] = []

    for (const team of teams) {
      if (!team.ideaFile) continue

      // Check if it's a PDF/PPT file with wrong URL
      if ((team.ideaFile.endsWith('.pdf') || 
           team.ideaFile.endsWith('.ppt') || 
           team.ideaFile.endsWith('.pptx')) &&
          team.ideaFile.includes('/image/upload/')) {
        
        const oldUrl = team.ideaFile
        const newUrl = oldUrl.replace('/image/upload/', '/raw/upload/')

        try {
          await prisma.team.update({
            where: { id: team.id },
            data: { ideaFile: newUrl }
          })

          fixedCount++
          results.push({
            teamId: team.id,
            teamName: team.name,
            oldUrl,
            newUrl,
            status: 'fixed'
          })

          console.log(`✅ Fixed URL for team ${team.name}`)
        } catch (error) {
          console.error(`❌ Failed to fix URL for team ${team.name}:`, error)
          results.push({
            teamId: team.id,
            teamName: team.name,
            oldUrl,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    console.log(`🎉 Fixed ${fixedCount} URLs out of ${teams.length} teams`)

    return NextResponse.json({
      message: `تم إصلاح ${fixedCount} رابط من أصل ${teams.length} فريق`,
      fixedCount,
      totalTeams: teams.length,
      results
    })

  } catch (error) {
    console.error('❌ Error fixing Cloudinary URLs:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إصلاح الروابط' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

