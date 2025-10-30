import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get specific submission details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId, submissionId } = params

    console.log('📋 Loading submission:', submissionId, 'for hackathon:', hackathonId)

    // Get submission
    const submission = await prisma.participant.findFirst({
      where: {
        id: submissionId,
        hackathonId
      },
      include: {
        hackathon: {
          select: {
            title: true
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Transform data
    const transformedSubmission = {
      id: submission.id,
      submittedAt: submission.createdAt.toISOString(),
      status: submission.status || 'pending',
      userData: {
        name: submission.name,
        email: submission.email,
        phone: submission.phone,
        university: submission.university,
        major: submission.major,
        skills: submission.skills,
        portfolio: submission.portfolio,
        experience: submission.experience,
        motivation: submission.motivation,
        teamPreference: submission.teamPreference,
        dietaryRestrictions: submission.dietaryRestrictions,
        emergencyContact: submission.emergencyContact,
        ...submission.customFields ? JSON.parse(submission.customFields) : {}
      },
      reviewedBy: submission.reviewedBy,
      reviewedAt: submission.reviewedAt?.toISOString(),
      notes: submission.notes,
      hackathon: submission.hackathon
    }

    console.log('✅ Submission loaded successfully')

    return NextResponse.json({
      success: true,
      submission: transformedSubmission
    })

  } catch (error) {
    console.error('❌ Error loading submission:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل الطلب' },
      { status: 500 }
    )
  }
}

// PATCH - Update submission status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId, submissionId } = params
    const body = await request.json()
    const { status, notes, reviewedBy } = body

    console.log('🔄 Updating submission status:', submissionId, 'to:', status)

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
    }

    // Check if submission exists
    const existingSubmission = await prisma.participant.findFirst({
      where: {
        id: submissionId,
        hackathonId
      }
    })

    if (!existingSubmission) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Update submission
    const updatedSubmission = await prisma.participant.update({
      where: { id: submissionId },
      data: {
        status,
        notes,
        reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Submission status updated successfully')

    // Send email notification if approved/rejected
    if (status === 'approved' || status === 'rejected') {
      try {
        // Get hackathon details for email
        const hackathon = await prisma.hackathon.findUnique({
          where: { id: hackathonId },
          select: { title: true, startDate: true, endDate: true, location: true }
        })

        if (hackathon) {
          // Send notification email (you can implement this based on your email service)
          console.log(`📧 Should send ${status} email to:`, existingSubmission.email)
          
          // TODO: Implement email sending logic here
          // await sendStatusNotificationEmail({
          //   to: existingSubmission.email,
          //   name: existingSubmission.name,
          //   hackathon: hackathon,
          //   status: status,
          //   notes: notes
          // })
        }
      } catch (emailError) {
        console.error('❌ Error sending notification email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم ${status === 'approved' ? 'قبول' : status === 'rejected' ? 'رفض' : 'تحديث'} الطلب بنجاح`,
      submission: {
        id: updatedSubmission.id,
        status: updatedSubmission.status,
        reviewedBy: updatedSubmission.reviewedBy,
        reviewedAt: updatedSubmission.reviewedAt?.toISOString(),
        notes: updatedSubmission.notes
      }
    })

  } catch (error) {
    console.error('❌ Error updating submission status:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث حالة الطلب' },
      { status: 500 }
    )
  }
}

// DELETE - Delete submission
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId, submissionId } = params

    console.log('🗑️ Deleting submission:', submissionId)

    // Check if submission exists
    const existingSubmission = await prisma.participant.findFirst({
      where: {
        id: submissionId,
        hackathonId
      }
    })

    if (!existingSubmission) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Delete submission
    await prisma.participant.delete({
      where: { id: submissionId }
    })

    console.log('✅ Submission deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'تم حذف الطلب بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting submission:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الطلب' },
      { status: 500 }
    )
  }
}
