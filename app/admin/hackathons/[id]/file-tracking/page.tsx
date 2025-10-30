"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Users, CheckCircle, XCircle, AlertCircle, Trash2, Download, Eye, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'

interface Participant {
  id: string
  teamRole: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Team {
  id: string
  name: string
  teamNumber: number
  ideaTitle?: string
  ideaDescription?: string
  ideaFile?: string
  hasUploadedFile: boolean
  hasProjectInfo: boolean
  completionStatus: 'complete' | 'partial' | 'none'
  participantCount: number
  participants: Participant[]
  createdAt: string
  updatedAt: string
  lastActivity: string
}

interface Statistics {
  totalTeams: number
  teamsWithFiles: number
  teamsWithProjectInfo: number
  completeTeams: number
  partialTeams: number
  noDataTeams: number
  fileUploadPercentage: number
  completionPercentage: number
}

interface FileTrackingData {
  hackathonId: string
  hackathonTitle: string
  teams: Team[]
  statistics: Statistics
}

export default function FileTrackingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const hackathonId = params.id as string

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<FileTrackingData | null>(null)
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/dashboard')
      return
    }
    if (user && hackathonId) {
      fetchFileTrackingData()
    }
  }, [user, authLoading, hackathonId])

  const fetchFileTrackingData = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/file-tracking`)
      if (response.ok) {
        const trackingData = await response.json()
        setData(trackingData)
      } else {
        console.error('Failed to fetch file tracking data')
      }
    } catch (error) {
      console.error('Error fetching file tracking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamSelection = (teamId: string, checked: boolean) => {
    if (checked) {
      setSelectedTeams(prev => [...prev, teamId])
    } else {
      setSelectedTeams(prev => prev.filter(id => id !== teamId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredTeams = getFilteredTeams()
      setSelectedTeams(filteredTeams.map(team => team.id))
    } else {
      setSelectedTeams([])
    }
  }

  const handleDeleteFiles = async (deleteType: 'files' | 'project_info' | 'all') => {
    if (selectedTeams.length === 0) {
      alert('يرجى اختيار فريق واحد على الأقل')
      return
    }

    const confirmMessage = `هل أنت متأكد من حذف ${
      deleteType === 'files' ? 'الملفات' : 
      deleteType === 'project_info' ? 'معلومات المشروع' : 
      'جميع البيانات'
    } للفرق المحددة؟`

    if (!confirm(confirmMessage)) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/file-tracking`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamIds: selectedTeams,
          deleteType
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`✅ ${result.message}`)
        setSelectedTeams([])
        await fetchFileTrackingData() // Refresh data
      } else {
        const error = await response.json()
        alert(`❌ خطأ في الحذف: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting files:', error)
      alert('❌ حدث خطأ في حذف الملفات')
    } finally {
      setDeleting(false)
    }
  }

  const getFilteredTeams = () => {
    if (!data) return []
    
    switch (filterStatus) {
      case 'complete':
        return data.teams.filter(team => team.completionStatus === 'complete')
      case 'partial':
        return data.teams.filter(team => team.completionStatus === 'partial')
      case 'none':
        return data.teams.filter(team => team.completionStatus === 'none')
      case 'with_files':
        return data.teams.filter(team => team.hasUploadedFile)
      case 'without_files':
        return data.teams.filter(team => !team.hasUploadedFile)
      default:
        return data.teams
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 ml-1" />مكتمل</Badge>
      case 'partial':
        return <Badge className="bg-yellow-500 text-white"><AlertCircle className="w-3 h-3 ml-1" />جزئي</Badge>
      case 'none':
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 ml-1" />لا يوجد</Badge>
      default:
        return null
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-medium">جاري تحميل بيانات تتبع الملفات...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#01645e] font-medium">لم يتم العثور على بيانات الهاكاثون</p>
        </div>
      </div>
    )
  }

  const filteredTeams = getFilteredTeams()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/admin/hackathons/${hackathonId}`}>
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للهاكاثون
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#01645e] mb-2">تتبع رفع الملفات</h1>
              <p className="text-[#8b7632]">{data.hackathonTitle}</p>
            </div>
            <Badge className="bg-[#3ab666] text-white">
              <FileText className="w-4 h-4 ml-1" />
              إدارة الملفات
            </Badge>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">إجمالي الفرق</p>
                  <p className="text-2xl font-bold text-[#01645e]">{data.statistics.totalTeams}</p>
                </div>
                <Users className="w-8 h-8 text-[#01645e]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">رفعت ملفات</p>
                  <p className="text-2xl font-bold text-green-600">{data.statistics.teamsWithFiles}</p>
                  <p className="text-xs text-green-500">{data.statistics.fileUploadPercentage}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">مكتملة البيانات</p>
                  <p className="text-2xl font-bold text-blue-600">{data.statistics.completeTeams}</p>
                  <p className="text-xs text-blue-500">{data.statistics.completionPercentage}%</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">بدون بيانات</p>
                  <p className="text-2xl font-bold text-red-600">{data.statistics.noDataTeams}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#01645e]" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="فلترة الفرق" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الفرق</SelectItem>
                      <SelectItem value="complete">مكتملة البيانات</SelectItem>
                      <SelectItem value="partial">بيانات جزئية</SelectItem>
                      <SelectItem value="none">بدون بيانات</SelectItem>
                      <SelectItem value="with_files">رفعت ملفات</SelectItem>
                      <SelectItem value="without_files">لم ترفع ملفات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedTeams.length === filteredTeams.length && filteredTeams.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    تحديد الكل ({selectedTeams.length})
                  </label>
                </div>

                {selectedTeams.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleDeleteFiles('files')}
                      disabled={deleting}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف الملفات
                    </Button>
                    <Button
                      onClick={() => handleDeleteFiles('project_info')}
                      disabled={deleting}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف معلومات المشروع
                    </Button>
                    <Button
                      onClick={() => handleDeleteFiles('all')}
                      disabled={deleting}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف الكل
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Teams Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-[#01645e]">قائمة الفرق ({filteredTeams.length})</CardTitle>
              <CardDescription>
                تتبع حالة رفع الملفات ومعلومات المشاريع لكل فريق
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3">
                        <Checkbox
                          checked={selectedTeams.length === filteredTeams.length && filteredTeams.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-right p-3 font-semibold text-[#01645e]">الفريق</th>
                      <th className="text-right p-3 font-semibold text-[#01645e]">المشروع</th>
                      <th className="text-right p-3 font-semibold text-[#01645e]">الملف</th>
                      <th className="text-right p-3 font-semibold text-[#01645e]">الحالة</th>
                      <th className="text-right p-3 font-semibold text-[#01645e]">الأعضاء</th>
                      <th className="text-right p-3 font-semibold text-[#01645e]">آخر نشاط</th>
                      <th className="text-right p-3 font-semibold text-[#01645e]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team) => (
                      <tr key={team.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <Checkbox
                            checked={selectedTeams.includes(team.id)}
                            onCheckedChange={(checked) => handleTeamSelection(team.id, checked)}
                          />
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-semibold text-[#01645e]">{team.name}</p>
                            <p className="text-sm text-[#8b7632]">فريق رقم {team.teamNumber}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          {team.ideaTitle ? (
                            <div>
                              <p className="font-medium text-[#01645e]">{team.ideaTitle}</p>
                              {team.ideaDescription && (
                                <p className="text-sm text-[#8b7632] truncate max-w-xs">
                                  {team.ideaDescription.substring(0, 50)}...
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">لا يوجد</span>
                          )}
                        </td>
                        <td className="p-3">
                          {team.ideaFile ? (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-green-500" />
                              <span className="text-green-600 text-sm">تم الرفع</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-red-600 text-sm">لم يتم الرفع</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {getStatusBadge(team.completionStatus)}
                        </td>
                        <td className="p-3">
                          <span className="text-[#01645e] font-medium">{team.participantCount}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-[#8b7632]">
                            {new Date(team.lastActivity).toLocaleDateString('ar-SA')}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {team.ideaFile && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const link = document.createElement('a')
                                  // Use the new files endpoint that handles both Cloudinary and local files
                                  link.href = `/api/files/${team.id}`
                                  link.target = '_blank'
                                  link.rel = 'noopener noreferrer'
                                  link.click()
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
