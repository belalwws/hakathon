import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, reviewNotes, rejectionReason } = body

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'حالة غير صالحة' },
        { status: 400 }
      )
    }

    // Get the application
    const application = await prisma.adminApplication.findUnique({
      where: { id }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      )
    }

    // Update application status
    const updatedApplication = await prisma.adminApplication.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        reviewedAt: new Date()
      }
    })

    // If approved, create user account and admin record
    if (status === 'approved') {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: application.email }
        })

        let userId = existingUser?.id

        if (!existingUser) {
          // Generate a temporary password
          const tempPassword = Math.random().toString(36).slice(-8)
          const hashedPassword = await bcrypt.hash(tempPassword, 10)

          // Create user account
          const newUser = await prisma.user.create({
            data: {
              name: application.name,
              email: application.email,
              password: hashedPassword,
              phone: application.phone,
              bio: application.bio,
              linkedin: application.linkedin,
              portfolio: application.website,
              profilePicture: application.profileImage,
              role: 'admin',
              emailVerified: true
            }
          })

          userId = newUser.id

          // TODO: Send email with login credentials
          console.log(`New admin user created: ${application.email}, temp password: ${tempPassword}`)
        }

        // Create admin record for the hackathon
        await prisma.admin.create({
          data: {
            userId: userId!,
            hackathonId: application.hackathonId,
            role: 'supervisor',
            permissions: JSON.stringify({
              canViewParticipants: true,
              canManageTeams: true,
              canViewReports: true,
              canSendEmails: false,
              canManageJudges: false,
              canManageSettings: false
            }),
            isActive: true
          }
        })

      } catch (error) {
        console.error('Error creating admin account:', error)
        // Don't fail the approval, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: status === 'approved' ? 'تم قبول الطلب وإنشاء حساب المشرف' : 'تم رفض الطلب',
      application: updatedApplication
    })

  } catch (error) {
    console.error('Error reviewing admin application:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في مراجعة الطلب' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const application = await prisma.adminApplication.findUnique({
      where: { id }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)

  } catch (error) {
    console.error('Error fetching admin application:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الطلب' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const application = await prisma.adminApplication.findUnique({
      where: { id }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      )
    }

    await prisma.adminApplication.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف الطلب بنجاح'
    })

  } catch (error) {
    console.error('Error deleting admin application:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الطلب' },
      { status: 500 }
    )
  }
}
