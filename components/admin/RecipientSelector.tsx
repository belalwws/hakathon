'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import {
  Users,
  UserCheck,
  Gavel,
  GraduationCap,
  Search,
  X,
  CheckCircle2,
  Loader2,
  Mail,
  Plus
} from 'lucide-react'

interface Recipient {
  id: string
  name: string
  email: string
  role?: string
  status?: string
}

interface RecipientSelectorProps {
  selectedRecipients: Recipient[]
  onRecipientsChange: (recipients: Recipient[]) => void
}

export function RecipientSelector({ selectedRecipients, onRecipientsChange }: RecipientSelectorProps) {
  const [hackathons, setHackathons] = useState<any[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<string>('')
  const [recipientType, setRecipientType] = useState<'participants' | 'judges' | 'experts' | 'judge-applications' | 'expert-applications' | ''>('')
  const [availableRecipients, setAvailableRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customEmail, setCustomEmail] = useState('')
  const [customName, setCustomName] = useState('')

  // Load hackathons on mount
  useEffect(() => {
    loadHackathons()
  }, [])

  // Load recipients when hackathon and type are selected
  useEffect(() => {
    if (selectedHackathon && recipientType) {
      loadRecipients()
    } else {
      setAvailableRecipients([])
    }
  }, [selectedHackathon, recipientType])

  const loadHackathons = async () => {
    try {
      const response = await fetch('/api/admin/hackathons', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
      }
    } catch (error) {
      console.error('Error loading hackathons:', error)
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الهاكاثونات',
        variant: 'destructive'
      })
    }
  }

  const loadRecipients = async () => {
    setLoading(true)
    try {
      let endpoint = ''

      if (recipientType === 'participants') {
        endpoint = `/api/admin/hackathons/${selectedHackathon}/participants`
      } else if (recipientType === 'judges') {
        endpoint = `/api/admin/judges?hackathonId=${selectedHackathon}`
      } else if (recipientType === 'experts') {
        endpoint = `/api/admin/experts?hackathonId=${selectedHackathon}`
      } else if (recipientType === 'judge-applications') {
        endpoint = `/api/admin/judge-applications?hackathonId=${selectedHackathon}`
      } else if (recipientType === 'expert-applications') {
        endpoint = `/api/admin/expert-applications?hackathonId=${selectedHackathon}`
      }

      const response = await fetch(endpoint, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()

        let recipients: Recipient[] = []

        if (recipientType === 'participants') {
          recipients = (data.participants || []).map((p: any) => ({
            id: p.id,
            name: p.user?.name || p.name || 'غير معروف',
            email: p.user?.email || p.email || '',
            role: p.user?.preferredRole || '',
            status: p.status
          }))
        } else if (recipientType === 'judges') {
          recipients = (data.judges || []).map((j: any) => ({
            id: j.id,
            name: j.user?.name || j.name || 'غير معروف',
            email: j.user?.email || j.email || '',
            role: 'محكم',
            status: j.isActive ? 'active' : 'inactive'
          }))
        } else if (recipientType === 'experts') {
          recipients = (data.experts || []).map((e: any) => ({
            id: e.id,
            name: e.user?.name || e.name || 'غير معروف',
            email: e.user?.email || e.email || '',
            role: 'خبير',
            status: e.isActive ? 'active' : 'inactive'
          }))
        } else if (recipientType === 'judge-applications') {
          recipients = (data.applications || []).map((app: any) => ({
            id: app.id,
            name: app.name || 'غير معروف',
            email: app.email || '',
            role: 'طلب محكم',
            status: app.status
          }))
        } else if (recipientType === 'expert-applications') {
          recipients = (data.applications || []).map((app: any) => ({
            id: app.id,
            name: app.name || 'غير معروف',
            email: app.email || '',
            role: 'طلب خبير',
            status: app.status
          }))
        }

        setAvailableRecipients(recipients.filter(r => r.email))
      }
    } catch (error) {
      console.error('Error loading recipients:', error)
      toast({
        title: 'خطأ',
        description: 'فشل تحميل المستلمين',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleRecipient = (recipient: Recipient) => {
    const isSelected = selectedRecipients.some(r => r.id === recipient.id)
    
    if (isSelected) {
      onRecipientsChange(selectedRecipients.filter(r => r.id !== recipient.id))
    } else {
      onRecipientsChange([...selectedRecipients, recipient])
    }
  }

  const selectAll = () => {
    const filtered = filteredRecipients()
    onRecipientsChange([...selectedRecipients, ...filtered.filter(r => !selectedRecipients.some(s => s.id === r.id))])
  }

  const deselectAll = () => {
    onRecipientsChange([])
  }

  const filteredRecipients = () => {
    if (!searchQuery) return availableRecipients
    
    const query = searchQuery.toLowerCase()
    return availableRecipients.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query)
    )
  }

  const getRecipientTypeIcon = () => {
    switch (recipientType) {
      case 'participants': return <Users className="h-4 w-4" />
      case 'judges': return <Gavel className="h-4 w-4" />
      case 'experts': return <GraduationCap className="h-4 w-4" />
      case 'judge-applications': return <UserCheck className="h-4 w-4" />
      case 'expert-applications': return <UserCheck className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const getRecipientTypeLabel = () => {
    switch (recipientType) {
      case 'participants': return 'المشاركين'
      case 'judges': return 'المحكمين'
      case 'experts': return 'الخبراء'
      case 'judge-applications': return 'طلبات المحكمين'
      case 'expert-applications': return 'طلبات الخبراء'
      default: return 'اختر نوع المستلمين'
    }
  }

  const addCustomEmail = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!customEmail.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال الإيميل',
        variant: 'destructive'
      })
      return
    }

    if (!emailRegex.test(customEmail)) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال إيميل صحيح',
        variant: 'destructive'
      })
      return
    }

    // Check if email already exists
    if (selectedRecipients.some(r => r.email === customEmail)) {
      toast({
        title: 'تنبيه',
        description: 'هذا الإيميل موجود بالفعل في القائمة',
        variant: 'destructive'
      })
      return
    }

    // Add to selected recipients
    const newRecipient: Recipient = {
      id: `custom-${Date.now()}`,
      name: customName.trim() || customEmail,
      email: customEmail,
      role: 'custom'
    }

    onRecipientsChange([...selectedRecipients, newRecipient])

    // Clear inputs
    setCustomEmail('')
    setCustomName('')

    toast({
      title: 'تم الإضافة',
      description: `تم إضافة ${newRecipient.email} إلى القائمة`
    })
  }

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            اختيار المستلمين
          </CardTitle>
          <CardDescription>
            اختر الهاكاثون ونوع المستلمين لعرض قائمة الإيميلات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hackathon Selection */}
          <div className="space-y-2">
            <Label>الهاكاثون</Label>
            <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الهاكاثون" />
              </SelectTrigger>
              <SelectContent>
                {hackathons.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Type Selection */}
          <div className="space-y-2">
            <Label>نوع المستلمين</Label>
            <Select value={recipientType} onValueChange={(value: any) => setRecipientType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المستلمين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participants">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    المشاركين
                  </div>
                </SelectItem>
                <SelectItem value="judges">
                  <div className="flex items-center gap-2">
                    <Gavel className="h-4 w-4" />
                    المحكمين
                  </div>
                </SelectItem>
                <SelectItem value="experts">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    الخبراء
                  </div>
                </SelectItem>
                <SelectItem value="judge-applications">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    طلبات المحكمين (عبر الفورم)
                  </div>
                </SelectItem>
                <SelectItem value="expert-applications">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    طلبات الخبراء (عبر الفورم)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          {availableRecipients.length > 0 && (
            <div className="space-y-2">
              <Label>بحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث بالاسم أو الإيميل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {availableRecipients.length > 0 && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 ml-2" />
                تحديد الكل ({filteredRecipients().length})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={deselectAll}
                className="flex-1"
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء التحديد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Email Input */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-blue-600" />
            إضافة إيميل مخصص
          </CardTitle>
          <CardDescription>
            أضف إيميل يدوياً بدون الحاجة لاختياره من القوائم
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="custom-name" className="text-sm">
              الاسم (اختياري)
            </Label>
            <Input
              id="custom-name"
              placeholder="مثال: أحمد محمد"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomEmail()
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-email" className="text-sm">
              الإيميل <span className="text-red-500">*</span>
            </Label>
            <Input
              id="custom-email"
              type="email"
              placeholder="example@email.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomEmail()
                }
              }}
            />
          </div>

          <Button
            onClick={addCustomEmail}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة إلى القائمة
          </Button>
        </CardContent>
      </Card>

      {/* Available Recipients List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="mr-2 text-gray-600">جاري التحميل...</span>
          </CardContent>
        </Card>
      ) : availableRecipients.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {getRecipientTypeIcon()}
              {getRecipientTypeLabel()} ({filteredRecipients().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {filteredRecipients().map((recipient) => {
                  const isSelected = selectedRecipients.some(r => r.id === recipient.id)
                  
                  return (
                    <div
                      key={recipient.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleRecipient(recipient)}
                    >
                      <Checkbox checked={isSelected} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{recipient.name}</div>
                        <div className="text-sm text-gray-600 truncate">{recipient.email}</div>
                      </div>
                      {recipient.role && (
                        <Badge variant="outline" className="shrink-0">
                          {recipient.role}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : selectedHackathon && recipientType ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Users className="h-12 w-12 mb-2 text-gray-300" />
            <p>لا توجد بيانات متاحة</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Selected Recipients Summary */}
      {selectedRecipients.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              المستلمون المحددون ({selectedRecipients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedRecipients.map((recipient) => (
                <Badge
                  key={recipient.id}
                  variant="secondary"
                  className={`flex items-center gap-1 ${
                    recipient.role === 'custom'
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-white'
                  }`}
                >
                  <Mail className="h-3 w-3" />
                  <span className="max-w-[200px] truncate" title={recipient.email}>
                    {recipient.name !== recipient.email ? (
                      <>
                        {recipient.name}
                        <span className="text-xs text-gray-500 mr-1">({recipient.email})</span>
                      </>
                    ) : (
                      recipient.email
                    )}
                  </span>
                  {recipient.role === 'custom' && (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-blue-600 text-white border-blue-600">
                      مخصص
                    </Badge>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleRecipient(recipient)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

