"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, User, Database, Key, AlertTriangle } from "lucide-react"

export default function UserDebugPage() {
  const [debugInfo, setDebugInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchDebugInfo = async () => {
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/debug/check-user")
      const data = await response.json()

      if (response.ok) {
        setDebugInfo(data)
      } else {
        setError(data.error || "حدث خطأ في جلب معلومات المستخدم")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري فحص معلومات المستخدم...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={fetchDebugInfo} className="w-full mt-4">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">🔍 فحص معلومات المستخدم</h1>
          <Button onClick={fetchDebugInfo} variant="outline">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>

        {/* Token Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              معلومات Token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <p className="font-medium">{debugInfo?.tokenInfo?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                <p className="font-medium">{debugInfo?.tokenInfo?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الدور في Token</p>
                <Badge variant={debugInfo?.tokenInfo?.role === 'supervisor' ? 'default' : 'destructive'}>
                  {debugInfo?.tokenInfo?.role}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-mono text-sm">{debugInfo?.tokenInfo?.userId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database User */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              معلومات قاعدة البيانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <p className="font-medium">{debugInfo?.databaseUser?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                <p className="font-medium">{debugInfo?.databaseUser?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الدور في قاعدة البيانات</p>
                <Badge variant={debugInfo?.databaseUser?.role === 'supervisor' ? 'default' : 'destructive'}>
                  {debugInfo?.databaseUser?.role}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">نشط</p>
                <Badge variant={debugInfo?.databaseUser?.isActive ? 'default' : 'secondary'}>
                  {debugInfo?.databaseUser?.isActive ? 'نعم' : 'لا'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">البريد مؤكد</p>
                <Badge variant={debugInfo?.databaseUser?.emailVerified ? 'default' : 'secondary'}>
                  {debugInfo?.databaseUser?.emailVerified ? 'نعم' : 'لا'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                <p className="text-sm">{new Date(debugInfo?.databaseUser?.createdAt).toLocaleString('ar-SA')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              السجلات المرتبطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>سجل مشرف</span>
                <Badge variant={debugInfo?.relatedRecords?.hasSupervisor ? 'default' : 'destructive'}>
                  {debugInfo?.relatedRecords?.hasSupervisor ? 'موجود' : 'غير موجود'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>سجل مشارك</span>
                <Badge variant={debugInfo?.relatedRecords?.hasParticipant ? 'destructive' : 'default'}>
                  {debugInfo?.relatedRecords?.hasParticipant ? 'موجود (مشكلة!)' : 'غير موجود'}
                </Badge>
              </div>
              
              {debugInfo?.relatedRecords?.supervisorDetails && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-800">تفاصيل سجل المشرف:</p>
                  <p className="text-sm">القسم: {debugInfo.relatedRecords.supervisorDetails.department || 'غير محدد'}</p>
                  <p className="text-sm">نشط: {debugInfo.relatedRecords.supervisorDetails.isActive ? 'نعم' : 'لا'}</p>
                </div>
              )}
              
              {debugInfo?.relatedRecords?.participantDetails && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="font-medium text-red-800">تفاصيل سجل المشارك (يجب حذفه!):</p>
                  <p className="text-sm">نشط: {debugInfo.relatedRecords.participantDetails.isActive ? 'نعم' : 'لا'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mismatch Analysis */}
        {debugInfo?.mismatch && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                تحليل المشاكل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Token مختلف عن قاعدة البيانات</span>
                  <Badge variant={debugInfo.mismatch.tokenVsDatabase ? 'destructive' : 'default'}>
                    {debugInfo.mismatch.tokenVsDatabase ? 'نعم - مشكلة!' : 'لا'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>يجب أن يكون مشرف</span>
                  <Badge variant={debugInfo.mismatch.shouldBeSupervisor ? 'default' : 'secondary'}>
                    {debugInfo.mismatch.shouldBeSupervisor ? 'نعم' : 'لا'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>السجلات صحيحة</span>
                  <Badge variant={debugInfo.mismatch.hasCorrectRecords ? 'default' : 'destructive'}>
                    {debugInfo.mismatch.hasCorrectRecords ? 'نعم' : 'لا - مشكلة!'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invitations */}
        {debugInfo?.invitations?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>دعوات المشرف المقبولة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {debugInfo.invitations.map((inv, index) => (
                  <div key={inv.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>دعوة {index + 1}</span>
                    <div className="text-sm text-gray-600">
                      قُبلت في: {new Date(inv.acceptedAt).toLocaleString('ar-SA')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
