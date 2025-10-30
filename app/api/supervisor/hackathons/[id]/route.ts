import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const hackathonId = params.id

    // المشرفون لديهم صلاحية كاملة افتراضياً (مثل الأدمن)
    // التحقق من التعطيل الصريح فقط إذا كان موجود
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId || '',
          hackathonId: hackathonId,
          isActive: true
        }
      })

      // فقط نمنع الوصول إذا كان معطل صراحة (isActive = false)
      if (supervisor && supervisor.isActive === false) {
        return NextResponse.json({ 
          error: "تم تعطيل صلاحيتك لهذا الهاكاثون من قبل الإدارة" 
        }, { status: 403 })
      }
      // إذا لم يكن موجود في جدول المشرفين، نسمح بالوصول (صلاحيات كاملة افتراضية)
    }

    // جلب بيانات الهاكاثون
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                city: true
              }
            }
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: "الهاكاثون غير موجود" }, { status: 404 })
    }

    // حساب الإحصائيات
    const stats = {
      totalParticipants: hackathon.participants.length,
      pendingParticipants: hackathon.participants.filter((p: any) => p.status === 'pending').length,
      approvedParticipants: hackathon.participants.filter((p: any) => p.status === 'approved').length,
      rejectedParticipants: hackathon.participants.filter((p: any) => p.status === 'rejected').length
    }

    return NextResponse.json({
      hackathon: {
        ...hackathon,
        stats
      }
    })
  } catch (error) {
    console.error('Error fetching hackathon:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب بيانات الهاكاثون' },
      { status: 500 }
    )
  }
}
