import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify admin/supervisor authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 403 })
    }

    // Find all teams with ideaFile containing /image/upload/
    const teams = await prisma.team.findMany({
      where: {
        ideaFile: {
          contains: '/image/upload/'
        }
      }
    })

    console.log(`Found ${teams.length} teams with old URLs`)

    let updatedCount = 0
    const errors: string[] = []

    for (const team of teams) {
      try {
        if (team.ideaFile) {
          // Convert /image/upload/ to /raw/upload/
          const newUrl = team.ideaFile.replace('/image/upload/', '/raw/upload/')
          
          await prisma.team.update({
            where: { id: team.id },
            data: { ideaFile: newUrl }
          })

          updatedCount++
          console.log(`✅ Updated team ${team.name}: ${team.ideaFile} → ${newUrl}`)
        }
      } catch (error: any) {
        console.error(`❌ Error updating team ${team.id}:`, error)
        errors.push(`Team ${team.name}: ${error.message}`)
      }
    }

    return NextResponse.json({
      message: 'تم تحديث روابط العروض التقديمية',
      totalFound: teams.length,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('Error fixing URLs:', error)
    return NextResponse.json(
      { error: error.message || 'خطأ في تحديث الروابط' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
