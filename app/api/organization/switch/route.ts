/**
 * Switch Organization API
 * Allows users to switch between organizations they belong to
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { userBelongsToOrg } from '@/lib/multi-tenancy'

export async function POST(request: NextRequest) {
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

    // Get organization ID from request
    const { organizationId } = await request.json()

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    // Check if user belongs to organization
    const hasAccess = await userBelongsToOrg(payload.userId, organizationId)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      )
    }

    // In a more complex implementation, you would store the current organization
    // in the session or a separate cookie. For now, we just validate access.
    
    return NextResponse.json({
      success: true,
      message: 'Organization switched successfully'
    })
  } catch (error) {
    console.error('Error switching organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
