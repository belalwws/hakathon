import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'judge') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { hackathonId, teamId, scores } = await request.json()

    if (!hackathonId || !teamId || !scores) {
      return NextResponse.json({ error: 'البيانات المطلوبة مفقودة' }, { status: 400 })
    }

    // Verify judge is assigned to this hackathon
    const judge = await prisma.judge.findFirst({
      where: {
        userId: payload.userId,
        hackathonId: hackathonId,
        isActive: true
      }
    })

    if (!judge) {
      return NextResponse.json({ error: 'غير مصرح لتقييم هذا الهاكاثون' }, { status: 403 })
    }

    // Verify hackathon evaluation is open
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { evaluationOpen: true }
    })

    if (!hackathon?.evaluationOpen) {
      return NextResponse.json({ error: 'التقييم مغلق حالياً' }, { status: 403 })
    }

    // Get evaluation criteria to validate scores
    const criteria = await prisma.evaluationCriterion.findMany({
      where: { hackathonId }
    })

    // Validate scores
    for (const criterion of criteria) {
      const score = scores[criterion.id]
      if (!score || score < 1 || score > 5) {
        return NextResponse.json({ 
          error: `درجة غير صحيحة للمعيار: ${criterion.name}` 
        }, { status: 400 })
      }
    }

    // Delete existing scores for this judge-team combination
    await prisma.score.deleteMany({
      where: {
        judgeId: judge.id,
        teamId: teamId,
        hackathonId: hackathonId
      }
    })

    // Create new scores
    // Convert star rating (1-5) to actual score based on criterion's maxScore
    const scoreRecords = criteria.map(criterion => {
      const starRating = scores[criterion.id] // 1-5 stars
      const actualScore = Math.round((starRating / 5) * criterion.maxScore) // Convert to actual points

      return {
        judgeId: judge.id,
        teamId: teamId,
        hackathonId: hackathonId,
        criterionId: criterion.id,
        score: actualScore, // Store the actual score (e.g., 10 for 5 stars on a 10-point criterion)
        maxScore: criterion.maxScore // Store the criterion's max score
      }
    })

    await prisma.score.createMany({
      data: scoreRecords
    })

    return NextResponse.json({
      message: 'تم حفظ التقييم بنجاح',
      scoresCount: scoreRecords.length
    })

  } catch (error) {
    console.error('Error saving evaluation:', error)
    return NextResponse.json({ error: 'خطأ في حفظ التقييم' }, { status: 500 })
  }
}
