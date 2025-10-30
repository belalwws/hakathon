"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Users, 
  Trophy, 
  TrendingUp,
  Download,
  Calendar,
  MapPin,
  Code,
  Target,
  Activity
} from "lucide-react"

interface OverviewData {
  participants: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  teams: {
    total: number
    withProjects: number
    completionRate: number
  }
  registrationTrend: Array<{
    date: string
    count: number
  }>
}

interface ParticipantsData {
  byStatus: Array<{
    status: string
    count: number
  }>
  byCity: Array<{
    city: string
    count: number
  }>
  topSkills: Array<{
    skill: string
    count: number
  }>
}

interface TeamsData {
  projectStatus: {
    withNames: number
    withUrls: number
    withGithub: number
    total: number
  }
  sizeDistribution: Array<{
    size: string
    count: number
  }>
}

export default function SupervisorReports() {
  const [reportType, setReportType] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [participantsData, setParticipantsData] = useState<ParticipantsData | null>(null)
  const [teamsData, setTeamsData] = useState<TeamsData | null>(null)

  useEffect(() => {
    fetchReportData()
  }, [reportType])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/supervisor/reports?type=${reportType}`)
      const data = await response.json()

      if (response.ok) {
        switch (reportType) {
          case "overview":
            setOverviewData(data.overview)
            break
          case "participants":
            setParticipantsData(data.participantsReport)
            break
          case "teams":
            setTeamsData(data.teamsReport)
            break
        }
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "معتمد"
      case "pending":
        return "معلق"
      case "rejected":
        return "مرفوض"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
          <p className="text-gray-600">تحليل شامل لأداء الهاكاثون</p>
        </div>
        <div className="flex gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">نظرة عامة</SelectItem>
              <SelectItem value="participants">تقرير المشاركين</SelectItem>
              <SelectItem value="teams">تقرير الفرق</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Overview Report */}
      {reportType === "overview" && overviewData && (
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي المشاركين</p>
                    <p className="text-3xl font-bold text-blue-600">{overviewData.participants.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">المعتمدين</p>
                    <p className="text-3xl font-bold text-green-600">{overviewData.participants.approved}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الفرق</p>
                    <p className="text-3xl font-bold text-purple-600">{overviewData.teams.total}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">معدل الإنجاز</p>
                    <p className="text-3xl font-bold text-indigo-600">{overviewData.teams.completionRate}%</p>
                  </div>
                  <Activity className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Participants Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع المشاركين حسب الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{overviewData.participants.approved}</p>
                  <p className="text-sm text-green-700">معتمد</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{overviewData.participants.pending}</p>
                  <p className="text-sm text-yellow-700">معلق</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{overviewData.participants.rejected}</p>
                  <p className="text-sm text-red-700">مرفوض</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                اتجاه التسجيل (آخر 7 أيام)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overviewData.registrationTrend.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('ar-SA')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((day.count / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{day.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Participants Report */}
      {reportType === "participants" && participantsData && (
        <div className="space-y-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع المشاركين حسب الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participantsData.byStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Cities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                أكثر المدن مشاركة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participantsData.byCity.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.city}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                أكثر المهارات طلباً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participantsData.topSkills.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.skill}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Teams Report */}
      {reportType === "teams" && teamsData && (
        <div className="space-y-6">
          {/* Project Status */}
          <Card>
            <CardHeader>
              <CardTitle>حالة المشاريع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{teamsData.projectStatus.total}</p>
                  <p className="text-sm text-blue-700">إجمالي الفرق</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{teamsData.projectStatus.withNames}</p>
                  <p className="text-sm text-green-700">لديها أسماء مشاريع</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{teamsData.projectStatus.withUrls}</p>
                  <p className="text-sm text-purple-700">لديها روابط</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{teamsData.projectStatus.withGithub}</p>
                  <p className="text-sm text-orange-700">لديها GitHub</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Size Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع أحجام الفرق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamsData.sizeDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.size}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min((item.count / Math.max(...teamsData.sizeDistribution.map(s => s.count))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
