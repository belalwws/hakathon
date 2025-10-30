"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, Users, Filter, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  city: string
  nationality: string
  role: string
}

interface Hackathon {
  id: string
  title: string
  status: string
}

export default function EmailBroadcastPage() {
  const [users, setUsers] = useState<User[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    targetAudience: 'all', // all, city, nationality, role
    cityFilter: '',
    nationalityFilter: '',
    roleFilter: '',
    selectedHackathon: '',
    includeHackathonDetails: true
  })

  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [formData, users])

  const fetchData = async () => {
    try {
      // Fetch all users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
      }

      // Fetch hackathons
      const hackathonsResponse = await fetch('/api/admin/hackathons')
      if (hackathonsResponse.ok) {
        const hackathonsData = await hackathonsResponse.json()
        setHackathons(hackathonsData.hackathons || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (formData.targetAudience === 'city' && formData.cityFilter) {
      filtered = filtered.filter(user => 
        user.city.toLowerCase().includes(formData.cityFilter.toLowerCase())
      )
    }

    if (formData.targetAudience === 'nationality' && formData.nationalityFilter) {
      filtered = filtered.filter(user => 
        user.nationality.toLowerCase().includes(formData.nationalityFilter.toLowerCase())
      )
    }

    if (formData.targetAudience === 'role' && formData.roleFilter) {
      filtered = filtered.filter(user => user.role === formData.roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const sendBroadcastEmail = async () => {
    if (!formData.subject || !formData.message) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (selectedUsers.length === 0) {
      alert('يرجى اختيار مستخدمين لإرسال الإيميل إليهم')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/admin/emails/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          selectedUsers,
          recipientCount: selectedUsers.length
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`تم إرسال ${result.sentCount} إيميل بنجاح!`)
        
        // Reset form
        setFormData({
          subject: '',
          message: '',
          targetAudience: 'all',
          cityFilter: '',
          nationalityFilter: '',
          roleFilter: '',
          selectedHackathon: '',
          includeHackathonDetails: true
        })
        setSelectedUsers([])
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إرسال الإيميلات')
      }
    } catch (error) {
      console.error('Error sending broadcast email:', error)
      alert('حدث خطأ في إرسال الإيميلات')
    } finally {
      setSending(false)
    }
  }

  const getUniqueValues = (field: keyof User) => {
    return [...new Set(users.map(user => user[field]))]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-semibold">جاري تحميل البيانات...</p>
            </div>
          </div>
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
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/admin/emails">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-[#01645e]">إرسال إيميل جماعي</h1>
            <p className="text-[#8b7632] text-lg">إرسال إيميلات للمستخدمين لدعوتهم للمشاركة في الهاكاثونات</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#01645e] flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  تفاصيل الإيميل
                </CardTitle>
                <CardDescription>املأ تفاصيل الإيميل الذي تريد إرساله</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hackathon Selection */}
                <div>
                  <Label htmlFor="hackathon">الهاكاثون (اختياري)</Label>
                  <Select 
                    value={formData.selectedHackathon} 
                    onValueChange={(value) => setFormData({...formData, selectedHackathon: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر هاكاثون للترويج له" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون هاكاثون محدد</SelectItem>
                      {hackathons.map((hackathon) => (
                        <SelectItem key={hackathon.id} value={hackathon.id}>
                          {hackathon.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject">عنوان الإيميل *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="عنوان الإيميل"
                  />
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">نص الرسالة *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="اكتب رسالتك هنا..."
                    rows={6}
                  />
                </div>

                {/* Include Hackathon Details */}
                {formData.selectedHackathon && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id="includeDetails"
                      checked={formData.includeHackathonDetails}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, includeHackathonDetails: !!checked})
                      }
                    />
                    <Label htmlFor="includeDetails">تضمين تفاصيل الهاكاثون ورابط التسجيل</Label>
                  </div>
                )}

                {/* Target Audience */}
                <div>
                  <Label htmlFor="audience">الجمهور المستهدف</Label>
                  <Select 
                    value={formData.targetAudience} 
                    onValueChange={(value) => setFormData({...formData, targetAudience: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستخدمين</SelectItem>
                      <SelectItem value="city">حسب المدينة</SelectItem>
                      <SelectItem value="nationality">حسب الجنسية</SelectItem>
                      <SelectItem value="role">حسب الدور</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filters */}
                {formData.targetAudience === 'city' && (
                  <div>
                    <Label htmlFor="cityFilter">المدينة</Label>
                    <Select 
                      value={formData.cityFilter} 
                      onValueChange={(value) => setFormData({...formData, cityFilter: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {getUniqueValues('city').map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.targetAudience === 'nationality' && (
                  <div>
                    <Label htmlFor="nationalityFilter">الجنسية</Label>
                    <Select 
                      value={formData.nationalityFilter} 
                      onValueChange={(value) => setFormData({...formData, nationalityFilter: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الجنسية" />
                      </SelectTrigger>
                      <SelectContent>
                        {getUniqueValues('nationality').map((nationality) => (
                          <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.targetAudience === 'role' && (
                  <div>
                    <Label htmlFor="roleFilter">الدور</Label>
                    <Select 
                      value={formData.roleFilter} 
                      onValueChange={(value) => setFormData({...formData, roleFilter: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PARTICIPANT">مشارك</SelectItem>
                        <SelectItem value="JUDGE">محكم</SelectItem>
                        <SelectItem value="ADMIN">مدير</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Users Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#01645e] flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  اختيار المستخدمين ({selectedUsers.length}/{filteredUsers.length})
                </CardTitle>
                <CardDescription>اختر المستخدمين الذين تريد إرسال الإيميل إليهم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedUsers.length === filteredUsers.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                    </Button>
                    <span className="text-sm text-[#8b7632]">
                      {filteredUsers.length} مستخدم متاح
                    </span>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleUserSelect(user.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-[#01645e]">{user.name}</div>
                          <div className="text-sm text-[#8b7632]">{user.email}</div>
                          <div className="text-xs text-gray-500">{user.city} - {user.nationality}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      onClick={sendBroadcastEmail}
                      disabled={sending || selectedUsers.length === 0 || !formData.subject || !formData.message}
                      className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]"
                    >
                      <Send className="w-4 h-4 ml-2" />
                      {sending ? 'جاري الإرسال...' : `إرسال إيميل لـ ${selectedUsers.length} مستخدم`}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
