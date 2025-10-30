import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

// GET - Get registration form schedule
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const form = await prisma.hackathonForm.findUnique({
      where: { hackathonId: params.id },
      select: {
        id: true,
        title: true,
        hackathonId: true,
        openAt: true,
        closeAt: true,
        isActive: true
      }
    })

    if (!form) {
      return NextResponse.json(
        { error: "النموذج غير موجود" },
        { status: 404 }
      )
    }

    return NextResponse.json({ form })
  } catch (error) {
    console.error("Error fetching form schedule:", error)
    return NextResponse.json(
      { error: "حدث خطأ في جلب البيانات" },
      { status: 500 }
    )
  }
}

// PUT - Update registration form schedule
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { openAt, closeAt } = body

    // Validate that closeAt is after openAt if both are provided
    if (openAt && closeAt) {
      const openDate = new Date(openAt)
      const closeDate = new Date(closeAt)

      if (closeDate <= openDate) {
        return NextResponse.json(
          { error: "تاريخ الإغلاق يجب أن يكون بعد تاريخ الفتح" },
          { status: 400 }
        )
      }
    }

    // Update form schedule
    const updatedForm = await prisma.hackathonForm.update({
      where: { hackathonId: params.id },
      data: {
        openAt: openAt ? new Date(openAt) : null,
        closeAt: closeAt ? new Date(closeAt) : null
      },
      select: {
        id: true,
        title: true,
        hackathonId: true,
        openAt: true,
        closeAt: true,
        isActive: true
      }
    })

    return NextResponse.json({ 
      success: true,
      form: updatedForm,
      message: "تم حفظ الإعدادات بنجاح"
    })
  } catch (error) {
    console.error("Error updating form schedule:", error)
    return NextResponse.json(
      { error: "حدث خطأ في حفظ الإعدادات" },
      { status: 500 }
    )
  }
}
