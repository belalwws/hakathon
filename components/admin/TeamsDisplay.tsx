"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Mail, User, Crown, Trash2, UserMinus, ArrowRightLeft, Eye, Phone, MapPin, FileText, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface TeamMember {
  id: string
  user: {
    name: string
    email: string
    phone?: string
    city?: string
    nationality?: string
    preferredRole: string
  }
  teamRole?: string
  additionalInfo?: any
}

interface DraggedMember {
  participantId: string
  sourceTeamId: string
  memberName: string
}

interface Team {
  id: string
  name: string
  createdAt: string
  members: TeamMember[]
}

interface TeamsDisplayProps {
  hackathonId: string
}

export default function TeamsDisplay({ hackathonId }: TeamsDisplayProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedMember, setDraggedMember] = useState<DraggedMember | null>(null)
  const [selectedMemberToMove, setSelectedMemberToMove] = useState<{participantId: string, sourceTeamId: string, memberName: string} | null>(null)
  const [targetTeamForMove, setTargetTeamForMove] = useState<string>('')
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<TeamMember | null>(null)
  
  // Email customization states
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedTeamForEmail, setSelectedTeamForEmail] = useState<{id: string, name: string} | null>(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [pdfLink, setPdfLink] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [hackathonId])

  const fetchTeams = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/teams`)
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${teamName}؟\n\nسيتم إلغاء تعيين جميع الأعضاء من الفريق.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/teams/${teamId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTeams() // Refresh teams
        alert(`تم حذف ${teamName} بنجاح`)
      } else {
        alert('فشل في حذف الفريق')
      }
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('حدث خطأ في حذف الفريق')
    }
  }

  const openEmailModal = (teamId: string, teamName: string) => {
    // Find team to get hackathon title
    const team = teams.find(t => t.id === teamId)
    if (!team) return
    
    setSelectedTeamForEmail({ id: teamId, name: teamName })
    
    // Set default values
    setEmailSubject(`📋 تفاصيل فريقك - ${teamName}`)
    setEmailMessage(`إليك المعلومات والإرشادات الخاصة بفريقك في الهاكاثون. نتمنى لكم التوفيق والنجاح!`)
    setPdfLink('')
    setAdditionalNotes('')
    
    setShowEmailModal(true)
  }

  const sendTeamEmails = async () => {
    if (!selectedTeamForEmail) return
    
    setSendingEmail(true)
    
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/teams/${selectedTeamForEmail.id}/send-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customSubject: emailSubject,
          customMessage: emailMessage,
          pdfLink: pdfLink || undefined,
          additionalNotes: additionalNotes || undefined
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`تم إرسال الإيميلات بنجاح!\n\nتم إرسال: ${result.emailsSent} إيميل`)
        setShowEmailModal(false)
        setSelectedTeamForEmail(null)
      } else {
        alert('فشل في إرسال الإيميلات')
      }
    } catch (error) {
      console.error('Error sending team emails:', error)
      alert('حدث خطأ في إرسال الإيميلات')
    } finally {
      setSendingEmail(false)
    }
  }

  const removeMemberFromTeam = async (participantId: string, teamId: string, memberName: string, teamName: string) => {
    if (!confirm(`هل أنت متأكد من إزالة ${memberName} من ${teamName}؟`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/teams/${teamId}/members/${participantId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        fetchTeams() // Refresh teams
        alert(result.message)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إزالة العضو')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      alert('حدث خطأ في إزالة العضو')
    }
  }

  const moveMemberToTeam = async (participantId: string, sourceTeamId: string, targetTeamId: string, memberName: string) => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/teams/${sourceTeamId}/members/${participantId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetTeamId })
      })

      if (response.ok) {
        const result = await response.json()
        fetchTeams() // Refresh teams
        alert(result.message)
        setSelectedMemberToMove(null)
        setTargetTeamForMove('')
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في نقل العضو')
      }
    } catch (error) {
      console.error('Error moving member:', error)
      alert('حدث خطأ في نقل العضو')
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#8b7632]">جاري تحميل الفرق...</p>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد فرق</h3>
        <p className="text-[#8b7632]">لم يتم تكوين أي فرق بعد. استخدم زر "تكوين الفرق تلقائياً" لإنشاء الفرق.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#01645e]">
          الفرق المكونة ({teams.length} فريق)
        </h3>
        <Badge variant="outline" className="text-[#3ab666] border-[#3ab666]">
          إجمالي الأعضاء: {teams.reduce((total, team) => total + team.members.length, 0)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`h-full hover:shadow-lg transition-all duration-200 ${
                draggedMember && draggedMember.sourceTeamId !== team.id 
                  ? 'border-2 border-dashed border-[#3ab666] bg-green-50' 
                  : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, team.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[#01645e] flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#c3e956]" />
                    {team.name}
                  </CardTitle>
                  <Badge className="bg-[#3ab666] text-white">
                    {team.members.length} أعضاء
                  </Badge>
                </div>
                <CardDescription>
                  تم الإنشاء: {new Date(team.createdAt).toLocaleDateString('ar-SA')}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Team Members */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#01645e] text-sm flex items-center gap-2">
                    أعضاء الفريق:
                    {draggedMember && draggedMember.sourceTeamId !== team.id && (
                      <span className="text-xs text-[#3ab666] bg-green-100 px-2 py-1 rounded">
                        اسحب هنا لنقل العضو
                      </span>
                    )}
                  </h4>
                  {team.members.map((member) => (
                    <div 
                      key={member.id} 
                      className={`flex items-center gap-3 p-2 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors ${
                        draggedMember?.participantId === member.id ? 'opacity-50' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, member.id, team.id, member.user.name)}
                    >
                      <User className="w-4 h-4 text-[#3ab666]" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#01645e] truncate">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-[#8b7632] truncate">
                          {member.user.preferredRole}
                        </p>
                      </div>
                      
                      {/* Member Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* عرض التفاصيل */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              onClick={() => setSelectedMemberDetails(member)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl text-[#01645e]">بيانات التسجيل الإضافية</DialogTitle>
                              <DialogDescription>
                                معلومات شاملة عن المشارك {selectedMemberDetails?.user.name}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedMemberDetails && (
                              <div className="grid gap-4 py-4">
                                {/* المعلومات الأساسية */}
                                <div className="space-y-3 border-b pb-4">
                                  <div className="space-y-2">
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold text-[#8b7632]">الاسم الثلاثي</p>
                                      <p className="text-base text-[#01645e]">{selectedMemberDetails.user.name}</p>
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold text-[#8b7632]">البريد الإلكتروني</p>
                                      <p className="text-base text-[#01645e]">{selectedMemberDetails.user.email}</p>
                                    </div>
                                    
                                    {(selectedMemberDetails.user.phone || selectedMemberDetails.additionalInfo?.phone) && (
                                      <div className="space-y-1">
                                        <p className="text-sm font-semibold text-[#8b7632]">رقم الهاتف</p>
                                        <p className="text-base text-[#01645e]">
                                          {selectedMemberDetails.user.phone || selectedMemberDetails.additionalInfo?.phone}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {selectedMemberDetails.additionalInfo?.nationalId && (
                                      <div className="space-y-1">
                                        <p className="text-sm font-semibold text-[#8b7632]">رقم الهوية</p>
                                        <p className="text-base text-[#01645e]">{selectedMemberDetails.additionalInfo.nationalId}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* نبذة عن المشارك */}
                                {selectedMemberDetails.additionalInfo?.bio && (
                                  <div className="space-y-2 border-b pb-4">
                                    <p className="text-sm font-semibold text-[#8b7632]">نبذه عن المشارك</p>
                                    <p className="text-base text-[#01645e] whitespace-pre-wrap">{selectedMemberDetails.additionalInfo.bio}</p>
                                  </div>
                                )}

                                {/* الوضع الحالي */}
                                {selectedMemberDetails.additionalInfo?.currentStatus && (
                                  <div className="space-y-1 border-b pb-4">
                                    <p className="text-sm font-semibold text-[#8b7632]">الوضع الحالي</p>
                                    <p className="text-base text-[#01645e]">{selectedMemberDetails.additionalInfo.currentStatus}</p>
                                  </div>
                                )}

                                {/* الخبرة في الهاكاثونات */}
                                {selectedMemberDetails.additionalInfo?.hasVirtualHackathonExperience && (
                                  <div className="space-y-1 border-b pb-4">
                                    <p className="text-sm font-semibold text-[#8b7632]">هل شاركت في هاكاثونات افتراضيه عبر الانترنت من قبل</p>
                                    <p className="text-base text-[#01645e]">
                                      {selectedMemberDetails.additionalInfo.hasVirtualHackathonExperience === 'yes' ? 'نعم' : 'لا'}
                                    </p>
                                  </div>
                                )}

                                {/* جهة العمل */}
                                {selectedMemberDetails.additionalInfo?.workplace && (
                                  <div className="space-y-1 border-b pb-4">
                                    <p className="text-sm font-semibold text-[#8b7632]">جهة العمل</p>
                                    <p className="text-base text-[#01645e]">{selectedMemberDetails.additionalInfo.workplace}</p>
                                  </div>
                                )}

                                {/* الدور المفضل */}
                                <div className="space-y-1 border-b pb-4">
                                  <p className="text-sm font-semibold text-[#8b7632]">الدور الذي تريد ان تلعبه في الفريق</p>
                                  <Badge className="bg-[#3ab666] text-white">
                                    {selectedMemberDetails.user.preferredRole}
                                  </Badge>
                                </div>

                                {/* المدينة والجنسية */}
                                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                  {(selectedMemberDetails.user.city || selectedMemberDetails.additionalInfo?.city) && (
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold text-[#8b7632]">المدينة</p>
                                      <p className="text-base text-[#01645e]">
                                        {selectedMemberDetails.user.city || selectedMemberDetails.additionalInfo?.city}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {(selectedMemberDetails.user.nationality || selectedMemberDetails.additionalInfo?.nationality) && (
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold text-[#8b7632]">الجنسية</p>
                                      <p className="text-base text-[#01645e]">
                                        {selectedMemberDetails.user.nationality || selectedMemberDetails.additionalInfo?.nationality}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* دور الفريق (إن وجد) */}
                                {selectedMemberDetails.teamRole && (
                                  <div className="space-y-1 border-b pb-4">
                                    <p className="text-sm font-semibold text-[#8b7632]">دور الفريق المعين</p>
                                    <Badge variant="outline" className="border-[#3ab666] text-[#3ab666]">
                                      {selectedMemberDetails.teamRole}
                                    </Badge>
                                  </div>
                                )}

                                {/* باقي المعلومات الإضافية */}
                                {selectedMemberDetails.additionalInfo && Object.keys(selectedMemberDetails.additionalInfo).length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-[#01645e] text-sm">معلومات التسجيل الإضافية</h4>
                                    <div className="grid gap-3">
                                      {Object.entries(selectedMemberDetails.additionalInfo)
                                        .filter(([key]) => !['phone', 'nationalId', 'bio', 'currentStatus', 'hasVirtualHackathonExperience', 'workplace', 'city', 'nationality'].includes(key))
                                        .map(([key, value]) => (
                                          <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-[#8b7632] mb-1">{key}</p>
                                            <p className="text-sm text-[#01645e] font-medium">{String(value)}</p>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            <DialogFooter>
                              <Button onClick={() => setSelectedMemberDetails(null)} variant="outline">
                                إغلاق
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* نقل العضو */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => setSelectedMemberToMove({participantId: member.id, sourceTeamId: team.id, memberName: member.user.name})}
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>نقل العضو إلى فريق آخر</DialogTitle>
                              <DialogDescription>
                                اختر الفريق المراد نقل {member.user.name} إليه
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <Select value={targetTeamForMove} onValueChange={setTargetTeamForMove}>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الفريق المستهدف" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teams.filter(t => t.id !== team.id).map((targetTeam) => (
                                    <SelectItem key={targetTeam.id} value={targetTeam.id}>
                                      {targetTeam.name} ({targetTeam.members.length} أعضاء)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  if (selectedMemberToMove && targetTeamForMove) {
                                    moveMemberToTeam(
                                      selectedMemberToMove.participantId,
                                      selectedMemberToMove.sourceTeamId,
                                      targetTeamForMove,
                                      selectedMemberToMove.memberName
                                    )
                                  }
                                }}
                                disabled={!targetTeamForMove}
                                className="bg-[#3ab666] hover:bg-[#2d8f4f]"
                              >
                                نقل العضو
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        {/* إزالة العضو */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeMemberFromTeam(member.id, team.id, member.user.name, team.name)}
                        >
                          <UserMinus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Team Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => openEmailModal(team.id, team.name)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Mail className="w-3 h-3 ml-1" />
                    إرسال إيميلات
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTeam(team.id, team.name)}
                    className="text-red-600 hover:text-red-700 border-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-[#01645e] mb-3">إحصائيات الفرق:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#3ab666]">{teams.length}</p>
            <p className="text-sm text-[#8b7632]">إجمالي الفرق</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#3ab666]">
              {teams.reduce((total, team) => total + team.members.length, 0)}
            </p>
            <p className="text-sm text-[#8b7632]">إجمالي الأعضاء</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#3ab666]">
              {teams.length > 0 ? Math.round(teams.reduce((total, team) => total + team.members.length, 0) / teams.length) : 0}
            </p>
            <p className="text-sm text-[#8b7632]">متوسط الأعضاء</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#3ab666]">
              {Math.max(...teams.map(team => team.members.length), 0)}
            </p>
            <p className="text-sm text-[#8b7632]">أكبر فريق</p>
          </div>
        </div>
      </div>

      {/* Email Customization Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#01645e] flex items-center gap-2">
              <Mail className="w-6 h-6" />
              تخصيص إيميل الفريق
            </DialogTitle>
            <DialogDescription className="text-base">
              قم بتعديل محتوى الإيميل قبل إرساله لأعضاء {selectedTeamForEmail?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Email Subject */}
            <div className="space-y-2">
              <Label htmlFor="emailSubject" className="text-[#01645e] font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                عنوان الإيميل
              </Label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="📋 تفاصيل فريقك - اسم الفريق"
                className="border-[#01645e]/30 focus:border-[#3ab666]"
              />
            </div>

            {/* Email Message */}
            <div className="space-y-2">
              <Label htmlFor="emailMessage" className="text-[#01645e] font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4" />
                الرسالة الرئيسية
              </Label>
              <Textarea
                id="emailMessage"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="اكتب الرسالة التي تريد إرسالها لأعضاء الفريق..."
                rows={4}
                className="border-[#01645e]/30 focus:border-[#3ab666] resize-none"
              />
              <p className="text-xs text-[#8b7632]">
                سيتم إضافة تفاصيل الفريق وأسماء الأعضاء تلقائياً في الإيميل
              </p>
            </div>

            {/* PDF Link */}
            <div className="space-y-2">
              <Label htmlFor="pdfLink" className="text-[#01645e] font-semibold flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                رابط الكتيب الإرشادي (PDF) - اختياري
              </Label>
              <Input
                id="pdfLink"
                value={pdfLink}
                onChange={(e) => setPdfLink(e.target.value)}
                placeholder="https://example.com/hackathon-guide.pdf"
                type="url"
                className="border-[#01645e]/30 focus:border-[#3ab666]"
              />
              <p className="text-xs text-[#8b7632]">
                إذا أضفت رابط، سيظهر زر تحميل الكتيب في الإيميل
              </p>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="additionalNotes" className="text-[#01645e] font-semibold flex items-center gap-2">
                💡 ملاحظات إضافية - اختياري
              </Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="أضف أي ملاحظات أو تعليمات إضافية للفريق..."
                rows={3}
                className="border-[#01645e]/30 focus:border-[#3ab666] resize-none"
              />
            </div>

            {/* Preview Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">📝 معاينة المحتوى:</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>سيتم إرسال الإيميل لجميع أعضاء الفريق ({teams.find(t => t.id === selectedTeamForEmail?.id)?.members.length || 0} عضو)</li>
                <li>سيحتوي الإيميل على: اسم الفريق، أدوار الأعضاء، ونصائح للعمل الجماعي</li>
                <li>سيتم إضافة المحتوى المخصص الذي كتبته أعلاه</li>
                {pdfLink && <li className="text-green-700 font-medium">✅ سيتم إضافة زر تحميل الكتيب الإرشادي</li>}
                {additionalNotes && <li className="text-purple-700 font-medium">✅ سيتم إضافة الملاحظات الإضافية</li>}
              </ul>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailModal(false)
                setSelectedTeamForEmail(null)
              }}
              disabled={sendingEmail}
            >
              إلغاء
            </Button>
            <Button
              onClick={sendTeamEmails}
              disabled={sendingEmail || !emailSubject || !emailMessage}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]"
            >
              {sendingEmail ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 ml-2" />
                  إرسال الإيميلات
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
