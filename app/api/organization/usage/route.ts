/**
 * Usage API - Get current usage metrics for organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getUserOrganization, getUsage, checkLimit, PLAN_LIMITS } from '@/lib/multi-tenancy'

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
        { error: 'No organization found' },
        { status: 404 }
      )
    }

    // Get current usage
    const usage = await getUsage(organization.id)

    // Get limits for each resource
    const [
      hackathonsLimit,
      usersLimit,
      participantsLimit,
      emailsLimit,
      storageLimit,
      apiCallsLimit
    ] = await Promise.all([
      checkLimit(organization.id, 'hackathons'),
      checkLimit(organization.id, 'users'),
      checkLimit(organization.id, 'participants'),
      checkLimit(organization.id, 'emails'),
      checkLimit(organization.id, 'storage'),
      checkLimit(organization.id, 'apiCalls')
    ])

    return NextResponse.json({
      usage: {
        hackathons: {
          used: hackathonsLimit.current,
          limit: hackathonsLimit.limit,
          percentage: hackathonsLimit.percentage
        },
        users: {
          used: usersLimit.current,
          limit: usersLimit.limit,
          percentage: usersLimit.percentage
        },
        participants: {
          used: participantsLimit.current,
          limit: participantsLimit.limit,
          percentage: participantsLimit.percentage
        },
        emails: {
          used: emailsLimit.current,
          limit: emailsLimit.limit,
          percentage: emailsLimit.percentage
        },
        storage: {
          used: storageLimit.current,
          limit: storageLimit.limit,
          percentage: storageLimit.percentage
        },
        apiCalls: {
          used: apiCallsLimit.current,
          limit: apiCallsLimit.limit,
          percentage: apiCallsLimit.percentage
        }
      },
      plan: organization.plan,
      planLimits: PLAN_LIMITS[organization.plan]
    })
  } catch (error) {
    console.error('Error fetching usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
