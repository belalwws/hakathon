/**
 * Participants Storage Utilities
 * Handles temporary storage and management of participant data
 */

// Lazy-load Prisma to avoid top-level initialization errors when the DB is sleeping
// (Neon free tier may auto-pause). Each function will import prisma dynamically
// and handle initialization errors gracefully.

async function getPrisma() {
  try {
    const mod = await import('@/lib/prisma')
    return mod.prisma
  } catch (error) {
    console.error('Prisma import error in participants-storage:', error)
    return null as any
  }
}

export interface ParticipantData {
  id?: string
  name: string
  email: string
  phone?: string
  university?: string
  major?: string
  skills?: string
  experience?: string
  preferredRole?: string
  motivation?: string
  hackathonId: string
  status?: 'pending' | 'approved' | 'rejected'
  registeredAt?: Date
  additionalInfo?: any
}

export interface StorageStats {
  total: number
  pending: number
  approved: number
  rejected: number
  lastUpdated: Date
}

/**
 * Get all participants (for backward compatibility)
 */
export async function getAllParticipants(): Promise<ParticipantData[]> {
  try {
    const prisma = await getPrisma()
    if (!prisma) return []

    // Single retry to wake the DB if it's paused
    try {
      const participants = await prisma.participant.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              university: true,
              major: true,
              skills: true,
              experience: true,
              preferredRole: true
            }
          }
        },
        orderBy: { registeredAt: 'desc' }
      })

      return participants.map((participant: any) => ({
        id: participant.id,
        name: participant.user?.name || '',
        email: participant.user?.email || '',
        phone: participant.user?.phone || '',
        university: participant.user?.university || '',
        major: participant.user?.major || '',
        skills: participant.user?.skills || '',
        experience: participant.user?.experience || '',
        preferredRole: participant.user?.preferredRole || '',
        motivation: participant.motivation || '',
        hackathonId: participant.hackathonId,
        status: participant.status as 'pending' | 'approved' | 'rejected',
        registeredAt: participant.registeredAt,
        additionalInfo: participant.additionalInfo
      }))
    } catch (err) {
      console.warn('Participants query failed, retrying once to wake DB:', err)
      // wait a moment and retry once
      await new Promise(r => setTimeout(r, 1200))
      try {
        const participants = await prisma.participant.findMany({
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { registeredAt: 'desc' }
        })
        return participants.map((p: any) => ({
          id: p.id,
          name: p.user?.name || '',
          email: p.user?.email || '',
          phone: '',
          university: '',
          major: '',
          skills: '',
          experience: '',
          preferredRole: '',
          motivation: '',
          hackathonId: p.hackathonId,
          status: p.status as 'pending' | 'approved' | 'rejected',
          registeredAt: p.registeredAt,
          additionalInfo: p.additionalInfo
        }))
      } catch (err2) {
        console.error('Retry failed for participants query:', err2)
        return []
      }
    }
  } catch (error) {
    console.error('Error in getAllParticipants:', error)
    return []
  }
}

/**
 * Get all participants for a hackathon
 */
export async function getParticipants(hackathonId: string): Promise<ParticipantData[]> {
  try {
    const prisma = await getPrisma()
    if (!prisma) return []

    try {
      const participants = await prisma.participant.findMany({
        where: { hackathonId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              university: true,
              major: true,
              skills: true,
              experience: true,
              preferredRole: true
            }
          }
        },
        orderBy: { registeredAt: 'desc' }
      })

      return participants.map((participant: any) => ({
        id: participant.id,
        name: participant.user?.name || '',
        email: participant.user?.email || '',
        phone: participant.user?.phone || '',
        university: participant.user?.university || '',
        major: participant.user?.major || '',
        skills: participant.user?.skills || '',
        experience: participant.user?.experience || '',
        preferredRole: participant.user?.preferredRole || '',
        motivation: participant.motivation || '',
        hackathonId: participant.hackathonId,
        status: participant.status as 'pending' | 'approved' | 'rejected',
        registeredAt: participant.registeredAt,
        additionalInfo: participant.additionalInfo
      }))
    } catch (err) {
      console.warn('Participants query failed for hackathon, retrying once to wake DB:', err)
      await new Promise(r => setTimeout(r, 1200))
      try {
        const participants = await prisma.participant.findMany({ where: { hackathonId }, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { registeredAt: 'desc' } })
        return participants.map((p: any) => ({
          id: p.id,
          name: p.user?.name || '',
          email: p.user?.email || '',
          phone: '',
          university: '',
          major: '',
          skills: '',
          experience: '',
          preferredRole: '',
          motivation: '',
          hackathonId: p.hackathonId,
          status: p.status as 'pending' | 'approved' | 'rejected',
          registeredAt: p.registeredAt,
          additionalInfo: p.additionalInfo
        }))
      } catch (err2) {
        console.error('Retry failed for participants query (hackathon):', err2)
        return []
      }
    }
  } catch (error) {
    console.error('Error in getParticipants:', error)
    return []
  }
}

/**
 * Get participant statistics
 */
export async function getParticipantStats(hackathonId?: string): Promise<StorageStats> {
  try {
    const prisma = await getPrisma()
    if (!prisma) return { total: 0, pending: 0, approved: 0, rejected: 0, lastUpdated: new Date() }

    const where = hackathonId ? { hackathonId } : {}

    try {
      const [total, pending, approved, rejected] = await Promise.all([
        prisma.participant.count({ where }),
        prisma.participant.count({ where: { ...where, status: 'pending' } }),
        prisma.participant.count({ where: { ...where, status: 'approved' } }),
        prisma.participant.count({ where: { ...where, status: 'rejected' } })
      ])

      return {
        total,
        pending,
        approved,
        rejected,
        lastUpdated: new Date()
      }
    } catch (err) {
      console.warn('Participant stats query failed, returning zeros and retrying once:', err)
      await new Promise(r => setTimeout(r, 900))
      try {
        const [total, pending, approved, rejected] = await Promise.all([
          prisma.participant.count({ where }),
          prisma.participant.count({ where: { ...where, status: 'pending' } }),
          prisma.participant.count({ where: { ...where, status: 'approved' } }),
          prisma.participant.count({ where: { ...where, status: 'rejected' } })
        ])
        return { total, pending, approved, rejected, lastUpdated: new Date() }
      } catch (err2) {
        console.error('Retry failed for participant stats:', err2)
        return { total: 0, pending: 0, approved: 0, rejected: 0, lastUpdated: new Date() }
      }
    }
  } catch (error) {
    console.error('Error fetching participant stats:', error)
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      lastUpdated: new Date()
    }
  }
}

/**
 * Save participant data (for backward compatibility)
 */
export async function saveParticipant(data: ParticipantData): Promise<boolean> {
  try {
    // This is handled by the regular participant creation process
    // This function exists for compatibility with existing code
    console.log('Participant data saved:', data.email)
    return true
  } catch (error) {
    console.error('Error saving participant data:', error)
    return false
  }
}

/**
 * Store participant data temporarily
 */
export async function storeParticipantData(data: ParticipantData): Promise<boolean> {
  try {
    // This is handled by the regular participant creation process
    // This function exists for compatibility with existing code
    console.log('Participant data stored:', data.email)
    return true
  } catch (error) {
    console.error('Error storing participant data:', error)
    return false
  }
}

/**
 * Update participant status (for backward compatibility)
 */
export async function updateParticipantStatus(participantId: string, status: 'pending' | 'approved' | 'rejected'): Promise<boolean> {
  try {
    const prisma = await getPrisma()
    if (!prisma) return false
    
    await prisma.participant.update({
      where: { id: participantId },
      data: { status }
    })
    return true
  } catch (error) {
    console.error('Error updating participant status:', error)
    return false
  }
}

/**
 * Clear temporary participant data
 */
export async function clearParticipantData(hackathonId?: string): Promise<boolean> {
  try {
    // This function exists for compatibility
    // In production, we don't clear participant data
    console.log('Clear participant data called for hackathon:', hackathonId)
    return true
  } catch (error) {
    console.error('Error clearing participant data:', error)
    return false
  }
}

/**
 * Export participants to various formats
 */
export async function exportParticipants(hackathonId: string, format: 'json' | 'csv' = 'json') {
  try {
    const participants = await getParticipants(hackathonId)
    
    if (format === 'csv') {
      // Convert to CSV format
      const headers = ['Name', 'Email', 'Phone', 'University', 'Major', 'Skills', 'Experience', 'Preferred Role', 'Status', 'Registered At']
      const csvData = participants.map(p => [
        p.name,
        p.email,
        p.phone,
        p.university,
        p.major,
        p.skills,
        p.experience,
        p.preferredRole,
        p.status,
        p.registeredAt?.toISOString()
      ])
      
      return {
        headers,
        data: csvData,
        filename: `participants_${hackathonId}_${new Date().toISOString().split('T')[0]}.csv`
      }
    }
    
    return {
      data: participants,
      filename: `participants_${hackathonId}_${new Date().toISOString().split('T')[0]}.json`
    }
  } catch (error) {
    console.error('Error exporting participants:', error)
    throw error
  }
}

/**
 * Validate participant data
 */
export function validateParticipantData(data: Partial<ParticipantData>): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters')
  }
  
  if (!data.email || !data.email.includes('@')) {
    errors.push('Valid email is required')
  }
  
  if (!data.hackathonId) {
    errors.push('Hackathon ID is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
