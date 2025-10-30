"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  Award,
  Mail,
  CheckCircle,
  Clock,
  User,
  Search,
  Download,
  Send,
  AlertCircle,
  FileImage,
  Trash2
} from "lucide-react"

interface Judge {
  id: string
  userId: string
  hackathonId: string
  certificateUrl: string | null
  certificateSent: boolean
  certificateSentAt: string | null
  user: {
    name: string
    email: string
  }
  hackathon: {
    title: string
  }
}

interface Supervisor {
  id: string
  userId: string
  hackathonId: string | null
  certificateUrl: string | null
  certificateSent: boolean
  certificateSentAt: string | null
  user: {
    name: string
    email: string
  }
  hackathon: {
    title: string
  } | null
}

export default function CertificatesManagement() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<'judge' | 'supervisor'>('judge')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [judgesRes, supervisorsRes] = await Promise.all([
        fetch('/api/admin/certificates/judges', { credentials: 'include' }),
        fetch('/api/admin/certificates/supervisors', { credentials: 'include' })
      ])

      if (judgesRes.ok) {
        const data = await judgesRes.json()
        setJudges(data.judges || [])
      }

      if (supervisorsRes.ok) {
        const data = await supervisorsRes.json()
        setSupervisors(data.supervisors || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string, type: 'judge' | 'supervisor') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('يرجى اختيار صورة أو ملف PDF')
      return
    }

    setUploading(id)
    try {
      const formData = new FormData()
      formData.append('certificate', file)
      formData.append('id', id)
      formData.append('type', type)

      const response = await fetch('/api/admin/certificates/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ تم رفع الشهادة بنجاح')
        await fetchData()
      } else {
        alert(`❌ خطأ: ${data.error}`)
      }
    } catch (error) {
      alert('حدث خطأ في رفع الشهادة')
    } finally {
      setUploading(null)
    }
  }

  const handleSendCertificate = async (id: string, type: 'judge' | 'supervisor', email: string, name: string) => {
    if (!confirm(`هل تريد إرسال الشهادة إلى ${name} (${email})؟`)) {
      return
    }

    setSending(id)
    try {
      const response = await fetch('/api/admin/certificates/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, type })
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ تم إرسال الشهادة بنجاح')
        await fetchData()
      } else {
        alert(`❌ خطأ: ${data.error}`)
      }
    } catch (error) {
      alert('حدث خطأ في إرسال الشهادة')
    } finally {
      setSending(null)
    }
  }

  const handleDeleteCertificate = async (id: string, type: 'judge' | 'supervisor') => {
    if (!confirm('هل تريد حذف الشهادة؟')) {
      return
    }

    try {
      const response = await fetch('/api/admin/certificates/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, type })
      })

      if (response.ok) {
        alert('✅ تم حذف الشهادة بنجاح')
        await fetchData()
      } else {
        const data = await response.json()
        alert(`❌ خطأ: ${data.error}`)
      }
    } catch (error) {
      alert('حدث خطأ في حذف الشهادة')
    }
  }

  const filterData = (data: any[]) => {
    return data.filter(item =>
      item.user.name.toLowerCase().includes(search.toLowerCase()) ||
      item.user.email.toLowerCase().includes(search.toLowerCase())
    )
  }

  const renderTable = (data: any[], type: 'judge' | 'supervisor') => (
    <div className="space-y-4">
      {data.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد بيانات</h3>
            <p className="text-gray-600">لم يتم العثور على {type === 'judge' ? 'محكمين' : 'مشرفين'}</p>
          </CardContent>
        </Card>
      ) : (
        filterData(data).map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-lg">{item.user.name}</h3>
                    {item.certificateUrl && (
                      <Badge className="bg-green-100 text-green-800">
                        <FileImage className="w-3 h-3 ml-1" />
                        شهادة محملة
                      </Badge>
                    )}
                    {item.certificateSent && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        تم الإرسال
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {item.user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      {item.hackathon?.title || 'مشرف عام'}
                    </div>
                    {item.certificateSentAt && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Clock className="w-3 h-3" />
                        تم الإرسال في: {new Date(item.certificateSentAt).toLocaleDateString('ar-EG')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mr-4">
                  <input
                    type="file"
                    id={`file-${item.id}`}
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, item.id, type)}
                    disabled={uploading === item.id}
                  />

                  {!item.certificateUrl ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById(`file-${item.id}`)?.click()}
                      disabled={uploading === item.id}
                    >
                      <Upload className="w-4 h-4 ml-1" />
                      {uploading === item.id ? 'جاري الرفع...' : 'رفع شهادة'}
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={item.certificateUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 ml-1" />
                          عرض
                        </a>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        onClick={() => handleSendCertificate(item.id, type, item.user.email, item.user.name)}
                        disabled={sending === item.id || !item.certificateUrl}
                      >
                        <Send className="w-4 h-4 ml-1" />
                        {sending === item.id ? 'جاري الإرسال...' : item.certificateSent ? 'إعادة إرسال' : 'إرسال'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => document.getElementById(`file-${item.id}`)?.click()}
                        disabled={uploading === item.id}
                      >
                        <Upload className="w-4 h-4 ml-1" />
                        {uploading === item.id ? 'جاري الرفع...' : 'تغيير'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteCertificate(item.id, type)}
                      >
                        <Trash2 className="w-4 h-4 ml-1" />
                        حذف
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة الشهادات</h1>
        <p className="text-gray-600 mt-2">رفع وإرسال شهادات التقدير للمحكمين والمشرفين</p>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          قم برفع شهادات التقدير للمحكمين والمشرفين وإرسالها عبر البريد الإلكتروني
        </AlertDescription>
      </Alert>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>المحكمين</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{judges.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>المشرفين</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{supervisors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>شهادات محملة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {[...judges, ...supervisors].filter(x => x.certificateUrl).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>شهادات مرسلة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {[...judges, ...supervisors].filter(x => x.certificateSent).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="judges" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="judges" onClick={() => setSelectedType('judge')}>
            المحكمين ({judges.length})
          </TabsTrigger>
          <TabsTrigger value="supervisors" onClick={() => setSelectedType('supervisor')}>
            المشرفين ({supervisors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="judges">
          {renderTable(judges, 'judge')}
        </TabsContent>

        <TabsContent value="supervisors">
          {renderTable(supervisors, 'supervisor')}
        </TabsContent>
      </Tabs>
    </div>
  )
}
