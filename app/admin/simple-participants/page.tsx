"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Users, 
  Mail, 
  Key, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Send
} from 'lucide-react'

interface SimpleParticipant {
  id: string
  user: {
    id: string
    name: string
    email: string
    phone: string
    city: string
    hasPassword: boolean
  }
  hackathon: {
    id: string
    title: string
  }
  teamRole: string
  teamName?: string
  projectTitle?: string
  status: 'pending' | 'approved' | 'rejected'
  registeredAt: string
  additionalInfo?: {
    registrationType: string
    experience?: string
    motivation?: string
  }
}

export default function SimpleParticipantsPage() {
  const [participants, setParticipants] = useState<SimpleParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sendingPasswords, setSendingPasswords] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSimpleParticipants()
  }, [])

  const fetchSimpleParticipants = async () => {
    try {
      const response = await fetch('/api/admin/simple-participants')
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants)
      }
    } catch (error) {
      console.error('Error fetching simple participants:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendPassword = async (participantId: string, userEmail: string) => {
    setSendingPasswords(prev => new Set(prev).add(participantId))
    
    try {
      const response = await fetch('/api/admin/send-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          participantId,
          email: userEmail
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`تم إرسال كلمة المرور إلى ${userEmail}`)
        // Refresh the list to update hasPassword status
        fetchSimpleParticipants()
      } else {
        const error = await response.json()
        alert(`خطأ في إرسال كلمة المرور: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending password:', error)
      alert('حدث خطأ في إرسال كلمة المرور')
    } finally {
      setSendingPasswords(prev => {
        const newSet = new Set(prev)
        newSet.delete(participantId)
        return newSet
      })
    }
  }

  const updateParticipantStatus = async (participantId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/participants/${participantId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        alert(`تم ${status === 'approved' ? 'قبول' : 'رفض'} المشارك بنجاح`)
        fetchSimpleParticipants()
      } else {
        const error = await response.json()
        alert(`خطأ: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating participant status:', error)
      alert('حدث خطأ في تحديث حالة المشارك')
    }
  }

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.hackathon.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">مقبول</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">مرفوض</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">المشاركون المسجلون بالطريقة المبسطة</h1>
          <p className="text-gray-600">
            إدارة المشاركين الذين سجلوا بدون إنشاء حساب وإرسال كلمات المرور عند الحاجة
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المشاركين</p>
                  <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
                </div>
                <Users className="w-8 h-8 text-[#01645e]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {participants.filter(p => p.status === 'pending').length}
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
                  <p className="text-sm font-medium text-gray-600">مقبولون</p>
                  <p className="text-2xl font-bold text-green-600">
                    {participants.filter(p => p.status === 'approved').length}
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
                  <p className="text-sm font-medium text-gray-600">لديهم كلمة مرور</p>
                  <p className="text-2xl font-bold text-[#01645e]">
                    {participants.filter(p => p.user.hasPassword).length}
                  </p>
                </div>
                <Key className="w-8 h-8 text-[#01645e]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث بالاسم أو البريد الإلكتروني أو الهاكاثون..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                >
                  الكل
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                  size="sm"
                >
                  في الانتظار
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('approved')}
                  size="sm"
                >
                  مقبول
                </Button>
                <Button
                  variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('rejected')}
                  size="sm"
                >
                  مرفوض
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المشاركين ({filteredParticipants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المشارك</TableHead>
                    <TableHead>الهاكاثون</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>كلمة المرور</TableHead>
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
                          <div className="text-sm text-gray-500">{participant.user.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{participant.hackathon.title}</div>
                        {participant.teamName && (
                          <div className="text-sm text-gray-500">فريق: {participant.teamName}</div>
                        )}
                      </TableCell>
                      <TableCell>{participant.teamRole}</TableCell>
                      <TableCell>{getStatusBadge(participant.status)}</TableCell>
                      <TableCell>
                        {participant.user.hasPassword ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Key className="w-3 h-3 mr-1" />
                            موجودة
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            غير موجودة
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(participant.registeredAt).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {participant.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateParticipantStatus(participant.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                قبول
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateParticipantStatus(participant.id, 'rejected')}
                              >
                                رفض
                              </Button>
                            </>
                          )}
                          
                          {!participant.user.hasPassword && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendPassword(participant.id, participant.user.email)}
                              disabled={sendingPasswords.has(participant.id)}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              {sendingPasswords.has(participant.id) ? 'جاري الإرسال...' : 'إرسال كلمة مرور'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredParticipants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                لا توجد مشاركون مطابقون للبحث
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
