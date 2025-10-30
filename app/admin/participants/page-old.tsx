"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Filter, Check, X, Eye, Mail, Phone, MapPin, Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { ExcelExporter } from '@/lib/excel-export'

interface Participant {
  id: string
  user: {
    name: string
    email: string
    phone: string
    city: string
    nationality: string
  }
  hackathon: {
    title: string
  }
  teamType: string
  teamRole: string
  status: string
  registeredAt: string
  team?: {
    name: string
    teamNumber: number
  }
}

interface Hackathon {
  id: string
  title: string
}

export default function ParticipantsManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [hackathonFilter, setHackathonFilter] = useState('ALL')
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchParticipants()
    fetchHackathons()
  }, [user, router])

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/admin/participants')
      if (response.ok) {
        const data = await response.json()
        setParticipants(data)
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/admin/hackathons')
      if (response.ok) {
        const data = await response.json()
        setHackathons(data)
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    }
  }

  const handleStatusChange = async (participantId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/participants/${participantId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchParticipants() // Refresh the list
      }
    } catch (error) {
      console.error('Error updating participant status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'PENDING': { label: 'في الانتظار', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: 'مقبول', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'REJECTED': { label: 'مرفوض', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    }
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' }
  }

  const exportToExcel = async () => {
    try {
      await ExcelExporter.exportToExcel({
        filename: 'المشاركين.xlsx',
        sheetName: 'المشاركين',
        columns: [
          { key: 'userName', header: 'اسم المشارك', width: 20 },
          { key: 'userEmail', header: 'البريد الإلكتروني', width: 25 },
          { key: 'userPhone', header: 'رقم الهاتف', width: 15 },
          { key: 'userCity', header: 'المدينة', width: 15 },
          { key: 'userNationality', header: 'الجنسية', width: 15 },
          { key: 'hackathonTitle', header: 'الهاكاثون', width: 20 },
          { key: 'teamType', header: 'نوع المشاركة', width: 15 },
          { key: 'teamRole', header: 'الدور في الفريق', width: 15 },
          { key: 'teamName', header: 'اسم الفريق', width: 20 },
          { key: 'status', header: 'الحالة', width: 12 },
          { key: 'registeredAt', header: 'تاريخ التسجيل', width: 18, format: 'date' }
        ],
        data: filteredParticipants.map(participant => ({
          userName: participant.user.name,
          userEmail: participant.user.email,
          userPhone: participant.user.phone,
          userCity: participant.user.city,
          userNationality: participant.user.nationality,
          hackathonTitle: participant.hackathon.title,
          teamType: participant.teamType === 'INDIVIDUAL' ? 'فردي' : 'فريق',
          teamRole: participant.teamRole,
          teamName: participant.team?.name || 'لم يتم التعيين',
          status: getStatusBadge(participant.status).label,
          registeredAt: participant.registeredAt
        }))
      })
    } catch (error) {
      console.error('Error exporting participants:', error)
      alert('حدث خطأ في تصدير البيانات')
    }
  }

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || participant.status === statusFilter
    const matchesHackathon = hackathonFilter === 'ALL' || participant.hackathon.title === hackathonFilter
    
    return matchesSearch && matchesStatus && matchesHackathon
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01645e] mx-auto mb-4"></div>
          <p className="text-[#01645e] text-lg">جاري تحميل المشاركين...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-[#01645e] mb-2">إدارة المشاركين</h1>
            <p className="text-[#8b7632] text-lg">مراجعة وإدارة طلبات المشاركة في الهاكاثونات</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={exportToExcel}
              disabled={filteredParticipants.length === 0}
              className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] hover:from-[#2d8f52] hover:to-[#a8c247]"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير Excel ({filteredParticipants.length})
            </Button>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#01645e]">{participants.length}</div>
              <div className="text-sm text-[#8b7632]">إجمالي المشاركين</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {participants.filter(p => p.status === 'PENDING').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">مقبول</p>
                  <p className="text-2xl font-bold text-green-600">
                    {participants.filter(p => p.status === 'APPROVED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">مرفوض</p>
                  <p className="text-2xl font-bold text-red-600">
                    {participants.filter(p => p.status === 'REJECTED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">مشاركة فردية</p>
                  <p className="text-2xl font-bold text-[#01645e]">
                    {participants.filter(p => p.teamType === 'INDIVIDUAL').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#01645e]/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#01645e]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="البحث بالاسم أو البريد الإلكتروني..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="فلترة حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع الحالات</SelectItem>
                    <SelectItem value="PENDING">في الانتظار</SelectItem>
                    <SelectItem value="APPROVED">مقبول</SelectItem>
                    <SelectItem value="REJECTED">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={hackathonFilter} onValueChange={setHackathonFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="فلترة حسب الهاكاثون" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع الهاكاثونات</SelectItem>
                    {hackathons.map((hackathon) => (
                      <SelectItem key={hackathon.id} value={hackathon.title}>
                        {hackathon.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Participants Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>قائمة المشاركين ({filteredParticipants.length})</CardTitle>
              <CardDescription>
                جميع المشاركين المسجلين في الهاكاثونات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المشارك</TableHead>
                    <TableHead>الهاكاثون</TableHead>
                    <TableHead>نوع المشاركة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{participant.user.name}</div>
                          <div className="text-sm text-gray-500">{participant.user.email}</div>
                          <div className="text-xs text-gray-400">
                            {participant.user.city} • {participant.user.nationality}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{participant.hackathon.title}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {participant.teamType === 'INDIVIDUAL' ? 'فردي' : 'فريق'}
                          </div>
                          {participant.teamRole && (
                            <div className="text-sm text-gray-500">{participant.teamRole}</div>
                          )}
                          {participant.team && (
                            <div className="text-xs text-gray-400">
                              {participant.team.name} (#{participant.team.teamNumber})
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(participant.status).color}>
                          {getStatusBadge(participant.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(participant.registeredAt).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedParticipant(participant)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>تفاصيل المشارك</DialogTitle>
                                <DialogDescription>
                                  معلومات تفصيلية عن المشارك
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedParticipant && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-[#01645e] mb-2">المعلومات الشخصية</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-center">
                                          <Users className="w-4 h-4 ml-2 text-gray-400" />
                                          {selectedParticipant.user.name}
                                        </div>
                                        <div className="flex items-center">
                                          <Mail className="w-4 h-4 ml-2 text-gray-400" />
                                          {selectedParticipant.user.email}
                                        </div>
                                        <div className="flex items-center">
                                          <Phone className="w-4 h-4 ml-2 text-gray-400" />
                                          {selectedParticipant.user.phone}
                                        </div>
                                        <div className="flex items-center">
                                          <MapPin className="w-4 h-4 ml-2 text-gray-400" />
                                          {selectedParticipant.user.city}, {selectedParticipant.user.nationality}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold text-[#01645e] mb-2">معلومات المشاركة</h4>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <strong>الهاكاثون:</strong> {selectedParticipant.hackathon.title}
                                        </div>
                                        <div>
                                          <strong>نوع المشاركة:</strong> {selectedParticipant.teamType === 'INDIVIDUAL' ? 'فردي' : 'فريق'}
                                        </div>
                                        {selectedParticipant.teamRole && (
                                          <div>
                                            <strong>الدور:</strong> {selectedParticipant.teamRole}
                                          </div>
                                        )}
                                        <div className="flex items-center">
                                          <Calendar className="w-4 h-4 ml-2 text-gray-400" />
                                          {new Date(selectedParticipant.registeredAt).toLocaleDateString('ar-SA')}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                                    {selectedParticipant.status === 'PENDING' && (
                                      <>
                                        <Button
                                          onClick={() => handleStatusChange(selectedParticipant.id, 'APPROVED')}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <Check className="w-4 h-4 ml-2" />
                                          قبول
                                        </Button>
                                        <Button
                                          onClick={() => handleStatusChange(selectedParticipant.id, 'REJECTED')}
                                          variant="destructive"
                                        >
                                          <X className="w-4 h-4 ml-2" />
                                          رفض
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {participant.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleStatusChange(participant.id, 'approved')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleStatusChange(participant.id, 'rejected')}
                                size="sm"
                                variant="destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredParticipants.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                  <p className="text-[#8b7632]">لا توجد مشاركين مطابقين للفلاتر المحددة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
