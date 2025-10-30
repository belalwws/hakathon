import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get form schedule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const form = await prisma.hackathonForm.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
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

// PUT - Update form schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      where: { id: params.id },
      data: {
        openAt: openAt ? new Date(openAt) : null,
        closeAt: closeAt ? new Date(closeAt) : null
      },
      select: {
        id: true,
        title: true,
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
