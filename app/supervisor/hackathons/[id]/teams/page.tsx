"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Users,
  ArrowLeft,
  ExternalLink,
  Github,
  FileText,
  Video,
  Mail,
  GripVertical,
  Trash2,
  Eye,
  Phone,
  MapPin,
  User,
  Save,
  Plus,
  Send,
  AlertCircle,
  Crown,
  RefreshCw
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  phone?: string
  participantId: string
  teamRole?: string
  additionalInfo?: any
  user?: {
    city?: string
    nationality?: string
    preferredRole?: string
  }
}

interface Team {
  id: string
  name: string
  status: string
  submissionUrl?: string
  presentationUrl?: string
  demoUrl?: string
  githubUrl?: string
  createdAt: string
  members: TeamMember[]
  participants?: any[]
}

interface Hackathon {
  id: string
  title: string
  status: string
}

export default function SupervisorTeamsPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string

  const [teams, setTeams] = useState<Team[]>([])
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [draggedMember, setDraggedMember] = useState<{ participantId: string; sourceTeamId: string; memberName: string } | null>(null)
  const [newTeamDialogOpen, setNewTeamDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [autoCreating, setAutoCreating] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [hackathonId])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/supervisor/hackathons/${hackathonId}/teams`)
      const data = await response.json()

      if (response.ok) {
        setTeams(data.teams || [])
        setHackathon(data.hackathon)
      } else {
        setError(data.error || "حدث خطأ في جلب الفرق")
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, participantId: string, sourceTeamId: string, memberName: string) => {
    setDraggedMember({ participantId, sourceTeamId, memberName })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetTeamId: string) => {
    e.preventDefault()
    
    if (!draggedMember || draggedMember.sourceTeamId === targetTeamId) {
      setDraggedMember(null)
      return
    }

    const targetTeam = teams.find(team => team.id === targetTeamId)
    const sourceTeam = teams.find(team => team.id === draggedMember.sourceTeamId)
    
    if (confirm(`هل تريد نقل ${draggedMember.memberName} من ${sourceTeam?.name} إلى ${targetTeam?.name}؟`)) {
      await moveMemberToTeam(
        draggedMember.participantId,
        draggedMember.sourceTeamId,
        targetTeamId,
        draggedMember.memberName
      )
    }
    
    setDraggedMember(null)
  }

  const moveMemberToTeam = async (participantId: string, sourceTeamId: string, targetTeamId: string, memberName?: string) => {
    try {
      setSuccess("")
      setError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${hackathonId}/teams/${sourceTeamId}/members/${participantId}/move`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetTeamId })
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || "تم نقل العضو بنجاح وإرسال الإيميلات")
        fetchTeams() // Refresh teams
        setTimeout(() => setSuccess(""), 5000)
      } else {
        setError(data.error || "حدث خطأ في نقل العضو")
      }
    } catch (error) {
      console.error("Error moving member:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const removeMemberFromTeam = async (teamId: string, participantId: string, memberName: string) => {
    if (!confirm(`هل أنت متأكد من إزالة ${memberName} من الفريق؟`)) return

    try {
      setSuccess("")
      setError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${hackathonId}/teams/${teamId}/members/${participantId}`,
        {
          method: 'DELETE'
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSuccess("تم إزالة العضو بنجاح")
        fetchTeams()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || "حدث خطأ في إزالة العضو")
      }
    } catch (error) {
      console.error("Error removing member:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const deleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${teamName}؟\n\nسيتم إلغاء تعيين جميع الأعضاء من الفريق.`)) return

    try {
      setSuccess("")
      setError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${hackathonId}/teams/${teamId}`,
        {
          method: 'DELETE'
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSuccess(`تم حذف ${teamName} بنجاح`)
        fetchTeams()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || "حدث خطأ في حذف الفريق")
      }
    } catch (error) {
      console.error("Error deleting team:", error)
      setError("حدث خطأ في حذف الفريق")
    }
  }

  const sendTeamEmails = async (teamId: string, teamName: string) => {
    if (!confirm(`هل تريد إرسال إيميلات لجميع أعضاء ${teamName}؟`)) return

    try {
      setSuccess("")
      setError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${hackathonId}/teams/${teamId}/send-emails`,
        {
          method: 'POST'
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSuccess(`تم إرسال الإيميلات بنجاح!\n\nتم إرسال: ${data.emailsSent} إيميل`)
        setTimeout(() => setSuccess(""), 5000)
      } else {
        setError(data.error || "حدث خطأ في إرسال الإيميلات")
      }
    } catch (error) {
      console.error("Error sending emails:", error)
      setError("حدث خطأ في إرسال الإيميلات")
    }
  }

  const createNewTeam = async () => {
    if (!newTeamName.trim()) {
      setError("يرجى إدخال اسم الفريق")
      return
    }

    try {
      setCreatingTeam(true)
      setSuccess("")
      setError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${hackathonId}/teams`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newTeamName })
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSuccess(`تم إنشاء ${newTeamName} بنجاح`)
        setNewTeamName("")
        setNewTeamDialogOpen(false)
        fetchTeams()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || "حدث خطأ في إنشاء الفريق")
      }
    } catch (error) {
      console.error("Error creating team:", error)
      setError("حدث خطأ في إنشاء الفريق")
    } finally {
      setCreatingTeam(false)
    }
  }

  const autoCreateTeams = async () => {
    if (!confirm("هل تريد تكوين الفرق تلقائياً؟\n\nسيتم توزيع المشاركين المقبولين على فرق بشكل تلقائي.")) return

    try {
      setAutoCreating(true)
      setSuccess("")
      setError("")

      const response = await fetch(
        `/api/supervisor/hackathons/${hackathonId}/teams/auto-create`,
        {
          method: 'POST'
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSuccess(`تم تكوين ${data.teamsCreated} فريق بنجاح`)
        fetchTeams()
        setTimeout(() => setSuccess(""), 5000)
      } else {
        setError(data.error || "حدث خطأ في تكوين الفرق")
      }
    } catch (error) {
      console.error("Error auto-creating teams:", error)
      setError("حدث خطأ في تكوين الفرق")
    } finally {
      setAutoCreating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "نشط", className: "bg-green-100 text-green-800" },
      completed: { label: "مكتمل", className: "bg-blue-100 text-blue-800" },
      pending: { label: "قيد الانتظار", className: "bg-yellow-100 text-yellow-800" },
      disqualified: { label: "مستبعد", className: "bg-red-100 text-red-800" }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.className}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/supervisor/hackathons/${hackathonId}`)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الفرق</h1>
            {hackathon && (
              <p className="text-gray-600">{hackathon.title}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setNewTeamDialogOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            إنشاء فريق جديد
          </Button>
          <Button
            onClick={autoCreateTeams}
            disabled={autoCreating}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {autoCreating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            تكوين تلقائي
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800 whitespace-pre-line">{success}</AlertDescription>
        </Alert>
      )}

      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          💡 يمكنك سحب الأعضاء وإفلاتهم بين الفرق لنقلهم. سيتم إرسال إيميلات تلقائياً للمشاركين.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">إجمالي الفرق</div>
            <div className="text-2xl font-bold text-blue-600">{teams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">فرق نشطة</div>
            <div className="text-2xl font-bold text-green-600">
              {teams.filter(t => t.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">مشاريع مسلمة</div>
            <div className="text-2xl font-bold text-purple-600">
              {teams.filter(t => t.submissionUrl).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">إجمالي الأعضاء</div>
            <div className="text-2xl font-bold text-indigo-600">
              {teams.reduce((total, team) => total + team.members.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams List with Drag and Drop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {teams.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">لا توجد فرق في هذا الهاكاثون</p>
              <Button onClick={autoCreateTeams} className="gap-2">
                <Users className="w-4 h-4" />
                تكوين الفرق تلقائياً
              </Button>
            </CardContent>
          </Card>
        ) : (
          teams.map((team) => (
            <div
              key={team.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, team.id)}
              className={`transition-all ${
                draggedMember && draggedMember.sourceTeamId !== team.id 
                  ? 'ring-2 ring-blue-400 bg-blue-50 rounded-lg' 
                  : ''
              }`}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">{team.name}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {team.members.length} عضو
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(team.status)}
                  </div>
                  <CardDescription>
                    تم الإنشاء: {new Date(team.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendTeamEmails(team.id, team.name)}
                      className="gap-2 flex-1"
                    >
                      <Send className="w-4 h-4" />
                      إرسال إيميلات
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTeam(team.id, team.name)}
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف الفريق
                    </Button>
                  </div>

                  {/* Team Members - Draggable */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      أعضاء الفريق
                    </h4>
                    <div className="space-y-2">
                      {team.members.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">لا يوجد أعضاء في هذا الفريق</p>
                      ) : (
                        team.members.map((member) => (
                          <div
                            key={member.participantId}
                            draggable
                            onDragStart={(e) => handleDragStart(e, member.participantId, team.id, member.name)}
                            className={`flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-move border border-transparent hover:border-blue-300 transition-all ${
                              draggedMember?.participantId === member.participantId ? 'opacity-50' : ''
                            }`}
                          >
                            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {member.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">{member.email}</div>
                              {(() => {
                                // Get role from additionalInfo.formData
                                let role = 'مشارك'
                                if (member.additionalInfo?.formData) {
                                  const formData = member.additionalInfo.formData
                                  // Check field_1760547826023 first
                                  if (formData['field_1760547826023']) {
                                    role = formData['field_1760547826023']
                                  } else {
                                    // Search for role field
                                    const roleKeys = Object.keys(formData).filter(key => 
                                      key.toLowerCase().includes('role') || 
                                      key.includes('دور') || 
                                      key.includes('الدور') ||
                                      key.includes('تلعبه') ||
                                      key.includes('الفريق') ||
                                      key.includes('الفربق')
                                    )
                                    if (roleKeys.length > 0 && formData[roleKeys[0]]) {
                                      role = formData[roleKeys[0]]
                                    }
                                  }
                                }
                                return role !== 'مشارك' && (
                                  <div className="text-xs font-medium text-blue-600 truncate mt-1">
                                    {role}
                                  </div>
                                )
                              })()}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedMember(member)
                                  setDetailsDialogOpen(true)
                                }}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeMemberFromTeam(team.id, member.participantId, member.name)
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Project Links */}
                  {(team.submissionUrl || team.githubUrl || team.presentationUrl || team.demoUrl) && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">روابط المشروع</h4>
                      <div className="flex flex-wrap gap-2">
                        {team.submissionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2"
                          >
                            <a href={team.submissionUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4" />
                              المشروع
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                        {team.githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2"
                          >
                            <a href={team.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4" />
                              GitHub
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                        {team.presentationUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2"
                          >
                            <a href={team.presentationUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4" />
                              العرض
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                        {team.demoUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2"
                          >
                            <a href={team.demoUrl} target="_blank" rel="noopener noreferrer">
                              <Video className="w-4 h-4" />
                              فيديو
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Create New Team Dialog */}
      <Dialog open={newTeamDialogOpen} onOpenChange={setNewTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء فريق جديد</DialogTitle>
            <DialogDescription>
              أدخل اسم الفريق الجديد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">اسم الفريق</Label>
              <Input
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="مثال: فريق الابتكار"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createNewTeam()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewTeamDialogOpen(false)
                setNewTeamName("")
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={createNewTeam}
              disabled={creatingTeam || !newTeamName.trim()}
              className="gap-2"
            >
              {creatingTeam ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              إنشاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">تفاصيل المشارك</DialogTitle>
            <DialogDescription>
              معلومات تفصيلية عن المشارك وبيانات التسجيل
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              {/* المعلومات الأساسية */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">المعلومات الأساسية</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">الاسم</p>
                    <p className="text-base font-medium text-gray-900">{selectedMember.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="text-base font-medium text-gray-900">{selectedMember.email}</p>
                  </div>

                  {selectedMember.phone && (
                    <div>
                      <p className="text-sm text-gray-500">رقم الهاتف</p>
                      <p className="text-base font-medium text-gray-900">{selectedMember.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* بيانات التسجيل الإضافية */}
              {selectedMember.additionalInfo?.formData && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">بيانات التسجيل الإضافية</h3>
                  
                  <div className="grid gap-3">
                    {Object.entries(selectedMember.additionalInfo.formData).map(([key, value]) => {
                      // Skip if already shown in basic info
                      if (['name', 'email', 'phone'].includes(key.toLowerCase())) return null
                      
                      // Format field name
                      let fieldName = key
                      if (key === 'field_1760542564292') fieldName = 'رقم الهوية'
                      else if (key === 'field_1760542722892') fieldName = 'نبذه عن المشارك'
                      else if (key === 'field_1760544735858') fieldName = 'الوضع الحالي'
                      else if (key === 'field_1760547800823') fieldName = 'هل شاركت في هاكاثونات افتراضيه عبر الانترنت من قبل'
                      else if (key === 'field_1760547806200') fieldName = 'جهة العمل'
                      else if (key === 'field_1760547826023') fieldName = 'الدور الذي تريد ان تلعبه في الفريق'
                      else if (key === 'field_1760636894490') fieldName = 'الجنسية'
                      
                      return (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-1">{fieldName}</p>
                          <p className="text-base text-gray-900 whitespace-pre-wrap">{String(value)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* معلومات إضافية من user */}
              {(selectedMember.user?.city || selectedMember.user?.nationality || selectedMember.user?.preferredRole) && (
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">معلومات أخرى</h3>
                  
                  {selectedMember.user?.city && (
                    <div>
                      <p className="text-sm text-gray-500">المدينة</p>
                      <p className="text-base font-medium text-gray-900">{selectedMember.user.city}</p>
                    </div>
                  )}

                  {selectedMember.user?.nationality && (
                    <div>
                      <p className="text-sm text-gray-500">الجنسية</p>
                      <p className="text-base font-medium text-gray-900">{selectedMember.user.nationality}</p>
                    </div>
                  )}

                  {selectedMember.teamRole && (
                    <div>
                      <p className="text-sm text-gray-500">دور الفريق المعين</p>
                      <Badge className="bg-blue-500">{selectedMember.teamRole}</Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)} variant="outline">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

