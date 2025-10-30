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
  Trophy, Search, Plus, Eye, Edit, Trash2, Building2, BarChart3, 
  Users, Gavel, Settings, Bell, ArrowLeft, Calendar, Pin, PinOff,
  Clock, CheckCircle2, XCircle
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  status: 'draft' | 'open' | 'closed' | 'completed'
  isPinned: boolean
  _count?: {
    participants: number
    teams: number
    judges: number
  }
  createdAt: string
}

export default function HackathonsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/hackathons')
      if (response.ok) {
        const data = await response.json()
        setHackathons(Array.isArray(data) ? data : data.hackathons || [])
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    const confirmMsg = language === 'ar' ? `هل تريد حذف "${title}"؟` : `Delete "${title}"?`
    if (!confirm(confirmMsg)) return

    try {
      const response = await fetch(`/api/admin/hackathons/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully')
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting hackathon:', error)
    }
  }

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/admin/hackathons/${id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned })
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const filteredHackathons = hackathons.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: hackathons.length,
    open: hackathons.filter(h => h.status === 'open').length,
    closed: hackathons.filter(h => h.status === 'closed').length,
    draft: hackathons.filter(h => h.status === 'draft').length
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    if (language === 'ar') {
      switch(status) {
        case 'open': return 'مفتوح'
        case 'closed': return 'مغلق'
        case 'completed': return 'مكتمل'
        case 'draft': return 'مسودة'
        default: return status
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1)
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
              {language === 'ar' ? 'إدارة الهاكاثونات' : 'Hackathons Management'}
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
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600"
            >
              <Trophy className="h-4 w-4" />
              {language === 'ar' ? 'الهاكاثونات' : 'Hackathons'}
            </Button>
            <Link href="/admin/participants">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <Users className="h-4 w-4" />
                {language === 'ar' ? 'المشاركين' : 'Participants'}
              </Button>
            </Link>
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
              <Card className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">
                      {language === 'ar' ? 'إجمالي' : 'Total'}
                    </p>
                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.total}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                      {language === 'ar' ? 'مفتوح' : 'Open'}
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.open}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                      {language === 'ar' ? 'مغلق' : 'Closed'}
                    </p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.closed}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {language === 'ar' ? 'مسودة' : 'Draft'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.draft}</p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
              </Card>
            </motion.div>

            {/* Filters & Actions */}
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
                      placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
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
                      <SelectItem value="open">{language === 'ar' ? 'مفتوح' : 'Open'}</SelectItem>
                      <SelectItem value="closed">{language === 'ar' ? 'مغلق' : 'Closed'}</SelectItem>
                      <SelectItem value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</SelectItem>
                      <SelectItem value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => router.push('/admin/hackathons/create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'إضافة هاكاثون' : 'Add Hackathon'}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Hackathons Table */}
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
                        <TableHead>{language === 'ar' ? 'العنوان' : 'Title'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                        <TableHead>{language === 'ar' ? 'المشاركين' : 'Participants'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الفرق' : 'Teams'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHackathons.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {language === 'ar' ? 'لا توجد هاكاثونات' : 'No hackathons found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredHackathons.map(hackathon => (
                          <TableRow key={hackathon.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {hackathon.isPinned && (
                                  <Pin className="h-4 w-4 text-yellow-600" />
                                )}
                                <div>
                                  <div className="font-medium">{hackathon.title}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {hackathon.description}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(hackathon.status)}>
                                {getStatusLabel(hackathon.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Calendar className="h-3 w-3" />
                                {new Date(hackathon.startDate).toLocaleDateString('ar-SA')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span>{hackathon._count?.participants || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span>{hackathon._count?.teams || 0}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleTogglePin(hackathon.id, hackathon.isPinned)}
                                >
                                  {hackathon.isPinned ? 
                                    <PinOff className="h-4 w-4" /> : 
                                    <Pin className="h-4 w-4" />
                                  }
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => router.push(`/admin/hackathons/${hackathon.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => router.push(`/admin/hackathons/${hackathon.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(hackathon.id, hackathon.title)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
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
