/**
 * Multi-Tenancy Context Hook
 * 
 * Provides organization context to React components
 */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './use-auth'

interface Organization {
  id: string
  name: string
  slug: string
  logo: string | null
  plan: 'free' | 'starter' | 'professional' | 'enterprise'
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

interface OrganizationContextType {
  organization: Organization | null
  isLoading: boolean
  switchOrganization: (orgId: string) => Promise<void>
  refreshOrganization: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrganization = async () => {
    if (!user) {
      setOrganization(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/organization/current')
      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organization)
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const switchOrganization = async (orgId: string) => {
    try {
      const response = await fetch('/api/organization/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId })
      })

      if (response.ok) {
        await fetchOrganization()
      }
    } catch (error) {
      console.error('Failed to switch organization:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchOrganization()
  }, [user])

  const contextValue = {
    organization,
    isLoading,
    switchOrganization,
    refreshOrganization: fetchOrganization
  }

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within OrganizationProvider')
  }
  return context
}
