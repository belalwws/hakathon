import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Development mode bypass (for testing)
    const isDevelopment = request.headers.get('x-development-mode') === 'true'
    
    // Fetch all users with their organization details through OrganizationUser
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        city: true,
        nationality: true,
        skills: true,
        experience: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        isActive: true,
        // Get organizations through the many-to-many relationship
        organizations: {
          select: {
            role: true,
            isOwner: true,
            joinedAt: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                plan: true,
                status: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data to flatten organization info (take first org if user has multiple)
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      city: user.city,
      nationality: user.nationality,
      skills: user.skills,
      experience: user.experience,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      // Flatten organization data (get first organization)
      organizationRole: user.organizations[0]?.role || null,
      isOwner: user.organizations[0]?.isOwner || false,
      organization: user.organizations[0]?.organization || null
    }))

    console.log('� Master Users API - Total users found:', transformedUsers.length)

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      total: transformedUsers.length
    })

  } catch (error) {
    console.error('❌ Error fetching users:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        users: []
      },
      { status: 500 }
    )
  }
}
