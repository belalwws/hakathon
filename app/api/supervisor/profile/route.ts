import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (userRole !== "supervisor") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // Get user profile with supervisor data
    // Only select fields that exist in production database
    const user = await prisma.user.findUnique({
      where: { id: userId! },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        bio: true,
        profilePicture: true,
        skills: true,
        experience: true,
        github: true,
        linkedin: true,
        portfolio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        supervisorAssignments: {
          include: {
            hackathon: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ profile: user })

  } catch (error) {
    console.error("Error fetching supervisor profile:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب الملف الشخصي" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (userRole !== "supervisor") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const body = await request.json()
    const { 
      name, 
      phone, 
      city, 
      bio, 
      github, 
      linkedin, 
      portfolio,
      skills,
      experience,
      currentPassword,
      newPassword
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      name,
      phone: phone || null,
      city: city || null,
      bio: bio || null,
      github: github || null,
      linkedin: linkedin || null,
      portfolio: portfolio || null,
      skills: skills || null,
      experience: experience || null,
      updatedAt: new Date()
    }

    // Handle password change if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const user = await prisma.user.findUnique({
        where: { id: userId! },
        select: { password: true }
      })

      if (!user || !user.password) {
        return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 })
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" }, { status: 400 })
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12)
      updateData.password = hashedNewPassword
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId! },
      data: updateData,
      include: {
        supervisorAssignments: {
          include: {
            hackathon: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    })

    // Remove password from response
    const { password, ...userProfile } = updatedUser

    return NextResponse.json({
      message: "تم تحديث الملف الشخصي بنجاح",
      profile: userProfile
    })

  } catch (error) {
    console.error("Error updating supervisor profile:", error)
    return NextResponse.json({ error: "حدث خطأ في تحديث الملف الشخصي" }, { status: 500 })
  }
}

// Upload profile picture
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (userRole !== "supervisor") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("profilePicture") as File

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار ملف" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WebP)" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت" }, { status: 400 })
    }

    // Get current user to check for existing profile picture
    const currentUser = await prisma.user.findUnique({
      where: { id: userId! },
      select: { profilePicture: true }
    })

    // Delete old image from Cloudinary if exists
    if (currentUser?.profilePicture && currentUser.profilePicture.includes('cloudinary')) {
      try {
        const publicIdMatch = currentUser.profilePicture.match(/\/supervisors\/([^/]+)\.[^.]+$/)
        if (publicIdMatch) {
          const publicId = `supervisors/${publicIdMatch[1]}`
          await deleteFromCloudinary(publicId, 'image')
        }
      } catch (error) {
        console.error("Error deleting old profile picture:", error)
        // Continue with upload even if deletion fails
      }
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      dataUrl,
      'supervisors', // folder name
      `${userId}-${Date.now()}` // unique filename
    )

    // Update user profile picture with Cloudinary URL
    const updatedUser = await prisma.user.update({
      where: { id: userId! },
      data: {
        profilePicture: uploadResult.url,
        updatedAt: new Date()
      },
      select: {
        id: true,
        profilePicture: true
      }
    })

    return NextResponse.json({
      message: "تم تحديث الصورة الشخصية بنجاح",
      profilePicture: updatedUser.profilePicture
    })

  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return NextResponse.json({ error: "حدث خطأ في رفع الصورة" }, { status: 500 })
  }
}
