"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Eye, 
  Check, 
  X, 
  Clock, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Twitter,
  User,
  Calendar,
  Filter,
  Search,
  Download,
  UserPlus
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminApplication {
  id: string
  hackathonId: string
  name: string
  email: string
  phone?: string
  bio?: string
  experience?: string
  expertise?: string
  linkedin?: string
  twitter?: string
  website?: string
  profileImage?: string
  motivation?: string
  availability?: string
  previousWork?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewNotes?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  reviewedAt?: string
}

interface Hackathon {
  id: string
  title: string
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHackathon, setSelectedHackathon] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<AdminApplication | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [applicationsRes, hackathonsRes] = await Promise.all([
        fetch('/api/admin/apply'),
        fetch('/api/hackathons')
      ])

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json()
        setApplications(applicationsData)
      }

      if (hackathonsRes.ok) {
        const hackathonsData = await hackathonsRes.json()
        setHackathons(hackathonsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (applicationId: string, status: 'approved' | 'rejected') => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/admin-applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNotes: reviewNotes || null,
          rejectionReason: status === 'rejected' ? rejectionReason : null
        })
      })

      if (response.ok) {
        await loadData()
        setSelectedApplication(null)
        setReviewNotes('')
        setRejectionReason('')
      }
    } catch (error) {
      console.error('Error reviewing application:', error)
    } finally {
      setProcessing(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesHackathon = selectedHackathon === 'all' || app.hackathonId === selectedHackathon
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus
    const matchesSearch = searchTerm === '' || 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesHackathon && matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 ml-1" />
          قيد المراجعة
        </Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Check className="w-3 h-3 ml-1" />
          مقبول
        </Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <X className="w-3 h-3 ml-1" />
          مرفوض
        </Badge>
      default:
        return null
    }
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01645e] mx-auto mb-4"></div>
          <p className="text-[#01645e] font-semibold">جاري تحميل الطلبات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#01645e] flex items-center gap-3">
            <UserPlus className="w-8 h-8" />
            طلبات المشرفين
          </h1>
          <p className="text-gray-600 mt-2">إدارة ومراجعة طلبات انضمام المشرفين</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-[#01645e]">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-[#01645e]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قيد المراجعة</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مقبول</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مرفوض</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <X className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الهاكاثون</Label>
              <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الهاكاثون" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الهاكاثونات</SelectItem>
                  {hackathons.map(hackathon => (
                    <SelectItem key={hackathon.id} value={hackathon.id}>
                      {hackathon.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الإجراءات</Label>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 ml-2" />
                تصدير البيانات
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد طلبات</h3>
              <p className="text-gray-500">لم يتم العثور على طلبات تطابق المعايير المحددة</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        {application.profileImage ? (
                          <img
                            src={application.profileImage}
                            alt={application.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#01645e]"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#01645e] to-[#3ab666] flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Application Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-[#01645e]">{application.name}</h3>
                          {getStatusBadge(application.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {application.email}
                          </div>
                          {application.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {application.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(application.createdAt).toLocaleDateString('ar-SA')}
                          </div>
                          {application.experience && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {application.experience}
                            </div>
                          )}
                        </div>

                        {application.bio && (
                          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{application.bio}</p>
                        )}

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                          {application.linkedin && (
                            <a 
                              href={application.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {application.twitter && (
                            <a 
                              href={application.twitter} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-600"
                            >
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                          {application.website && (
                            <a 
                              href={application.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            عرض التفاصيل
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                              {application.profileImage ? (
                                <img
                                  src={application.profileImage}
                                  alt={application.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#01645e] to-[#3ab666] flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                              )}
                              {application.name}
                              {getStatusBadge(application.status)}
                            </DialogTitle>
                            <DialogDescription>
                              تفاصيل طلب الانضمام كمشرف
                            </DialogDescription>
                          </DialogHeader>

                          {selectedApplication && (
                            <div className="space-y-6">
                              <Tabs defaultValue="details" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="details">المعلومات الأساسية</TabsTrigger>
                                  <TabsTrigger value="experience">الخبرة والمهارات</TabsTrigger>
                                  <TabsTrigger value="review">المراجعة</TabsTrigger>
                                </TabsList>

                                <TabsContent value="details" className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>الاسم الكامل</Label>
                                      <p className="text-sm text-gray-700">{selectedApplication.name}</p>
                                    </div>
                                    <div>
                                      <Label>البريد الإلكتروني</Label>
                                      <p className="text-sm text-gray-700">{selectedApplication.email}</p>
                                    </div>
                                    {selectedApplication.phone && (
                                      <div>
                                        <Label>رقم الهاتف</Label>
                                        <p className="text-sm text-gray-700">{selectedApplication.phone}</p>
                                      </div>
                                    )}
                                    <div>
                                      <Label>تاريخ التقديم</Label>
                                      <p className="text-sm text-gray-700">
                                        {new Date(selectedApplication.createdAt).toLocaleDateString('ar-SA')}
                                      </p>
                                    </div>
                                  </div>

                                  {selectedApplication.bio && (
                                    <div>
                                      <Label>النبذة الشخصية</Label>
                                      <p className="text-sm text-gray-700 mt-1">{selectedApplication.bio}</p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedApplication.linkedin && (
                                      <div>
                                        <Label>LinkedIn</Label>
                                        <a 
                                          href={selectedApplication.linkedin}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline block"
                                        >
                                          {selectedApplication.linkedin}
                                        </a>
                                      </div>
                                    )}
                                    {selectedApplication.twitter && (
                                      <div>
                                        <Label>Twitter</Label>
                                        <a 
                                          href={selectedApplication.twitter}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline block"
                                        >
                                          {selectedApplication.twitter}
                                        </a>
                                      </div>
                                    )}
                                    {selectedApplication.website && (
                                      <div>
                                        <Label>الموقع الشخصي</Label>
                                        <a 
                                          href={selectedApplication.website}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline block"
                                        >
                                          {selectedApplication.website}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>

                                <TabsContent value="experience" className="space-y-4">
                                  {selectedApplication.experience && (
                                    <div>
                                      <Label>سنوات الخبرة</Label>
                                      <p className="text-sm text-gray-700 mt-1">{selectedApplication.experience}</p>
                                    </div>
                                  )}

                                  {selectedApplication.expertise && (
                                    <div>
                                      <Label>مجالات الخبرة</Label>
                                      <p className="text-sm text-gray-700 mt-1">{selectedApplication.expertise}</p>
                                    </div>
                                  )}

                                  {selectedApplication.motivation && (
                                    <div>
                                      <Label>دوافع الانضمام</Label>
                                      <p className="text-sm text-gray-700 mt-1">{selectedApplication.motivation}</p>
                                    </div>
                                  )}

                                  {selectedApplication.availability && (
                                    <div>
                                      <Label>مدى التفرغ</Label>
                                      <p className="text-sm text-gray-700 mt-1">{selectedApplication.availability}</p>
                                    </div>
                                  )}

                                  {selectedApplication.previousWork && (
                                    <div>
                                      <Label>أعمال سابقة</Label>
                                      <p className="text-sm text-gray-700 mt-1">{selectedApplication.previousWork}</p>
                                    </div>
                                  )}
                                </TabsContent>

                                <TabsContent value="review" className="space-y-4">
                                  {selectedApplication.status === 'pending' ? (
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="reviewNotes">ملاحظات المراجعة</Label>
                                        <Textarea
                                          id="reviewNotes"
                                          value={reviewNotes}
                                          onChange={(e) => setReviewNotes(e.target.value)}
                                          placeholder="أضف ملاحظاتك حول الطلب..."
                                          rows={3}
                                        />
                                      </div>

                                      <div>
                                        <Label htmlFor="rejectionReason">سبب الرفض (في حالة الرفض)</Label>
                                        <Textarea
                                          id="rejectionReason"
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                          placeholder="اذكر سبب رفض الطلب..."
                                          rows={2}
                                        />
                                      </div>

                                      <div className="flex gap-3">
                                        <Button
                                          onClick={() => handleReview(selectedApplication.id, 'approved')}
                                          disabled={processing}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <Check className="w-4 h-4 ml-1" />
                                          قبول الطلب
                                        </Button>
                                        <Button
                                          onClick={() => handleReview(selectedApplication.id, 'rejected')}
                                          disabled={processing}
                                          variant="destructive"
                                        >
                                          <X className="w-4 h-4 ml-1" />
                                          رفض الطلب
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <div>
                                        <Label>حالة الطلب</Label>
                                        <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                                      </div>

                                      {selectedApplication.reviewNotes && (
                                        <div>
                                          <Label>ملاحظات المراجعة</Label>
                                          <p className="text-sm text-gray-700 mt-1">{selectedApplication.reviewNotes}</p>
                                        </div>
                                      )}

                                      {selectedApplication.rejectionReason && (
                                        <div>
                                          <Label>سبب الرفض</Label>
                                          <p className="text-sm text-red-600 mt-1">{selectedApplication.rejectionReason}</p>
                                        </div>
                                      )}

                                      {selectedApplication.reviewedAt && (
                                        <div>
                                          <Label>تاريخ المراجعة</Label>
                                          <p className="text-sm text-gray-700 mt-1">
                                            {new Date(selectedApplication.reviewedAt).toLocaleDateString('ar-SA')}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </TabsContent>
                              </Tabs>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleReview(application.id, 'approved')}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReview(application.id, 'rejected')}
                            disabled={processing}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
