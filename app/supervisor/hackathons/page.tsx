"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Trophy,
  Calendar,
  Users,
  MapPin,
  Clock,
  AlertCircle,
  ExternalLink,
  UserCheck
} from "lucide-react"

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  status: string
  maxParticipants: number
  currentParticipants: number
  stats?: {
    totalParticipants: number
    approvedParticipants: number
    pendingParticipants: number
    totalTeams: number
  }
}

export default function SupervisorHackathons() {
  const { user } = useAuth()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [assignedHackathons, setAssignedHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchHackathons()
  }, [])

  const fetchHackathons = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch dashboard to get assigned hackathons with statistics
      const dashboardRes = await fetch("/api/supervisor/dashboard", { credentials: 'include' })
      
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json()
        console.log("Dashboard data:", dashboardData)
        
        if (dashboardData.supervisor?.hackathons && dashboardData.supervisor.hackathons.length > 0) {
          // Fetch detailed stats for each hackathon
          const hackathonsWithStats = await Promise.all(
            dashboardData.supervisor.hackathons.map(async (hackathon: any) => {
              try {
                const statsRes = await fetch(`/api/supervisor/hackathons/${hackathon.id}`, { credentials: 'include' })
                if (statsRes.ok) {
                  const statsData = await statsRes.json()
                  return {
                    ...hackathon,
                    currentParticipants: statsData.hackathon?.stats?.totalParticipants || 0,
                    maxParticipants: statsData.hackathon?.maxParticipants || 0,
                    location: statsData.hackathon?.location || 'غير محدد',
                    stats: statsData.hackathon?.stats
                  }
                }
                return {
                  ...hackathon,
                  currentParticipants: 0,
                  maxParticipants: 0,
                  location: 'غير محدد'
                }
              } catch (error) {
                console.error(`Error fetching stats for hackathon ${hackathon.id}:`, error)
                return {
                  ...hackathon,
                  currentParticipants: 0,
                  maxParticipants: 0,
                  location: 'غير محدد'
                }
              }
            })
          )
          setAssignedHackathons(hackathonsWithStats)
        } else {
          setAssignedHackathons([])
          console.log("No assigned hackathons")
        }
      } else {
        const errorData = await dashboardRes.json()
        console.error("Dashboard error:", errorData)
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'open': { label: 'مفتوح للتسجيل', color: 'bg-green-100 text-green-800' },
      'closed': { label: 'مغلق', color: 'bg-red-100 text-red-800' },
      'completed': { label: 'مكتمل', color: 'bg-gray-100 text-gray-800' },
      'draft': { label: 'مسودة', color: 'bg-yellow-100 text-yellow-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الهاكاثونات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الهاكاثونات</h1>
          <p className="text-gray-600 mt-2">
            استعرض وأدر الهاكاثونات المعينة لك
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Hackathons Grid */}
      {assignedHackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedHackathons.map((hackathon) => (
            <Card key={hackathon.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Trophy className="w-5 h-5 text-blue-600" />
                      {hackathon.title}
                    </CardTitle>
                    <div className="mt-2">
                      {getStatusBadge(hackathon.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-3">
                  {hackathon.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{hackathon.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{hackathon.currentParticipants} / {hackathon.maxParticipants} مشارك</span>
                  </div>
                </div>

                {/* Statistics */}
                {hackathon.stats && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 mb-1">إجمالي المتقدمين</p>
                      <p className="text-2xl font-bold text-blue-700">{hackathon.stats.totalParticipants}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">مقبول</p>
                      <p className="text-2xl font-bold text-green-700">{hackathon.stats.approvedParticipants}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs text-yellow-600 mb-1">في الانتظار</p>
                      <p className="text-2xl font-bold text-yellow-700">{hackathon.stats.pendingParticipants}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 mb-1">عدد الفرق</p>
                      <p className="text-2xl font-bold text-purple-700">{hackathon.stats.totalTeams}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => window.location.href = `/supervisor/hackathons/${hackathon.id}`}
                    >
                      إدارة الهاكاثون
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لم يتم تعيينك لأي هاكاثون بعد
            </h3>
            <p className="text-gray-600">
              تواصل مع الإدارة للحصول على تعيين لهاكاثون معين
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
