'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Plus, Trash2, Users, Settings, Save, AlertCircle } from 'lucide-react'

interface FormField {
  id: string
  label: string
  type: string
  options?: string[]
}

interface TeamFormationRule {
  id: string
  fieldId: string
  fieldLabel: string
  distribution: 'balanced' | 'one_per_team' | 'priority' | 'ignore'
  minPerTeam?: number
  maxPerTeam?: number
  priority?: number
}

interface TeamFormationSettings {
  teamSize: number
  minTeamSize: number
  maxTeamSize: number
  allowPartialTeams: boolean
  rules: TeamFormationRule[]
}

export default function SupervisorTeamFormationSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const hackathonId = resolvedParams.id
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [settings, setSettings] = useState<TeamFormationSettings>({
    teamSize: 4,
    minTeamSize: 3,
    maxTeamSize: 5,
    allowPartialTeams: true,
    rules: []
  })

  useEffect(() => {
    fetchData()
  }, [hackathonId])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch registration form fields
      const formResponse = await fetch(`/api/admin/hackathons/${hackathonId}/registration-form`, {
        credentials: 'include'
      })
      if (formResponse.ok) {
        const formData = await formResponse.json()
        if (formData.form?.fields) {
          setFormFields(formData.form.fields)
        }
      }

      // Fetch existing team formation settings
      const settingsResponse = await fetch(`/api/admin/hackathons/${hackathonId}/team-formation-settings`, {
        credentials: 'include'
      })
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        if (settingsData.settings) {
          setSettings(settingsData.settings)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addRule = (field: FormField) => {
    const newRule: TeamFormationRule = {
      id: `rule_${Date.now()}`,
      fieldId: field.id,
      fieldLabel: field.label,
      distribution: 'balanced',
      priority: settings.rules.length + 1
    }
    setSettings(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }))
  }

  const updateRule = (ruleId: string, updates: Partial<TeamFormationRule>) => {
    setSettings(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }))
  }

  const removeRule = (ruleId: string) => {
    setSettings(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId)
    }))
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/team-formation-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        credentials: 'include'
      })

      if (response.ok) {
        alert('✅ تم حفظ إعدادات تكوين الفرق بنجاح!')
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في الحفظ')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('حدث خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const availableFields = formFields.filter(
    field => !settings.rules.some(rule => rule.fieldId === field.id) &&
    (field.type === 'select' || field.type === 'radio')
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#01645e] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-[#8b7632]">جاري التحميل...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push(`/supervisor/hackathons/${hackathonId}`)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للهاكاثون
          </Button>
          <h1 className="text-4xl font-bold text-[#01645e] mb-2">
            ⚙️ إعدادات تكوين الفرق التلقائي
          </h1>
          <p className="text-[#8b7632]">
            حدد كيفية توزيع المشاركين على الفرق بناءً على بيانات التسجيل
          </p>
        </div>

        {/* Basic Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-[#01645e]">الإعدادات الأساسية</CardTitle>
            <CardDescription>حدد حجم الفرق والقيود</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>حجم الفريق المثالي</Label>
                <Input
                  type="number"
                  min="2"
                  max="10"
                  value={settings.teamSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, teamSize: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>الحد الأدنى لحجم الفريق</Label>
                <Input
                  type="number"
                  min="1"
                  max={settings.teamSize}
                  value={settings.minTeamSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, minTeamSize: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>الحد الأقصى لحجم الفريق</Label>
                <Input
                  type="number"
                  min={settings.teamSize}
                  max="20"
                  value={settings.maxTeamSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxTeamSize: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowPartialTeams"
                checked={settings.allowPartialTeams}
                onChange={(e) => setSettings(prev => ({ ...prev, allowPartialTeams: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label htmlFor="allowPartialTeams">السماح بفرق غير مكتملة (أقل من الحد الأدنى)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Rules */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-[#01645e]">قواعد التوزيع</CardTitle>
            <CardDescription>حدد كيفية توزيع المشاركين حسب حقول التسجيل</CardDescription>
          </CardHeader>
          <CardContent>
            {settings.rules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لم يتم إضافة قواعد بعد</p>
                <p className="text-sm">اختر حقل من الأسفل لإضافة قاعدة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {settings.rules.map((rule, index) => (
                  <div key={rule.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#01645e]">{index + 1}</Badge>
                        <h4 className="font-semibold text-[#01645e]">{rule.fieldLabel}</h4>
                      </div>
                      <Button
                        onClick={() => removeRule(rule.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>نوع التوزيع</Label>
                        <select
                          value={rule.distribution}
                          onChange={(e) => updateRule(rule.id, { distribution: e.target.value as any })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="balanced">متوازن - توزيع متساوي على جميع الفرق</option>
                          <option value="one_per_team">واحد لكل فريق - عضو واحد من كل خيار</option>
                          <option value="priority">أولوية - حسب الأولوية المحددة</option>
                          <option value="ignore">تجاهل - لا يؤثر على التوزيع</option>
                        </select>
                      </div>
                      
                      {rule.distribution === 'one_per_team' && (
                        <>
                          <div>
                            <Label>الحد الأدنى لكل فريق</Label>
                            <Input
                              type="number"
                              min="0"
                              value={rule.minPerTeam || 0}
                              onChange={(e) => updateRule(rule.id, { minPerTeam: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label>الحد الأقصى لكل فريق</Label>
                            <Input
                              type="number"
                              min="1"
                              value={rule.maxPerTeam || 1}
                              onChange={(e) => updateRule(rule.id, { maxPerTeam: parseInt(e.target.value) })}
                            />
                          </div>
                        </>
                      )}
                      
                      {rule.distribution === 'priority' && (
                        <div>
                          <Label>الأولوية (1 = الأعلى)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={rule.priority || 1}
                            onChange={(e) => updateRule(rule.id, { priority: parseInt(e.target.value) })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Fields */}
        {availableFields.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-[#01645e]">الحقول المتاحة</CardTitle>
              <CardDescription>اضغط على حقل لإضافة قاعدة توزيع له</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableFields.map(field => (
                  <Button
                    key={field.id}
                    onClick={() => addRule(field)}
                    variant="outline"
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    {field.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={() => router.push(`/supervisor/hackathons/${hackathonId}`)}
            variant="outline"
          >
            إلغاء
          </Button>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
