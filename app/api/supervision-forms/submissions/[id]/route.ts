import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - جلب طلب معين
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submission = await prisma.supervisionFormSubmission.findUnique({
      where: { id: params.id },
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    )
  }
}

// PUT - تحديث حالة الطلب
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, reviewNotes, rejectionReason, reviewedBy } = body

    const submission = await prisma.supervisionFormSubmission.update({
      where: { id: params.id },
      data: {
        status,
        reviewNotes,
        rejectionReason,
        reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}

// DELETE - حذف طلب
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.supervisionFormSubmission.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting submission:', error)
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    )
  }
}
