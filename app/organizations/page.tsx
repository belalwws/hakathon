'use client'

import { useState, useEffect } from 'react'
import { useOrganization } from '@/hooks/use-organization'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function OrganizationsPage() {
  const { organization, isLoading } = useOrganization()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (organization) {
      fetch('/api/organization/usage')
        .then(res => res.json())
        .then(data => setStats(data))
    }
  }, [organization])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">لا توجد مؤسسة</h2>
          <p className="text-gray-600 mb-4">
            يبدو أنك لست عضواً في أي مؤسسة بعد
          </p>
          <Button>إنشاء مؤسسة جديدة</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">إدارة المؤسسة</h1>
          <p className="text-gray-600">معلومات وإعدادات مؤسستك</p>
        </div>

        {/* Organization Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{organization.name}</h2>
              <p className="text-gray-600">/{organization.slug}</p>
            </div>
            <Badge variant={organization.plan === 'free' ? 'secondary' : 'default'}>
              {organization.plan.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: organization.primaryColor + '20' }}
            >
              <div className="text-sm text-gray-600 mb-1">اللون الأساسي</div>
              <div 
                className="w-full h-8 rounded"
                style={{ backgroundColor: organization.primaryColor }}
              />
            </div>
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: organization.secondaryColor + '20' }}
            >
              <div className="text-sm text-gray-600 mb-1">اللون الثانوي</div>
              <div 
                className="w-full h-8 rounded"
                style={{ backgroundColor: organization.secondaryColor }}
              />
            </div>
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: organization.accentColor + '20' }}
            >
              <div className="text-sm text-gray-600 mb-1">لون التمييز</div>
              <div 
                className="w-full h-8 rounded"
                style={{ backgroundColor: organization.accentColor }}
              />
            </div>
          </div>
        </Card>

        {/* Usage Stats */}
        {stats && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">الاستخدام الحالي</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border-r pr-4">
                <div className="text-3xl font-bold text-[#01645e]">
                  {stats.usage.hackathonsUsed}
                </div>
                <div className="text-sm text-gray-600">الهاكاثونات</div>
                <div className="text-xs text-gray-500 mt-1">
                  الحد الأقصى: {stats.limits.hackathons}
                </div>
              </div>
              <div className="border-r pr-4">
                <div className="text-3xl font-bold text-[#3ab666]">
                  {stats.usage.usersUsed}
                </div>
                <div className="text-sm text-gray-600">المستخدمون</div>
                <div className="text-xs text-gray-500 mt-1">
                  الحد الأقصى: {stats.limits.users}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#c3e956]">
                  {stats.usage.participantsUsed}
                </div>
                <div className="text-sm text-gray-600">المشاركون</div>
                <div className="text-xs text-gray-500 mt-1">
                  الحد الأقصى: {stats.limits.participants}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="default">تعديل الإعدادات</Button>
          <Button variant="outline">ترقية الخطة</Button>
          <Button variant="outline">إدارة الأعضاء</Button>
        </div>

        {/* Multi-Tenancy Success Message */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800 font-bold mb-2">
            ✅ Multi-Tenancy مفعّل!
          </div>
          <div className="text-green-700 text-sm">
            مؤسستك معزولة بشكل كامل عن المؤسسات الأخرى. 
            جميع البيانات والهاكاثونات خاصة بمؤسستك فقط.
          </div>
        </div>
      </div>
    </div>
  )
}
