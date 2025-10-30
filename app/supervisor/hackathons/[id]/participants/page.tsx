"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  User,
  ArrowRight,
  AlertCircle,
  Eye
} from "lucide-react"

interface Participant {
  id: string
  status: "pending" | "approved" | "rejected"
  registeredAt: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
    city?: string
    skills?: string
  }
  team?: {
    id: string
    name: string
    teamNumber: number
  }
}

export default function SupervisorHackathonParticipants({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const hackathonId = resolvedParams.id
  const router = useRouter()

  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState<"approved" | "rejected">("approved")

  useEffect(() => {
    fetchParticipants()
  }, [hackathonId, statusFilter, search])

  const fetchParticipants = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        hackathonId: hackathonId,
        status: statusFilter,
        search: search
      })

      const response = await fetch(`/api/supervisor/participants?${params}`, {
        credentials: 'include'
      })

      const data = await response.json()
      if (response.ok) {
        setParticipants(data.participants || [])
      }
    } catch (error) {
      console.error("Error fetching participants:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedParticipant) return

    setUpdating(selectedParticipant.id)
    try {
      const response = await fetch(`/api/supervisor/participants/${selectedParticipant.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          feedback: feedback
        })
      })

      if (response.ok) {
        await fetchParticipants()
        setDialogOpen(false)
        setSelectedParticipant(null)
        setFeedback("")
      } else {
        const data = await response.json()
        alert(data.error || "حدث خطأ")
      }
    } catch (error) {
      alert("حدث خطأ في تحديث الحالة")
    } finally {
      setUpdating(null)
    }
  }

  const openStatusDialog = (participant: Participant, status: "approved" | "rejected") => {
    setSelectedParticipant(participant)
    setNewStatus(status)
    setFeedback("")
    setDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: 'مقبول', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800', icon: XCircle }
    }[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle }

    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 ml-1" />
        {config.label}
      </Badge>
    )
  }

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = search === "" || 
      p.user.name.toLowerCase().includes(search.toLowerCase()) ||
      p.user.email.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push(`/supervisor/hackathons/${hackathonId}`)}
            className="mb-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            رجوع
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المشاركين</h1>
          <p className="text-gray-600 mt-2">قبول أو رفض طلبات المشاركين</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث بالاسم أو البريد الإلكتروني..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="approved">مقبول</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>الإجمالي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {participants.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>قيد الانتظار</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {participants.filter(p => p.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>مقبول</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {participants.filter(p => p.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>مرفوض</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {participants.filter(p => p.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participants List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      ) : filteredParticipants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مشاركين</h3>
            <p className="text-gray-600">لم يتم العثور على مشاركين مطابقين للبحث</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredParticipants.map((participant) => (
            <Card key={participant.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <h3 className="font-semibold text-lg">{participant.user.name}</h3>
                      {getStatusBadge(participant.status)}
                      {participant.team && (
                        <Badge variant="outline" className="text-purple-700 border-purple-200">
                          {participant.team.name}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {participant.user.email}
                      </div>
                      {participant.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {participant.user.phone}
                        </div>
                      )}
                      {participant.user.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {participant.user.city}
                        </div>
                      )}
                    </div>

                    {participant.user.skills && (
                      <div className="mt-3 text-sm">
                        <span className="font-medium">المهارات:</span>{" "}
                        <span className="text-gray-600">{participant.user.skills}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mr-4">
                    {participant.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => openStatusDialog(participant, 'approved')}
                          disabled={updating === participant.id}
                        >
                          <CheckCircle className="w-4 h-4 ml-1" />
                          قبول
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => openStatusDialog(participant, 'rejected')}
                          disabled={updating === participant.id}
                        >
                          <XCircle className="w-4 h-4 ml-1" />
                          رفض
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === 'approved' ? 'قبول المشارك' : 'رفض المشارك'}
            </DialogTitle>
            <DialogDescription>
              {selectedParticipant && `${selectedParticipant.user.name} - ${selectedParticipant.user.email}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ملاحظات (اختياري)</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="أضف أي ملاحظات للمشارك..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={updating !== null}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating !== null}
                className={newStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {updating ? 'جاري التحديث...' : 'تأكيد'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
