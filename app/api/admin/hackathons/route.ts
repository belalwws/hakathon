import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Lazy import prisma to avoid build-time errors
let prisma: any = null
async function getPrisma() {
  if (!prisma) {
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
    } catch (error) {
      console.error('Failed to import prisma:', error)
      return null
    }
  }
  return prisma
}

// GET /api/admin/hackathons - Get all hackathons
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    const prismaClient = await getPrisma()
    if (!prismaClient) return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })

    const hackathons = await prismaClient.hackathon.findMany({
      include: {
        participants: { select: { status: true } },
        _count: { select: { participants: true, teams: true, judges: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const transformed = hackathons.map((h: any) => ({
      id: h.id,
      title: h.title,
      description: h.description ?? '',
      startDate: h.startDate.toISOString(),
      endDate: h.endDate.toISOString(),
      registrationDeadline: h.registrationDeadline.toISOString(),
      maxParticipants: h.maxParticipants,
      status: h.status,
      prizes: h.prizes,
      requirements: h.requirements ?? [],
      categories: h.categories ?? [],
      createdBy: h.createdBy,
      createdAt: h.createdAt.toISOString(),
      stats: {
        total: h._count.participants,
        pending: h.participants.filter((p: any) => p.status === 'pending').length,
        approved: h.participants.filter((p: any) => p.status === 'approved').length,
        rejected: h.participants.filter((p: any) => p.status === 'rejected').length,
      },
    }))

    return NextResponse.json({ hackathons: transformed })
  } catch (error) {
    console.error('Error fetching hackathons:', error)
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}

// POST /api/admin/hackathons - Create new hackathon
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const body = await request.json()
    const {
      title,
      description,
      requirements,
      categories,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      status = 'draft',
      prizes,
      settings
    } = body
    
    // Get admin user ID from token
    const adminId = payload.userId

    if (!title || !startDate || !endDate || !registrationDeadline) {
      return NextResponse.json({ error: 'الحقول المطلوبة غير مكتملة' }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const regDeadline = new Date(registrationDeadline)

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(regDeadline.getTime())) {
      return NextResponse.json({ error: 'تواريخ غير صالحة' }, { status: 400 })
    }
    if (start >= end) {
      return NextResponse.json({ error: 'تاريخ البدء يجب أن يسبق تاريخ الانتهاء' }, { status: 400 })
    }
    if (regDeadline >= start) {
      return NextResponse.json({ error: 'موعد انتهاء التسجيل يجب أن يسبق تاريخ البدء' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['draft', 'open', 'closed', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'حالة الهاكاثون غير صحيحة' }, { status: 400 })
    }
    
    // Map validated status string to Prisma enum at runtime to avoid case/value mismatches
    let statusForDb: any = status
    try {
      const prismaModule = await import('@prisma/client')
      const EnumObj: any = (prismaModule as any).Prisma?.HackathonStatus
      if (EnumObj) {
        const key = typeof status === 'string' ? status : 'draft'
        if (EnumObj[key]) statusForDb = EnumObj[key]
        else if (EnumObj[key.toUpperCase()]) statusForDb = EnumObj[key.toUpperCase()]
        else if (EnumObj[key.toLowerCase()]) statusForDb = EnumObj[key.toLowerCase()]
        else if (EnumObj['draft']) statusForDb = EnumObj['draft']
        else statusForDb = 'draft'
      }
    } catch {}

    const prismaClient = await getPrisma()
    if (!prismaClient) return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })

    const hackathon = await prismaClient.hackathon.create({
      data: {
        title,
        description: description || '',
        requirements: requirements || [],
        categories: categories || [],
        startDate: start,
        endDate: end,
        registrationDeadline: regDeadline,
        maxParticipants: maxParticipants || null,
        status: status as any,
        prizes: prizes || {
          first: 'الجائزة الأولى',
          second: 'الجائزة الثانية',
          third: 'الجائزة الثالثة'
        },
        createdBy: adminId || 'admin',
        settings: settings || {
          maxTeamSize: 5,
          allowIndividualParticipation: true,
          autoTeaming: false,
          evaluationCriteria: [
            { name: 'الابتكار', weight: 0.2 },
            { name: 'الأثر التقني', weight: 0.25 },
            { name: 'قابلية التنفيذ', weight: 0.25 },
            { name: 'العرض التقديمي', weight: 0.2 },
            { name: 'العمل الجماعي', weight: 0.1 },
          ],
        },
      },
    })

    return NextResponse.json({
      message: 'تم إنشاء الهاكاثون بنجاح',
      hackathon: {
        id: hackathon.id,
        title: hackathon.title,
        description: hackathon.description,
        startDate: hackathon.startDate.toISOString(),
        endDate: hackathon.endDate.toISOString(),
        registrationDeadline: hackathon.registrationDeadline.toISOString(),
        maxParticipants: hackathon.maxParticipants,
        status: hackathon.status,
        prizes: hackathon.prizes,
        requirements: hackathon.requirements,
        categories: hackathon.categories,
        createdAt: hackathon.createdAt.toISOString(),
        stats: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        }
      }
    })
  } catch (error) {
    console.error('Error creating hackathon:', error)
    return NextResponse.json({ error: 'خطأ أثناء إنشاء الهاكاثون' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
