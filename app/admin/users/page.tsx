"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Mail, MapPin, Calendar, UserCheck, ArrowLeft, Shield, Phone, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useModal } from '@/hooks/use-modal'
import { ExcelExporter } from '@/lib/excel-export'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  nationality?: string
  role: 'ADMIN' | 'PARTICIPANT' | 'JUDGE'
  createdAt: string
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { showSuccess, showError, showConfirm, ModalComponents } = useModal()

  useEffect(() => { void fetchUsers() }, [])

  async function fetchUsers() {
    try {
      console.log('🔍 Fetching users...')
      const res = await fetch('/api/admin/users')
      console.log('📡 Response status:', res.status)

      if (res.ok) {
        const data = await res.json()
        console.log('📊 Users data:', data)
        setUsers(data.users ?? [])
      } else {
        console.error('❌ Failed to fetch users:', res.status, res.statusText)
      }
    } catch (error) {
      console.error('💥 Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string, userName: string) => {
    showConfirm(
      `هل أنت متأكد من حذف المستخدم "${userName}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`,
      async () => {
        try {
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
          })

          if (response.ok) {
            showSuccess('تم حذف المستخدم بنجاح')
            fetchUsers() // Refresh the list
          } else {
            showError('فشل في حذف المستخدم')
          }
        } catch (error) {
          console.error('Error deleting user:', error)
          showError('حدث خطأ في حذف المستخدم')
        }
      },
      '🗑️ حذف المستخدم',
      'حذف',
      'إلغاء',
      'danger'
    )
  }

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const exportToExcel = async () => {
    try {
      await ExcelExporter.exportToExcel({
        filename: 'المستخدمين.xlsx',
        sheetName: 'المستخدمين',
        columns: [
          { key: 'name', header: 'الاسم', width: 20 },
          { key: 'email', header: 'البريد الإلكتروني', width: 25 },
          { key: 'phone', header: 'رقم الهاتف', width: 15 },
          { key: 'city', header: 'المدينة', width: 15 },
          { key: 'nationality', header: 'الجنسية', width: 15 },
          { key: 'role', header: 'الدور', width: 12 },
          { key: 'createdAt', header: 'تاريخ التسجيل', width: 18, format: 'date' }
        ],
        data: filtered.map(user => ({
          ...user,
          role: user.role === 'admin' ? 'مدير' : user.role === 'judge' ? 'محكم' : 'مشارك'
        }))
      })
    } catch (error) {
      console.error('Error exporting users:', error)
      alert('حدث خطأ في تصدير البيانات')
    }
  }

  const roleBadge = (role: User['role']) => (
    role === 'ADMIN' ? <Badge className="bg-red-100 text-red-800 border-red-200"><Shield className="w-3 h-3 ml-1" />مدير</Badge> :
    role === 'JUDGE' ? <Badge className="bg-purple-100 text-purple-800 border-purple-200"><UserCheck className="w-3 h-3 ml-1" />محكم</Badge> :
    <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Users className="w-3 h-3 ml-1" />مشارك</Badge>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#01645e] font-semibold">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" className="border-[#01645e] text-[#01645e] hover:bg-[#01645e] hover:text-white">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للداشبورد
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#01645e]">إدارة المستخدمين</h1>
              <p className="text-[#8b7632] mt-1">جميع المستخدمين ({users.length})</p>
            </div>
          </div>

          <Button
            onClick={exportToExcel}
            disabled={filtered.length === 0}
            className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] hover:from-[#2d8f52] hover:to-[#a8c247]"
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel ({filtered.length})
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="البحث بالاسم أو البريد..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
            </div>
          </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>قائمة المستخدمين ({filtered.length})</CardTitle>
              <CardDescription>المستخدمون المسجلون في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filtered.map((u) => (
                  <div key={u.id} className="p-4 border rounded-md flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#01645e]">{u.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Mail className="w-4 h-4" />{u.email}
                      </div>
                      {(u.phone || u.city || u.nationality) && (
                        <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                          {u.phone && (<span className="flex items-center gap-1"><Phone className="w-4 h-4" />{u.phone}</span>)}
                          {(u.city || u.nationality) && (<span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{u.city}{u.city && u.nationality ? ', ' : ''}{u.nationality}</span>)}
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(u.createdAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {roleBadge(u.role)}
                      {u.role !== 'ADMIN' && (
                        <Button
                          onClick={() => deleteUser(u.id, u.name)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-8 text-[#8b7632]">لا توجد نتائج</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal Components */}
      <ModalComponents />
    </div>
  )
}

