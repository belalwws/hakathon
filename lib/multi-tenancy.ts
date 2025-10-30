/**
 * Multi-Tenancy Utilities
 * 
 * This file contains utilities for managing multi-tenancy in the application.
 * Includes organization context, usage tracking, and limit enforcement.
 */

import { prisma } from './prisma'
import { Plan } from '@prisma/client'
import { startOfMonth } from 'date-fns'

// ========================================
// PLAN LIMITS CONFIGURATION
// ========================================

export const PLAN_LIMITS = {
  free: {
    hackathons: 1,
    users: 10,
    participants: 50,
    emails: 100,
    storage: 1073741824, // 1GB
    apiCalls: 1000
  },
  starter: {
    hackathons: 3,
    users: 50,
    participants: 200,
    emails: 1000,
    storage: 10737418240, // 10GB
    apiCalls: 10000
  },
  professional: {
    hackathons: 10,
    users: 999999,
    participants: 999999,
    emails: 5000,
    storage: 53687091200, // 50GB
    apiCalls: 50000
  },
  enterprise: {
    hackathons: 999999,
    users: 999999,
    participants: 999999,
    emails: 999999,
    storage: 999999999999, // Unlimited
    apiCalls: 999999999
  }
} as const

// ========================================
// USAGE TRACKING
// ========================================

/**
 * Track usage for an organization
 * @param organizationId - The organization ID
 * @param type - The type of usage to track
 * @param amount - The amount to increment (default: 1)
 */
export async function trackUsage(
  organizationId: string,
  type: 'email' | 'storage' | 'api' | 'hackathon' | 'user' | 'participant',
  amount: number = 1
) {
  const period = startOfMonth(new Date())

  const fieldMap = {
    email: 'emailsSent',
    storage: 'storageUsed',
    api: 'apiCallsMade',
    hackathon: 'hackathonsUsed',
    user: 'usersUsed',
    participant: 'participantsUsed'
  }

  const field = fieldMap[type]

  await prisma.usageMetrics.upsert({
    where: {
      organizationId_period: {
        organizationId,
        period
      }
    },
    create: {
      organizationId,
      period,
      [field]: amount
    },
    update: {
      [field]: {
        increment: amount
      }
    }
  })
}

/**
 * Get current usage for an organization
 */
export async function getUsage(organizationId: string) {
  const period = startOfMonth(new Date())

  const usage = await prisma.usageMetrics.findUnique({
    where: {
      organizationId_period: {
        organizationId,
        period
      }
    }
  })

  return usage || {
    hackathonsUsed: 0,
    usersUsed: 0,
    participantsUsed: 0,
    emailsSent: 0,
    storageUsed: BigInt(0),
    apiCallsMade: 0
  }
}

// ========================================
// LIMIT CHECKING
// ========================================

type LimitType = keyof typeof PLAN_LIMITS.free

/**
 * Check if organization has reached its limit
 * @returns Object with allowed status, current usage, and limit
 */
export async function checkLimit(
  organizationId: string,
  type: LimitType
): Promise<{ allowed: boolean; current: number; limit: number; percentage: number }> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId }
  })

  if (!org) {
    throw new Error('Organization not found')
  }

  const limits = PLAN_LIMITS[org.plan]
  const limit = limits[type]

  let current = 0

  // Get current usage based on type
  if (type === 'hackathons') {
    current = await prisma.hackathon.count({
      where: { organizationId }
    })
  } else if (type === 'users') {
    current = await prisma.organizationUser.count({
      where: { organizationId }
    })
  } else if (type === 'participants') {
    current = await prisma.participant.count({
      where: { hackathon: { organizationId } }
    })
  } else {
    // For usage metrics (emails, storage, apiCalls)
    const usage = await getUsage(organizationId)
    const usageMap = {
      emails: usage.emailsSent,
      storage: Number(usage.storageUsed),
      apiCalls: usage.apiCallsMade
    }
    current = usageMap[type] || 0
  }

  const percentage = limit === 0 ? 0 : Math.round((current / limit) * 100)

  return {
    allowed: current < limit,
    current,
    limit,
    percentage
  }
}

/**
 * Enforce limit - throws error if limit reached
 */
export async function enforceLimit(
  organizationId: string,
  type: LimitType,
  customMessage?: string
) {
  const check = await checkLimit(organizationId, type)

  if (!check.allowed) {
    throw new LimitExceededError(
      customMessage || 
      `You've reached your ${type} limit (${check.current}/${check.limit}). Please upgrade your plan.`,
      type,
      check
    )
  }

  return check
}

// ========================================
// ORGANIZATION CONTEXT
// ========================================

/**
 * Get organization for a user (returns first active org if multiple)
 */
export async function getUserOrganization(userId: string) {
  const orgUser = await prisma.organizationUser.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: 'asc' }
  })

  return orgUser?.organization || null
}

/**
 * Check if user belongs to organization
 */
export async function userBelongsToOrg(userId: string, organizationId: string): Promise<boolean> {
  const count = await prisma.organizationUser.count({
    where: { userId, organizationId }
  })

  return count > 0
}

/**
 * Get user's role in organization
 */
export async function getUserOrgRole(userId: string, organizationId: string) {
  const orgUser = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId
      }
    }
  })

  return orgUser?.role || null
}

// ========================================
// CUSTOM ERRORS
// ========================================

export class LimitExceededError extends Error {
  constructor(
    message: string,
    public limitType: LimitType,
    public details: { current: number; limit: number; percentage: number }
  ) {
    super(message)
    this.name = 'LimitExceededError'
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number | bigint): string {
  const value = typeof bytes === 'bigint' ? Number(bytes) : bytes
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let size = value

  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }

  return `${size.toFixed(2)} ${units[i]}`
}

/**
 * Get plan display name
 */
export function getPlanName(plan: Plan): string {
  const names = {
    free: 'Free',
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise'
  }
  return names[plan]
}

/**
 * Calculate storage used for organization
 */
export async function calculateStorageUsed(organizationId: string): Promise<number> {
  // This would need to be implemented based on your file storage system
  // For now, return 0
  // TODO: Integrate with Cloudinary or file storage to get actual usage
  return 0
}
