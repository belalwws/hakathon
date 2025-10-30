"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  User,
  Settings,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Trash2
} from "lucide-react"

interface Supervisor {
  id: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
    city?: string
    createdAt: string
    isActive: boolean
  }
  hackathon?: {
    id: string
    title: string
  }
  department?: string
  permissions?: any
  isActive: boolean
  assignedAt: string
}

interface SupervisorInvitation {
  id: string
  email: string
  name?: string
  status: "pending" | "accepted" | "expired" | "cancelled"
  expiresAt: string
  createdAt: string
}

export default function AdminSupervisors() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [invitations, setInvitations] = useState<SupervisorInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: "",
    name: "",
    hackathonId: "",
    department: ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fixing, setFixing] = useState(false)

  useEffect(() => {
    fetchSupervisors()
    fetchInvitations()
  }, [])

  const fetchSupervisors = async () => {
    try {
      const response = await fetch("/api/admin/supervisors")
      const data = await response.json()

      if (response.ok) {
        setSupervisors(data.supervisors || [])
        console.log('✅ Loaded supervisors:', data.supervisors?.length || 0)
      } else {
        console.error("Error fetching supervisors:", data.error)
        setError(data.error || "حدث خطأ في جلب المشرفين")
      }
    } catch (error) {
      console.error("Error fetching supervisors:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/supervisor/invite")
      const data = await response.json()
      
      if (response.ok) {
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error("Error fetching invitations:", error)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!inviteData.email || !inviteData.name) {
      setError("البريد الإلكتروني والاسم مطلوبان")
      return
    }

    setInviting(true)

    try {
      const response = await fetch("/api/supervisor/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: inviteData.email,
          name: inviteData.name,
          hackathonId: inviteData.hackathonId || null,
          department: inviteData.department || null,
          permissions: {
            canManageParticipants: true,
            canManageTeams: true,
            canViewReports: true
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("تم إرسال الدعوة بنجاح")
        setInviteData({ email: "", name: "", hackathonId: "", department: "" })
        setInviteDialogOpen(false)
        await fetchInvitations()
      } else {
        setError(data.error || "حدث خطأ في إرسال الدعوة")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setInviting(false)
    }
  }

  const deleteInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`هل أنت متأكد من حذف دعوة ${email}؟`)) {
      return
    }

    try {
      const response = await fetch(`/api/supervisor/invite?id=${invitationId}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("تم حذف الدعوة بنجاح")
        await fetchInvitations()
      } else {
        setError(data.error || "حدث خطأ في حذف الدعوة")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const fixSupervisorRoles = async () => {
    if (!confirm("هل تريد إصلاح أدوار المشرفين؟ هذا سيحول جميع المستخدمين الذين قبلوا دعوات المشرفين إلى دور مشرف.")) {
      return
    }

    setFixing(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/fix-supervisor-role", {
        method: "POST"
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`تم إصلاح ${data.totalProcessed} مستخدم بنجاح`)
        console.log("Fix results:", data.results)
      } else {
        setError(data.error || "حدث خطأ في إصلاح أدوار المشرفين")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setFixing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">مقبول</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">منتهي الصلاحية</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">ملغي</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredSupervisors = supervisors.filter(supervisor => {
    const matchesSearch = supervisor.user.name.toLowerCase().includes(search.toLowerCase()) ||
                         supervisor.user.email.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && supervisor.isActive) ||
                         (statusFilter === "inactive" && !supervisor.isActive)
    
    return matchesSearch && matchesStatus
  })

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
          <h1 className="text-2xl font-bold text-gray-900">إدارة المشرفين</h1>
          <p className="text-gray-600">دعوة وإدارة المشرفين في النظام</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fixSupervisorRoles}
            disabled={fixing}
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            <Settings className="w-4 h-4 ml-2" />
            {fixing ? "جاري الإصلاح..." : "إصلاح أدوار المشرفين"}
          </Button>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                دعوة مشرف جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>دعوة مشرف جديد</DialogTitle>
                <DialogDescription>
                  أرسل دعوة للانضمام كمشرف في النظام
                </DialogDescription>
              </DialogHeader>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleInvite} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">الاسم *</Label>
                    <Input
                      id="name"
                      value={inviteData.name}
                      onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="department">القسم</Label>
                  <Input
                    id="department"
                    value={inviteData.department}
                    onChange={(e) => setInviteData({...inviteData, department: e.target.value})}
                    placeholder="مثل: التقنية، التصميم، التسويق..."
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={inviting}>
                    {inviting ? "جاري الإرسال..." : "إرسال الدعوة"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المشرفين</p>
                <p className="text-2xl font-bold text-blue-600">{supervisors.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">نشط</p>
                <p className="text-2xl font-bold text-green-600">
                  {supervisors.filter(s => s.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">دعوات معلقة</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {invitations.filter(i => i.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">غير نشط</p>
                <p className="text-2xl font-bold text-red-600">
                  {supervisors.filter(s => !s.isActive).length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.filter(i => i.status === "pending").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الدعوات المعلقة</CardTitle>
            <CardDescription>
              الدعوات التي تم إرسالها ولم يتم قبولها بعد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.filter(i => i.status === "pending").map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invitation.name || invitation.email}</p>
                    <p className="text-sm text-gray-600">{invitation.email}</p>
                    <p className="text-xs text-gray-500">
                      تنتهي في: {new Date(invitation.expiresAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invitation.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteInvitation(invitation.id, invitation.email)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supervisors List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المشرفين</CardTitle>
          <CardDescription>
            {filteredSupervisors.length} مشرف من إجمالي {supervisors.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSupervisors.map((supervisor) => (
              <div key={supervisor.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{supervisor.user.name}</h3>
                        <Badge className={supervisor.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {supervisor.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {supervisor.user.email}
                        </div>
                        {supervisor.user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {supervisor.user.phone}
                          </div>
                        )}
                        {supervisor.user.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {supervisor.user.city}
                          </div>
                        )}
                        {supervisor.department && (
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            {supervisor.department}
                          </div>
                        )}
                      </div>

                      {supervisor.hackathon && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>مكلف بـ:</strong> {supervisor.hackathon.title}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        انضم في: {new Date(supervisor.assignedAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 ml-1" />
                      إدارة
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
