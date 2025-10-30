'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, CheckCircle2, XCircle, Eye, Users, Trash2, Send, Loader2, Mail, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { useModal } from '@/hooks/use-modal'

interface Team {
  id: string
  name: string
  teamNumber: number
  ideaTitle: string | null
  ideaDescription: string | null
  ideaFile: string | null
  hackathonId: string
  hackathon: {
    id: string
    title: string
  }
  participants: Array<{
    id: string
    user: {
      name: string
      email: string
    }
  }>
}

export default function SupervisorPresentationsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [hackathons, setHackathons] = useState<any[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [sendingLink, setSendingLink] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'uploaded' | 'pending'>('all')
  const [fixingUrls, setFixingUrls] = useState(false)
  const { showSuccess, showError, showConfirm } = useModal()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [selectedHackathon])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch hackathons assigned to supervisor
      const hackathonsRes = await fetch('/api/supervisor/hackathons', {
        credentials: 'include'
      })
      if (hackathonsRes.ok) {
        const data = await hackathonsRes.json()
        const hackathonsArray = data.hackathons || []
        setHackathons(hackathonsArray)
        
        // Set first hackathon as default if available
        if (hackathonsArray.length > 0 && !selectedHackathon) {
          setSelectedHackathon(hackathonsArray[0].id)
          return // Don't fetch teams yet, let the next useEffect handle it
        }
      }

      // Only fetch teams if hackathon is selected
      if (!selectedHackathon) {
        setLoading(false)
        return
      }

      // Fetch teams based on selected hackathon
      const teamsUrl = `/api/supervisor/teams?hackathonId=${selectedHackathon}`
      
      const teamsRes = await fetch(teamsUrl, {
        credentials: 'include'
      })
      if (teamsRes.ok) {
        const data = await teamsRes.json()
        setTeams(data.teams || [])
        console.log('📊 Loaded teams:', data.teams?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTeams = filterStatus === 'all' 
    ? teams 
    : filterStatus === 'uploaded' 
    ? teams.filter(t => t.ideaFile)
    : teams.filter(t => !t.ideaFile)

  const teamsWithPresentation = filteredTeams.filter(t => t.ideaFile)
  const teamsWithoutPresentation = filteredTeams.filter(t => !t.ideaFile)

  const handleDownload = (team: Team) => {
    if (team.ideaFile) {
      // Fix URL if it's using /image/upload/ instead of /raw/upload/
      let fileUrl = team.ideaFile
      if (fileUrl.includes('/image/upload/')) {
        fileUrl = fileUrl.replace('/image/upload/', '/raw/upload/')
        console.log('⚠️ Fixed URL for download:', fileUrl)
      }

      // Create a temporary link to download the file
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = `${team.name}_presentation.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "✅ جاري التحميل",
        description: `جاري تحميل عرض ${team.name}`
      })
    }
  }

  const handleView = (team: Team) => {
    if (team.ideaFile) {
      // Fix URL if it's using /image/upload/ instead of /raw/upload/
      let fileUrl = team.ideaFile
      if (fileUrl.includes('/image/upload/')) {
        fileUrl = fileUrl.replace('/image/upload/', '/raw/upload/')
        console.log('⚠️ Fixed URL for view:', fileUrl)
      }

      window.open(fileUrl, '_blank')
      toast({
        title: "✅ تم الفتح",
        description: `تم فتح عرض ${team.name} في تبويب جديد`
      })
    }
  }

  const sendUploadLink = async (teamId: string, teamName: string) => {
    try {
      setSendingLink(teamId)
      const response = await fetch(`/api/supervisor/teams/${teamId}/send-upload-links`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "✅ تم الإرسال",
          description: `تم إرسال ${data.successCount} رابط لأعضاء فريق ${teamName}${data.failCount > 0 ? ` (فشل ${data.failCount})` : ''}`
        })
        fetchData() // Refresh data
      } else {
        toast({
          title: "❌ خطأ",
          description: data.error || 'فشل في إرسال الروابط',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error sending upload links:', error)
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ في إرسال الروابط",
        variant: "destructive"
      })
    } finally {
      setSendingLink(null)
    }
  }

  const sendBulkUploadLinks = async () => {
    const confirmMessage = `هل تريد إرسال روابط الرفع لجميع الفرق التي لم ترفع بعد؟\n\nسيتم الإرسال لـ ${teamsWithoutPresentation.length} فريق`

    if (!confirm(confirmMessage)) return

    toast({
      title: "⏳ جاري الإرسال...",
      description: `إرسال الروابط لـ ${teamsWithoutPresentation.length} فريق`
    })

    let successCount = 0
    let failCount = 0
    let totalEmailsSent = 0

    for (const team of teamsWithoutPresentation) {
      if (team.participants.length > 0) {
        try {
          const response = await fetch(`/api/supervisor/teams/${team.id}/send-upload-links`, {
            method: 'POST',
            credentials: 'include'
          })

          if (response.ok) {
            const data = await response.json()
            successCount++
            totalEmailsSent += data.successCount || 0
          } else {
            failCount++
          }
        } catch (error) {
          failCount++
        }
      }
    }

    toast({
      title: successCount > 0 ? "✅ تم الإرسال" : "❌ فشل الإرسال",
      description: `تم إرسال ${totalEmailsSent} إيميل لـ ${successCount} فريق${failCount > 0 ? ` (فشل ${failCount} فريق)` : ''}`
    })

    fetchData() // Refresh data
  }

  const handleDelete = async (teamId: string, teamName: string) => {
    showConfirm({
      title: '🗑️ تأكيد الحذف',
      message: `هل أنت متأكد من حذف العرض التقديمي للفريق "${teamName}"؟\n\nسيتمكن الفريق من رفع عرض جديد بعد الحذف.`,
      type: 'danger',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        setDeleting(teamId)
        try {
          const response = await fetch(`/api/supervisor/teams/${teamId}/delete-presentation`, {
            method: 'DELETE',
            credentials: 'include'
          })

          if (response.ok) {
            showSuccess('تم حذف العرض التقديمي بنجاح')
            fetchData()
          } else {
            const error = await response.json()
            showError(error.error || 'فشل في حذف العرض التقديمي')
          }
        } catch (error) {
          console.error('Error deleting presentation:', error)
          showError('حدث خطأ في حذف العرض التقديمي')
        } finally {
          setDeleting(null)
        }
      }
    })
  }

  const handleFixUrls = async () => {
    showConfirm({
      title: '🔧 إصلاح روابط العروض التقديمية',
      message: 'هل تريد إصلاح روابط العروض التقديمية القديمة؟\n\nسيتم تحديث جميع الروابط من /image/upload/ إلى /raw/upload/',
      type: 'warning',
      confirmText: 'إصلاح',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        setFixingUrls(true)
        try {
          const response = await fetch('/api/supervisor/fix-presentation-urls', {
            method: 'POST',
            credentials: 'include'
          })

          if (response.ok) {
            const data = await response.json()
            showSuccess(`تم تحديث ${data.updated} رابط بنجاح`)
            fetchData()
          } else {
            const error = await response.json()
            showError(error.error || 'فشل في إصلاح الروابط')
          }
        } catch (error) {
          console.error('Error fixing URLs:', error)
          showError('حدث خطأ في إصلاح الروابط')
        } finally {
          setFixingUrls(false)
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <FileText className="w-10 h-10" />
          نظام متابعة العروض التقديمية
        </h1>
        <p className="text-blue-100 text-lg">
          متابعة وإدارة العروض التقديمية للفرق مع إمكانية إرسال روابط الرفع تلقائياً
        </p>
      </div>

      {/* Filter & Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Hackathon Filter */}
            <div className="space-y-2">
              <label className="text-gray-700 font-medium">اختر الهاكاثون:</label>
              <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر هاكاثون" />
                </SelectTrigger>
                <SelectContent>
                  {hackathons.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-gray-700 font-medium">حالة الرفع:</label>
              <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل ({teams.length})</SelectItem>
                  <SelectItem value="uploaded">تم الرفع ({teams.filter(t => t.ideaFile).length})</SelectItem>
                  <SelectItem value="pending">لم يرفع ({teams.filter(t => !t.ideaFile).length})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <label className="text-gray-700 font-medium">إجراءات:</label>
              <div className="flex gap-2">
                {teamsWithoutPresentation.length > 0 && (
                  <Button
                    onClick={sendBulkUploadLinks}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    <Send className="w-4 h-4 ml-2" />
                    إرسال روابط ({teamsWithoutPresentation.length})
                  </Button>
                )}
                <Button
                  onClick={handleFixUrls}
                  disabled={fixingUrls}
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  {fixingUrls ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 ml-2" />
                  )}
                  إصلاح الروابط
                </Button>
              </div>
            </div>
          </div>

          {selectedHackathon && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>الهاكاثون الحالي:</strong> {hackathons.find(h => h.id === selectedHackathon)?.title}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              إجمالي الفرق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{filteredTeams.length}</div>
            <p className="text-xs text-gray-500 mt-1">من أصل {teams.length} فريق</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              رفعوا العروض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{teamsWithPresentation.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {teams.length > 0 ? Math.round((teamsWithPresentation.length / teams.length) * 100) : 0}% نسبة الإنجاز
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              لم يرفعوا
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{teamsWithoutPresentation.length}</div>
            <p className="text-xs text-gray-500 mt-1">بحاجة لمتابعة</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              الملفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{teamsWithPresentation.length}</div>
            <p className="text-xs text-gray-500 mt-1">ملف متاح للعرض</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams with presentations */}
      {filterStatus !== 'pending' && (
        <Card className="border-t-4 border-t-green-600">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              الفرق التي رفعت العروض ({teamsWithPresentation.length})
            </CardTitle>
            <CardDescription className="text-green-700">
              يمكنك عرض وتحميل وحذف العروض التقديمية المرفوعة
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {teamsWithPresentation.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">لا توجد فرق رفعت عروضها بعد</p>
                <p className="text-gray-400 text-sm mt-2">سيظهر هنا الفرق بعد رفع العروض التقديمية</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamsWithPresentation.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-green-200 rounded-lg p-5 hover:shadow-lg transition-all bg-gradient-to-r from-green-50 to-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                            {team.teamNumber || index + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{team.name}</h3>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              ✅ تم الرفع
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <p className="text-gray-600">
                            <strong className="text-gray-800">الهاكاثون:</strong> {team.hackathon.title}
                          </p>
                          {team.ideaTitle && (
                            <p className="text-gray-600">
                              <strong className="text-gray-800">عنوان الفكرة:</strong> {team.ideaTitle}
                            </p>
                          )}
                          <p className="text-gray-600 flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <strong>{team.participants.length}</strong> أعضاء
                          </p>
                          {team.ideaDescription && (
                            <p className="text-gray-600 col-span-2">
                              <strong className="text-gray-800">الوصف:</strong> {team.ideaDescription}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mr-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(team)}
                          className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                          عرض
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(team)}
                          className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Download className="w-4 h-4" />
                          تحميل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(team.id, team.name)}
                          disabled={deleting === team.id}
                          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        >
                          {deleting === team.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          حذف
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Teams without presentations */}
      {filterStatus !== 'uploaded' && (
        <Card className="border-t-4 border-t-red-600">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <XCircle className="w-6 h-6 text-red-600" />
              الفرق التي لم ترفع العروض ({teamsWithoutPresentation.length})
            </CardTitle>
            <CardDescription className="text-red-700">
              تواصل مع الفرق وأرسل لهم روابط الرفع
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {teamsWithoutPresentation.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-green-600 text-lg font-semibold">جميع الفرق رفعت عروضها! 🎉</p>
                <p className="text-gray-500 text-sm mt-2">ممتاز! كل الفرق أكملت رفع العروض التقديمية</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamsWithoutPresentation.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-red-200 rounded-lg p-5 bg-gradient-to-r from-red-50 to-white hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                            {team.teamNumber || index + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{team.name}</h3>
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              ⏳ لم يرفع بعد
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <p className="text-gray-600">
                            <strong className="text-gray-800">الهاكاثون:</strong> {team.hackathon.title}
                          </p>
                          <p className="text-gray-600 flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <strong>{team.participants.length}</strong> أعضاء
                          </p>
                          {team.participants.length > 0 && (
                            <p className="text-gray-600 col-span-2">
                              <Mail className="w-4 h-4 inline ml-1" />
                              <strong className="text-gray-800">البريد:</strong> {team.participants[0].user.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {team.participants.length > 0 && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white mr-4"
                          onClick={() => sendUploadLink(team.id, team.name)}
                          disabled={sendingLink === team.id}
                        >
                          {sendingLink === team.id ? (
                            <>
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                              جاري الإرسال...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 ml-2" />
                              إرسال لجميع الأعضاء ({team.participants.length})
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

