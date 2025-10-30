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
  Gavel, Search, Plus, Eye, Mail, Building2, BarChart3, 
  Trophy, Users, Settings, Bell, ArrowLeft, UserCheck, UserX, Clock
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Judge {
  id: string
  userId: string
  hackathonId: string
  isActive: boolean
  assignedAt: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  hackathon: {
    id: string
    title: string
  }
}

interface Hackathon {
  id: string
  title: string
  status: string
}

export default function JudgesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  const [judges, setJudges] = useState<Judge[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [hackathonFilter, setHackathonFilter] = useState('ALL')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    hackathonId: ''
  })

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [judgesRes, hackathonsRes] = await Promise.all([
        fetch('/api/admin/judges'),
        fetch('/api/admin/hackathons')
      ])

      if (judgesRes.ok) {
        const data = await judgesRes.json()
        setJudges(Array.isArray(data) ? data : [])
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

  const handleInviteJudge = async () => {
    if (!inviteForm.email || !inviteForm.hackathonId) {
      alert(language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    try {
      const response = await fetch('/api/admin/judges/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      })

      if (response.ok) {
        alert(language === 'ar' ? 'تم إرسال الدعوة بنجاح' : 'Invitation sent successfully')
        setShowInviteDialog(false)
        setInviteForm({ email: '', name: '', hackathonId: '' })
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {
      console.error('Error inviting judge:', error)
      alert(language === 'ar' ? 'حدث خطأ' : 'An error occurred')
    }
  }

  const handleToggleStatus = async (judgeId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/judges/${judgeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error updating judge status:', error)
    }
  }

  const filteredJudges = judges.filter(j => {
    const matchesSearch = j.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         j.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesHackathon = hackathonFilter === 'ALL' || j.hackathon.id === hackathonFilter
    return matchesSearch && matchesHackathon
  })

  const stats = {
    total: judges.length,
    active: judges.filter(j => j.isActive).length,
    inactive: judges.filter(j => !j.isActive).length,
    hackathons: new Set(judges.map(j => j.hackathonId)).size
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
              {language === 'ar' ? 'إدارة الحكام' : 'Judges Management'}
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
            <Link href="/admin/participants">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <Users className="h-4 w-4" />
                {language === 'ar' ? 'المشاركين' : 'Participants'}
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600"
            >
              <Gavel className="h-4 w-4" />
              {language === 'ar' ? 'الحكام' : 'Judges'}
            </Button>
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
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                      {language === 'ar' ? 'إجمالي' : 'Total'}
                    </p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.total}</p>
                  </div>
                  <Gavel className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                      {language === 'ar' ? 'نشط' : 'Active'}
                    </p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {language === 'ar' ? 'غير نشط' : 'Inactive'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inactive}</p>
                  </div>
                  <UserX className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">
                      {language === 'ar' ? 'هاكاثونات' : 'Hackathons'}
                    </p>
                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.hackathons}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
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
                      placeholder={language === 'ar' ? 'بحث بالاسم أو الإيميل...' : 'Search by name or email...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

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

                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setShowInviteDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'دعوة حكم' : 'Invite Judge'}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Judges Table */}
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
                        <TableHead>{language === 'ar' ? 'تاريخ التعيين' : 'Assigned At'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJudges.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {language === 'ar' ? 'لا يوجد حكام' : 'No judges found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredJudges.map(judge => (
                          <TableRow key={judge.id}>
                            <TableCell className="font-medium">{judge.user.name}</TableCell>
                            <TableCell className="text-sm text-gray-600">{judge.user.email}</TableCell>
                            <TableCell className="text-sm">{judge.hackathon.title}</TableCell>
                            <TableCell>
                              <Badge 
                                className={judge.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                              >
                                {judge.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(judge.assignedAt).toLocaleDateString('ar-SA')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleStatus(judge.id, judge.isActive)}
                                >
                                  {judge.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
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

      {/* Invite Judge Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'دعوة حكم جديد' : 'Invite New Judge'}</DialogTitle>
            <DialogDescription>
              {language === 'ar' ? 'أدخل بيانات الحكم لإرسال دعوة' : 'Enter judge details to send an invitation'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">{language === 'ar' ? 'الاسم' : 'Name'}</Label>
              <Input
                id="name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                placeholder={language === 'ar' ? 'اسم الحكم' : 'Judge name'}
              />
            </div>
            <div>
              <Label htmlFor="email">{language === 'ar' ? 'الإيميل' : 'Email'} *</Label>
              <Input
                id="email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                placeholder="judge@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="hackathon">{language === 'ar' ? 'الهاكاثون' : 'Hackathon'} *</Label>
              <Select value={inviteForm.hackathonId} onValueChange={(value) => setInviteForm({...inviteForm, hackathonId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر الهاكاثون' : 'Select hackathon'} />
                </SelectTrigger>
                <SelectContent>
                  {hackathons.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleInviteJudge}>
              <Mail className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إرسال الدعوة' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
