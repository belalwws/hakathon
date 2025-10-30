'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { motion } from 'framer-motion'
import { 
  Settings, Building2, CreditCard, Users, Palette, Mail, 
  Bell, ArrowLeft, Save, Trophy, Gavel, BarChart3, Upload, Globe
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  createdAt: string
  settings?: {
    primaryColor?: string
    secondaryColor?: string
    logo?: string
    emailNotifications?: boolean
    smsNotifications?: boolean
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#7c3aed',
    logo: '',
    emailNotifications: true,
    smsNotifications: false,
    welcomeMessage: ''
  })

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchOrganization()
  }, [user])

  const fetchOrganization = async () => {
    try {
      const response = await fetch('/api/admin/organization')
      if (response.ok) {
        const data = await response.json()
        setOrganization(data)
        setFormData({
          name: data.name,
          slug: data.slug,
          primaryColor: data.settings?.primaryColor || '#4f46e5',
          secondaryColor: data.settings?.secondaryColor || '#7c3aed',
          logo: data.settings?.logo || '',
          emailNotifications: data.settings?.emailNotifications ?? true,
          smsNotifications: data.settings?.smsNotifications ?? false,
          welcomeMessage: data.settings?.welcomeMessage || ''
        })
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully')
        fetchOrganization()
      } else {
        alert(language === 'ar' ? 'حدث خطأ' : 'An error occurred')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert(language === 'ar' ? 'حدث خطأ' : 'An error occurred')
    } finally {
      setSaving(false)
    }
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
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
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
            <Link href="/admin/judges">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <Gavel className="h-4 w-4" />
                {language === 'ar' ? 'الحكام' : 'Judges'}
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600"
            >
              <Settings className="h-4 w-4" />
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Organization Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{organization?.name}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@{organization?.slug}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white mb-2">
                      {organization?.plan?.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {language === 'ar' ? 'منذ' : 'Since'} {new Date(organization?.createdAt || '').toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Settings Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="general">
                      <Building2 className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'عام' : 'General'}
                    </TabsTrigger>
                    <TabsTrigger value="branding">
                      <Palette className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'الهوية' : 'Branding'}
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                      <Bell className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                    </TabsTrigger>
                    <TabsTrigger value="billing">
                      <CreditCard className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'الاشتراك' : 'Billing'}
                    </TabsTrigger>
                  </TabsList>

                  {/* General Tab */}
                  <TabsContent value="general" className="space-y-6">
                    <div>
                      <Label htmlFor="org-name">{language === 'ar' ? 'اسم المنظمة' : 'Organization Name'}</Label>
                      <Input
                        id="org-name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">{language === 'ar' ? 'المعرّف الفريد' : 'Unique Slug'}</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          placeholder="my-organization"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {language === 'ar' ? 'سيظهر في الرابط' : 'Will appear in URL'}: hackpro.com/{formData.slug}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="welcome-message">{language === 'ar' ? 'رسالة الترحيب' : 'Welcome Message'}</Label>
                      <Textarea
                        id="welcome-message"
                        value={formData.welcomeMessage}
                        onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})}
                        placeholder={language === 'ar' ? 'رسالة ترحيبية للمشاركين...' : 'Welcome message for participants...'}
                        className="mt-2"
                        rows={4}
                      />
                    </div>

                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                    </Button>
                  </TabsContent>

                  {/* Branding Tab */}
                  <TabsContent value="branding" className="space-y-6">
                    <div>
                      <Label htmlFor="logo">{language === 'ar' ? 'الشعار' : 'Logo URL'}</Label>
                      <div className="flex gap-4 items-center mt-2">
                        {formData.logo && (
                          <div className="w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden">
                            <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <Input
                          id="logo"
                          value={formData.logo}
                          onChange={(e) => setFormData({...formData, logo: e.target.value})}
                          placeholder="https://example.com/logo.png"
                          className="flex-1"
                        />
                        <Button variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          {language === 'ar' ? 'رفع' : 'Upload'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primary-color">{language === 'ar' ? 'اللون الأساسي' : 'Primary Color'}</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="primary-color"
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                            className="w-20 h-10"
                          />
                          <Input
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                            placeholder="#4f46e5"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="secondary-color">{language === 'ar' ? 'اللون الثانوي' : 'Secondary Color'}</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                            className="w-20 h-10"
                          />
                          <Input
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                            placeholder="#7c3aed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-600 mb-4">{language === 'ar' ? 'معاينة' : 'Preview'}</p>
                      <div 
                        className="h-40 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`
                        }}
                      ></div>
                    </div>

                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                    </Button>
                  </TabsContent>

                  {/* Notifications Tab */}
                  <TabsContent value="notifications" className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4 text-indigo-600" />
                          <Label className="text-base font-semibold">{language === 'ar' ? 'إشعارات البريد' : 'Email Notifications'}</Label>
                        </div>
                        <p className="text-sm text-gray-600">
                          {language === 'ar' ? 'استقبل إشعارات عبر البريد الإلكتروني' : 'Receive notifications via email'}
                        </p>
                      </div>
                      <Switch
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => setFormData({...formData, emailNotifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Bell className="h-4 w-4 text-indigo-600" />
                          <Label className="text-base font-semibold">{language === 'ar' ? 'إشعارات SMS' : 'SMS Notifications'}</Label>
                        </div>
                        <p className="text-sm text-gray-600">
                          {language === 'ar' ? 'استقبل إشعارات عبر الرسائل النصية' : 'Receive notifications via SMS'}
                        </p>
                      </div>
                      <Switch
                        checked={formData.smsNotifications}
                        onCheckedChange={(checked) => setFormData({...formData, smsNotifications: checked})}
                      />
                    </div>

                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                    </Button>
                  </TabsContent>

                  {/* Billing Tab */}
                  <TabsContent value="billing" className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-lg border border-indigo-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold">{language === 'ar' ? 'الخطة الحالية' : 'Current Plan'}</h3>
                          <p className="text-3xl font-bold text-indigo-600 mt-2">{organization?.plan?.toUpperCase()}</p>
                        </div>
                        <CreditCard className="h-12 w-12 text-indigo-600" />
                      </div>
                      <Badge className={organization?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {organization?.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : organization?.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-6 text-center">
                        <h4 className="font-semibold mb-2">{language === 'ar' ? 'مجاني' : 'Free'}</h4>
                        <p className="text-3xl font-bold mb-4">$0</p>
                        <Button variant="outline" className="w-full">
                          {language === 'ar' ? 'الحالية' : 'Current'}
                        </Button>
                      </Card>

                      <Card className="p-6 text-center border-2 border-indigo-600">
                        <h4 className="font-semibold mb-2">{language === 'ar' ? 'احترافي' : 'Pro'}</h4>
                        <p className="text-3xl font-bold mb-4">$29<span className="text-sm">/شهر</span></p>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                          {language === 'ar' ? 'ترقية' : 'Upgrade'}
                        </Button>
                      </Card>

                      <Card className="p-6 text-center">
                        <h4 className="font-semibold mb-2">{language === 'ar' ? 'مؤسسي' : 'Enterprise'}</h4>
                        <p className="text-3xl font-bold mb-4">{language === 'ar' ? 'مخصص' : 'Custom'}</p>
                        <Button variant="outline" className="w-full">
                          {language === 'ar' ? 'تواصل' : 'Contact'}
                        </Button>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
