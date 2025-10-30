/**
 * Get Current Organization API
 * Returns the current organization for the logged-in user
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getUserOrganization } from '@/lib/multi-tenancy'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token
    const payload = await verifyToken(token)
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user's organization
    const organization = await getUserOrganization(payload.userId)

    if (!organization) {
      return NextResponse.json(
        { error: 'No organization found. Please create or join an organization.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        plan: organization.plan,
        primaryColor: organization.primaryColor,
        secondaryColor: organization.secondaryColor,
        accentColor: organization.accentColor
      }
    })
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
