'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { motion } from 'framer-motion'
import { 
  Users, Search, Filter, Check, X, Eye, Mail, Phone, 
  MapPin, Calendar, Download, Building2, BarChart3, Trophy,
  Gavel, Settings, Bell, Menu, ArrowLeft
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Participant {
  id: string
  user: {
    name: string
    email: string
    phone?: string
    city?: string
    nationality?: string
  }
  hackathon: {
    id: string
    title: string
  }
  teamType?: string
  teamRole?: string
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

export default function ParticipantsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [hackathonFilter, setHackathonFilter] = useState('ALL')

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [participantsRes, hackathonsRes] = await Promise.all([
        fetch('/api/admin/participants'),
        fetch('/api/admin/hackathons')
      ])

      if (participantsRes.ok) {
        const data = await participantsRes.json()
        setParticipants(Array.isArray(data) ? data : [])
      }

      if (hackathonsRes.ok) {
        const data = await hackathonsRes.json()
        setHackathons(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (participantId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/participants/${participantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter
    const matchesHackathon = hackathonFilter === 'ALL' || p.hackathon.id === hackathonFilter
    return matchesSearch && matchesStatus && matchesHackathon
  })

  const stats = {
    total: participants.length,
    pending: participants.filter(p => p.status === 'pending').length,
    approved: participants.filter(p => p.status === 'approved').length,
    rejected: participants.filter(p => p.status === 'rejected').length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {language === 'ar' ? 'إدارة المشاركين' : 'Participants Management'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-sm">
                <div className="font-semibold">{user?.name}</div>
                <div className="text-xs text-gray-500">{language === 'ar' ? 'مدير' : 'Admin'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-4 space-y-2">
            <Link href="/admin/dashboard">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </Button>
            </Link>
            <Link href="/admin/hackathons">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <Trophy className="h-4 w-4" />
                {language === 'ar' ? 'الهاكاثونات' : 'Hackathons'}
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600"
            >
              <Users className="h-4 w-4" />
              {language === 'ar' ? 'المشاركين' : 'Participants'}
            </Button>
            <Link href="/admin/judges">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <Gavel className="h-4 w-4" />
                {language === 'ar' ? 'الحكام' : 'Judges'}
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <Settings className="h-4 w-4" />
                {language === 'ar' ? 'الإعدادات' : 'Settings'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
            >
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                      {language === 'ar' ? 'إجمالي' : 'Total'}
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">
                      {language === 'ar' ? 'معلق' : 'Pending'}
                    </p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                      {language === 'ar' ? 'مقبول' : 'Approved'}
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.approved}</p>
                  </div>
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                      {language === 'ar' ? 'مرفوض' : 'Rejected'}
                    </p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.rejected}</p>
                  </div>
                  <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </Card>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={language === 'ar' ? 'بحث بالاسم أو الإيميل...' : 'Search by name or email...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ar' ? 'الحالة' : 'Status'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                      <SelectItem value="pending">{language === 'ar' ? 'معلق' : 'Pending'}</SelectItem>
                      <SelectItem value="approved">{language === 'ar' ? 'مقبول' : 'Approved'}</SelectItem>
                      <SelectItem value="rejected">{language === 'ar' ? 'مرفوض' : 'Rejected'}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={hackathonFilter} onValueChange={setHackathonFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ar' ? 'الهاكاثون' : 'Hackathon'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{language === 'ar' ? 'الكل' : 'All Hackathons'}</SelectItem>
                      {hackathons.map(h => (
                        <SelectItem key={h.id} value={h.id}>{h.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </motion.div>

            {/* Participants Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الإيميل' : 'Email'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الهاكاثون' : 'Hackathon'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {language === 'ar' ? 'لا يوجد مشاركين' : 'No participants found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredParticipants.map(participant => (
                          <TableRow key={participant.id}>
                            <TableCell className="font-medium">{participant.user.name}</TableCell>
                            <TableCell className="text-sm text-gray-600">{participant.user.email}</TableCell>
                            <TableCell className="text-sm">{participant.hackathon.title}</TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  participant.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  participant.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }
                              >
                                {participant.status === 'approved' ? (language === 'ar' ? 'مقبول' : 'Approved') :
                                 participant.status === 'rejected' ? (language === 'ar' ? 'مرفوض' : 'Rejected') :
                                 (language === 'ar' ? 'معلق' : 'Pending')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(participant.registeredAt).toLocaleDateString('ar-SA')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {participant.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 hover:text-green-700"
                                      onClick={() => handleStatusChange(participant.id, 'approved')}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => handleStatusChange(participant.id, 'rejected')}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {/* View details */}}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
