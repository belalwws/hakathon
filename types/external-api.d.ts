// Type definitions for External API

export interface ExternalRegistrationRequest {
  name: string
  email: string
  phone: string
  university?: string
  major?: string
  graduationYear?: string | number
  preferredRole?: string
  experience?: string
  skills?: string[]
  portfolioUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  motivation?: string
  source?: string
}

export interface ExternalRegistrationResponse {
  success: boolean
  message: string
  data?: {
    participantId: string
    hackathonTitle: string
    registrationDate: Date
    hackathonStartDate: Date
    hackathonEndDate: Date
  }
  error?: string
}

export interface ExternalHackathonInfo {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants?: number
  currentParticipants: number
  status: 'draft' | 'open' | 'closed' | 'completed'
  isAcceptingRegistrations: boolean
  spotsAvailable?: number
  requirements?: any[]
  categories?: any[]
  prizes?: any
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXTERNAL_API_KEY?: string
      GMAIL_USER?: string
      GMAIL_PASS?: string
      MAIL_FROM?: string
    }
  }
}
