"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Search,
  Plus,
  Clock,
  Shield,
  Trash2,
  Edit,
  MoreVertical,
  Activity,
  LogIn,
  TrendingUp,
  X,
  Save,
  UserPlus,
  Mail,
  List,
  Send,
  Copy
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SupervisorUser {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  profilePicture?: string
  createdAt: string
  isActive: boolean
  lastLogin?: string
  isOnline?: boolean
  lastActivity?: string
  loginCount?: number
  role: string
}

interface Hackathon {
  id: string
  title: string
  status: string
}

interface Assignment {
  id: string
  hackathonId: string | null
  hackathon: Hackathon | null
  department?: string
  permissions?: any
  isActive: boolean
  assignedAt: string
}

interface SupervisorGroup {
  user: SupervisorUser
  assignments: Assignment[]
}

interface Invitation {
  id: string
  email: string
  name?: string
  hackathonId?: string
  hackathon?: Hackathon
  department?: string
  permissions?: any
  token: string
  status: string
  createdAt: string
}

export default function SupervisorsManagement() {
  const [supervisorGroups, setSupervisorGroups] = useState<SupervisorGroup[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Add/Edit Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isInvitationsDialogOpen, setIsInvitationsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SupervisorGroup | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    userId: "",
    hackathonId: "",
    department: "",
    permissions: ""
  })

  // Invitation form state
  const [inviteFormData, setInviteFormData] = useState({
    email: "",
    name: "",
    hackathonId: "",
    department: "",
    permissions: ""
  })

  useEffect(() => {
    fetchData()
    fetchAllUsers()
    fetchHackathons()
    fetchInvitations()

    // Auto-refresh data every 30 seconds to update online status
    const interval = setInterval(() => {
      fetchData()
    }, 30 * 1000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/supervisor-assignments", { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSupervisorGroups(data.supervisors || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchHackathons = async () => {
    try {
      const response = await fetch("/api/hackathons", { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || data || [])
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error)
    }
  }

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/admin/supervisor-invitations", { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error("Error fetching invitations:", error)
    }
  }

  const handleAddSupervisor = async () => {
    try {
      const response = await fetch("/api/admin/supervisor-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: formData.userId,
          hackathonId: formData.hackathonId || null,
          department: formData.department || null,
          permissions: formData.permissions ? JSON.parse(formData.permissions) : null
        })
      })

      if (response.ok) {
        await fetchData()
        setIsAddDialogOpen(false)
        setFormData({ userId: "", hackathonId: "", department: "", permissions: "" })
        alert("تم إضافة المشرف بنجاح")
      } else {
        const error = await response.json()
        alert(error.error || "حدث خطأ")
      }
    } catch (error) {
      console.error("Error adding supervisor:", error)
      alert("حدث خطأ في إضافة المشرف")
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعيين؟")) return

    try {
      const response = await fetch(`/api/admin/supervisor-assignments?id=${assignmentId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (response.ok) {
        await fetchData()
        alert("تم حذف التعيين بنجاح")
      } else {
        alert("حدث خطأ في حذف التعيين")
      }
    } catch (error) {
      console.error("Error deleting assignment:", error)
      alert("حدث خطأ في حذف التعيين")
    }
  }

  const handleEditUser = (group: SupervisorGroup) => {
    setSelectedUser(group)
    setIsEditDialogOpen(true)
  }

  const handleInviteSupervisor = async () => {
    try {
      if (!inviteFormData.email) {
        alert("البريد الإلكتروني مطلوب")
        return
      }

      const response = await fetch("/api/admin/supervisor-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: inviteFormData.email,
          name: inviteFormData.name || null,
          hackathonId: inviteFormData.hackathonId || null,
          department: inviteFormData.department || null,
          permissions: inviteFormData.permissions ? JSON.parse(inviteFormData.permissions) : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        await fetchInvitations()
        setIsInviteDialogOpen(false)
        setInviteFormData({ email: "", name: "", hackathonId: "", department: "", permissions: "" })
        alert("تم إرسال الدعوة بنجاح")
      } else {
        alert(data.error || "حدث خطأ")
      }
    } catch (error) {
      console.error("Error inviting supervisor:", error)
      alert("حدث خطأ في إرسال الدعوة")
    }
  }

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدعوة؟")) return

    try {
      const response = await fetch(`/api/admin/supervisor-invitations?id=${invitationId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (response.ok) {
        await fetchInvitations()
        alert("تم حذف الدعوة بنجاح")
      } else {
        alert("حدث خطأ في حذف الدعوة")
      }
    } catch (error) {
      console.error("Error deleting invitation:", error)
      alert("حدث خطأ في حذف الدعوة")
    }
  }

  const copyInvitationUrl = (token: string) => {
    const url = `${window.location.origin}/supervisor/accept-invitation?token=${token}`
    navigator.clipboard.writeText(url)
    setCopiedUrl(token)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const filteredSupervisors = supervisorGroups.filter(group =>
    group.user.name.toLowerCase().includes(search.toLowerCase()) ||
    group.user.email.toLowerCase().includes(search.toLowerCase())
  )

  const getOnlineStatus = (user: SupervisorUser) => {
    // Check isOnline flag first
    if (!user.isOnline) return false

    // Then verify with lastActivity (within 3 minutes)
    if (!user.lastActivity) return false
    const lastActivity = new Date(user.lastActivity)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60)
    return diffMinutes < 3 // 3 minutes threshold
  }

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return "لم يسجل دخول بعد"

    try {
      const date = new Date(lastLogin)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return "الآن"
      if (diffMins === 1) return "منذ دقيقة"
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`
      if (diffHours === 1) return "منذ ساعة"
      if (diffHours < 24) return `منذ ${diffHours} ساعة`
      if (diffDays === 1) return "منذ يوم"
      if (diffDays < 7) return `منذ ${diffDays} يوم`

      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return "لم يسجل دخول بعد"
    }
  }

  const stats = {
    total: supervisorGroups.length,
    active: supervisorGroups.filter(g => g.user.isActive).length,
    online: supervisorGroups.filter(g => getOnlineStatus(g.user)).length,
    totalLogins: supervisorGroups.reduce((sum, g) => sum + (g.user.loginCount || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">إدارة المشرفين</h1>
            <p className="text-slate-600 mt-1">متابعة وإدارة المشرفين ونشاطهم</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsInvitationsDialogOpen(true)}
              variant="outline"
              className="border-slate-200 hover:bg-slate-50"
            >
              <List className="w-4 h-4 ml-2" />
              الدعوات ({invitations.filter(i => i.status === 'pending').length})
            </Button>
            <Button
              onClick={() => setIsInviteDialogOpen(true)}
              variant="outline"
              className="border-slate-200 hover:bg-slate-50"
            >
              <Mail className="w-4 h-4 ml-2" />
              دعوة مشرف
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة تعيين
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Users className="w-5 h-5 text-slate-700" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">إجمالي المشرفين</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Shield className="w-5 h-5 text-slate-700" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">المشرفين النشطين</p>
              <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Activity className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">متصل الآن</p>
              <p className="text-3xl font-bold text-slate-900">{stats.online}</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <LogIn className="w-5 h-5 text-slate-700" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">إجمالي تسجيلات الدخول</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalLogins}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="البحث عن مشرف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 border-slate-200 focus:border-slate-900"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-xl font-semibold text-slate-900">قائمة المشرفين</CardTitle>
            <CardDescription className="text-slate-600">
              {filteredSupervisors.length} مشرف
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="text-slate-700 font-semibold">المشرف</TableHead>
                  <TableHead className="text-slate-700 font-semibold">الحالة</TableHead>
                  <TableHead className="text-slate-700 font-semibold">آخر تسجيل دخول</TableHead>
                  <TableHead className="text-slate-700 font-semibold">عدد التسجيلات</TableHead>
                  <TableHead className="text-slate-700 font-semibold">الهاكاثونات</TableHead>
                  <TableHead className="text-slate-700 font-semibold text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSupervisors.map((group) => {
                  const isOnline = getOnlineStatus(group.user)
                  return (
                    <TableRow key={group.user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={group.user.profilePicture} />
                              <AvatarFallback className="bg-slate-100 text-slate-700">
                                {group.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{group.user.name}</p>
                            <p className="text-sm text-slate-600">{group.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isOnline ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                            <Activity className="w-3 h-3 ml-1" />
                            متصل
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0">
                            غير متصل
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          {formatLastLogin(group.user.lastLogin)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-900 font-medium">{group.user.loginCount || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-900 font-medium">{group.assignments.length}</span>
                      </TableCell>
                      <TableCell className="text-left">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditUser(group)}>
                              <Edit className="w-4 h-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            {group.assignments.map((assignment) => (
                              <DropdownMenuItem
                                key={assignment.id}
                                className="text-red-600"
                                onClick={() => handleDeleteAssignment(assignment.id)}
                              >
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف تعيين {assignment.hackathon?.title || "عام"}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Supervisor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">إضافة تعيين مشرف</DialogTitle>
            <DialogDescription className="text-slate-600">
              قم بتعيين مستخدم كمشرف على هاكاثون معين أو كمشرف عام
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user" className="text-slate-700 font-medium">المستخدم</Label>
              <Select value={formData.userId} onValueChange={(value) => setFormData({...formData, userId: value})}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="اختر مستخدم" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.filter(u => u.role === 'supervisor').map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hackathon" className="text-slate-700 font-medium">الهاكاثون (اختياري)</Label>
              <Select value={formData.hackathonId || "general"} onValueChange={(value) => setFormData({...formData, hackathonId: value === "general" ? "" : value})}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="اختر هاكاثون أو اتركه فارغاً للمشرف العام" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">مشرف عام (بدون هاكاثون محدد)</SelectItem>
                  {hackathons.map((hackathon) => (
                    <SelectItem key={hackathon.id} value={hackathon.id}>
                      {hackathon.title} ({hackathon.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-slate-700 font-medium">القسم (اختياري)</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                placeholder="مثال: قسم التقنية، قسم التصميم"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="permissions" className="text-slate-700 font-medium">الصلاحيات (JSON - اختياري)</Label>
              <Textarea
                id="permissions"
                value={formData.permissions}
                onChange={(e) => setFormData({...formData, permissions: e.target.value})}
                placeholder='{"canApprove": true, "canReject": true, "canEdit": false}'
                className="border-slate-200 font-mono text-sm"
                rows={3}
              />
              <p className="text-xs text-slate-500">أدخل JSON صالح للصلاحيات أو اتركه فارغاً</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddSupervisor} className="bg-slate-900 hover:bg-slate-800">
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/View Supervisor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">تفاصيل المشرف</DialogTitle>
            <DialogDescription className="text-slate-600">
              معلومات المشرف وتعييناته
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* User Info */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedUser.user.profilePicture} />
                    <AvatarFallback className="bg-slate-900 text-white text-xl">
                      {selectedUser.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{selectedUser.user.name}</h3>
                    <p className="text-sm text-slate-600">{selectedUser.user.email}</p>
                    {selectedUser.user.phone && (
                      <p className="text-sm text-slate-600">{selectedUser.user.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">الحالة:</span>
                    <Badge className={selectedUser.user.isActive ? "bg-green-100 text-green-700 ml-2" : "bg-red-100 text-red-700 ml-2"}>
                      {selectedUser.user.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-600">آخر تسجيل دخول:</span>
                    <span className="text-slate-900 font-medium ml-2">
                      {selectedUser.user.lastLogin
                        ? new Date(selectedUser.user.lastLogin).toLocaleString('ar-SA')
                        : "لم يسجل دخول بعد"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">عدد تسجيلات الدخول:</span>
                    <span className="text-slate-900 font-medium ml-2">{selectedUser.user.loginCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">المدينة:</span>
                    <span className="text-slate-900 font-medium ml-2">{selectedUser.user.city || "غير محدد"}</span>
                  </div>
                </div>
              </div>

              {/* Assignments */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">التعيينات ({selectedUser.assignments.length})</h4>
                {selectedUser.assignments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.assignments.map((assignment) => (
                      <div key={assignment.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-semibold text-slate-900">
                              {assignment.hackathon?.title || "مشرف عام"}
                            </h5>
                            {assignment.hackathon && (
                              <Badge className="mt-1 bg-slate-100 text-slate-700">
                                {assignment.hackathon.status}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {assignment.department && (
                          <p className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">القسم:</span> {assignment.department}
                          </p>
                        )}

                        {assignment.permissions && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-slate-700 mb-1">الصلاحيات:</p>
                            <pre className="text-xs bg-slate-100 p-2 rounded border border-slate-200 overflow-x-auto">
                              {JSON.stringify(assignment.permissions, null, 2)}
                            </pre>
                          </div>
                        )}

                        <p className="text-xs text-slate-500 mt-2">
                          تم التعيين: {new Date(assignment.assignedAt).toLocaleString('ar-SA')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-4">لا توجد تعيينات</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Supervisor Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">دعوة مشرف جديد</DialogTitle>
            <DialogDescription className="text-slate-600">
              أرسل دعوة عبر البريد الإلكتروني لمشرف جديد للانضمام إلى المنصة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-slate-700 font-medium">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteFormData.email}
                onChange={(e) => setInviteFormData({...inviteFormData, email: e.target.value})}
                placeholder="supervisor@example.com"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-name" className="text-slate-700 font-medium">الاسم (اختياري)</Label>
              <Input
                id="invite-name"
                value={inviteFormData.name}
                onChange={(e) => setInviteFormData({...inviteFormData, name: e.target.value})}
                placeholder="اسم المشرف"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-hackathon" className="text-slate-700 font-medium">الهاكاثون (اختياري)</Label>
              <Select
                value={inviteFormData.hackathonId || "general"}
                onValueChange={(value) => setInviteFormData({
                  ...inviteFormData,
                  hackathonId: value === "general" ? "" : value
                })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="اختر هاكاثون أو اتركه فارغاً للمشرف العام" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">مشرف عام (بدون هاكاثون محدد)</SelectItem>
                  {hackathons.map((hackathon) => (
                    <SelectItem key={hackathon.id} value={hackathon.id}>
                      {hackathon.title} ({hackathon.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-department" className="text-slate-700 font-medium">القسم (اختياري)</Label>
              <Input
                id="invite-department"
                value={inviteFormData.department}
                onChange={(e) => setInviteFormData({...inviteFormData, department: e.target.value})}
                placeholder="مثال: قسم التقنية، قسم التصميم"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-permissions" className="text-slate-700 font-medium">الصلاحيات (JSON - اختياري)</Label>
              <Textarea
                id="invite-permissions"
                value={inviteFormData.permissions}
                onChange={(e) => setInviteFormData({...inviteFormData, permissions: e.target.value})}
                placeholder='{"canApprove": true, "canReject": true, "canEdit": false}'
                className="border-slate-200 font-mono text-sm"
                rows={3}
              />
              <p className="text-xs text-slate-500">أدخل JSON صالح للصلاحيات أو اتركه فارغاً</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleInviteSupervisor} className="bg-slate-900 hover:bg-slate-800">
              <Send className="w-4 h-4 ml-2" />
              إرسال الدعوة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invitations List Dialog */}
      <Dialog open={isInvitationsDialogOpen} onOpenChange={setIsInvitationsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              دعوات المشرفين ({invitations.length})
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              إدارة جميع دعوات المشرفين المرسلة
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {invitations.length > 0 ? (
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">
                            {invitation.name || invitation.email}
                          </h4>
                          <Badge
                            className={
                              invitation.status === 'pending'
                                ? "bg-yellow-100 text-yellow-700"
                                : invitation.status === 'accepted'
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {invitation.status === 'pending' ? 'معلقة' :
                             invitation.status === 'accepted' ? 'مقبولة' : 'ملغاة'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{invitation.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteInvitation(invitation.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      {invitation.hackathon && (
                        <div>
                          <span className="text-slate-600">الهاكاثون:</span>
                          <span className="text-slate-900 font-medium ml-2">
                            {invitation.hackathon.title}
                          </span>
                        </div>
                      )}
                      {invitation.department && (
                        <div>
                          <span className="text-slate-600">القسم:</span>
                          <span className="text-slate-900 font-medium ml-2">
                            {invitation.department}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-600">تاريخ الإرسال:</span>
                        <span className="text-slate-900 font-medium ml-2">
                          {new Date(invitation.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>

                    {invitation.status === 'pending' && (
                      <div className="flex items-center gap-2 bg-slate-100 p-2 rounded border border-slate-200">
                        <code className="text-xs flex-1 overflow-x-auto">
                          {`${window.location.origin}/supervisor/accept-invitation?token=${invitation.token}`}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyInvitationUrl(invitation.token)}
                          className="shrink-0"
                        >
                          {copiedUrl === invitation.token ? (
                            <span className="text-green-600 text-xs">تم النسخ ✓</span>
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">لا توجد دعوات مرسلة</p>
                <Button
                  onClick={() => {
                    setIsInvitationsDialogOpen(false)
                    setIsInviteDialogOpen(true)
                  }}
                  className="mt-4 bg-slate-900 hover:bg-slate-800"
                >
                  <Mail className="w-4 h-4 ml-2" />
                  إرسال دعوة جديدة
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvitationsDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

