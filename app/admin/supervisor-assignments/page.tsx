"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  Plus, 
  Trash2, 
  Trophy, 
  AlertCircle,
  UserCheck,
  Settings
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
}

interface Hackathon {
  id: string
  title: string
  status: string
  startDate: string
  endDate: string
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
  user: User
  assignments: Assignment[]
}

export default function SupervisorAssignments() {
  const { user } = useAuth()
  const [supervisors, setSupervisors] = useState<SupervisorGroup[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    userId: "",
    hackathonId: "",
    department: "",
    permissions: {}
  })

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch supervisors, hackathons, and users in parallel
      const [supervisorsRes, hackathonsRes, usersRes] = await Promise.all([
        fetch("/api/admin/supervisor-assignments", { credentials: 'include' }),
        fetch("/api/admin/hackathons", { credentials: 'include' }),
        fetch("/api/admin/users?role=supervisor", { credentials: 'include' })
      ])

      if (supervisorsRes.ok) {
        const supervisorsData = await supervisorsRes.json()
        setSupervisors(supervisorsData.supervisors || [])
      }

      if (hackathonsRes.ok) {
        const hackathonsData = await hackathonsRes.json()
        setHackathons(hackathonsData.hackathons || [])
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

    } catch (error) {
      console.error("Error fetching data:", error)
      setError("حدث خطأ في جلب البيانات")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = async () => {
    try {
      const response = await fetch("/api/admin/supervisor-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(newAssignment)
      })

      const data = await response.json()

      if (response.ok) {
        setDialogOpen(false)
        setNewAssignment({ userId: "", hackathonId: "", department: "", permissions: {} })
        fetchData() // Refresh data
      } else {
        setError(data.error || "حدث خطأ في إنشاء التعيين")
      }
    } catch (error) {
      console.error("Error creating assignment:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا التعيين؟")) return

    try {
      const response = await fetch(`/api/admin/supervisor-assignments?id=${assignmentId}`, {
        method: "DELETE",
        credentials: 'include'
      })

      if (response.ok) {
        fetchData() // Refresh data
      } else {
        const data = await response.json()
        setError(data.error || "حدث خطأ في إلغاء التعيين")
      }
    } catch (error) {
      console.error("Error deleting assignment:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'open': { label: 'مفتوح', color: 'bg-green-100 text-green-800' },
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

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            غير مصرح لك بالوصول لهذه الصفحة
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل تعيينات المشرفين...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة تعيينات المشرفين</h1>
          <p className="text-gray-600 mt-2">
            إدارة تعيين المشرفين للهاكاثونات المختلفة
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              تعيين مشرف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تعيين مشرف جديد</DialogTitle>
              <DialogDescription>
                اختر المشرف والهاكاثون المراد تعيينه له
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="user">المشرف</Label>
                <Select value={newAssignment.userId} onValueChange={(value) => 
                  setNewAssignment(prev => ({ ...prev, userId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المشرف" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hackathon">الهاكاثون</Label>
                <Select value={newAssignment.hackathonId} onValueChange={(value) => 
                  setNewAssignment(prev => ({ ...prev, hackathonId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الهاكاثون" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">مشرف عام (جميع الهاكاثونات)</SelectItem>
                    {hackathons.map((hackathon) => (
                      <SelectItem key={hackathon.id} value={hackathon.id}>
                        {hackathon.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">القسم (اختياري)</Label>
                <Input
                  id="department"
                  value={newAssignment.department}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="مثل: التقنية، التسويق، إلخ"
                />
              </div>

              <Button 
                onClick={handleCreateAssignment}
                className="w-full"
                disabled={!newAssignment.userId}
              >
                إنشاء التعيين
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

      {/* Supervisors List */}
      <div className="grid grid-cols-1 gap-6">
        {supervisors.map((supervisorGroup) => (
          <Card key={supervisorGroup.user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>{supervisorGroup.user.name}</CardTitle>
                    <CardDescription>{supervisorGroup.user.email}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">
                  {supervisorGroup.assignments.length} تعيين
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supervisorGroup.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">
                          {assignment.hackathon ? assignment.hackathon.title : "مشرف عام"}
                        </p>
                        {assignment.department && (
                          <p className="text-sm text-gray-500">القسم: {assignment.department}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          تم التعيين: {new Date(assignment.assignedAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment.hackathon && getStatusBadge(assignment.hackathon.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAssignment(assignment.id)}
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
        ))}
      </div>

      {supervisors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد تعيينات مشرفين
            </h3>
            <p className="text-gray-600">
              ابدأ بتعيين المشرفين للهاكاثونات المختلفة
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
