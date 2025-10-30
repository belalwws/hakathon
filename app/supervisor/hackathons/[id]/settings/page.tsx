"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Bell,
  Mail,
  Shield,
  Eye,
  Lock,
  Info
} from "lucide-react"

interface Hackathon {
  id: string
  title: string
  status: string
}

interface SupervisorPermissions {
  canApprove: boolean
  canReject: boolean
  canMessage: boolean
  canViewDetails: boolean
  canExportData: boolean
}

export default function SupervisorSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string

  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [permissions, setPermissions] = useState<SupervisorPermissions>({
    canApprove: false,
    canReject: false,
    canMessage: false,
    canViewDetails: false,
    canExportData: false
  })
  const [notifications, setNotifications] = useState({
    emailOnNewParticipant: true,
    emailOnTeamUpdate: true,
    emailOnProjectSubmission: true,
    dailyDigest: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [hackathonId])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/supervisor/hackathons/${hackathonId}/settings`)
      const data = await response.json()

      if (response.ok) {
        setHackathon(data.hackathon)
        if (data.permissions) {
          setPermissions(data.permissions)
        }
        if (data.notifications) {
          setNotifications(data.notifications)
        }
      } else {
        setError(data.error || "حدث خطأ في جلب الإعدادات")
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const response = await fetch(`/api/supervisor/hackathons/${hackathonId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ notifications })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("تم حفظ الإعدادات بنجاح")
      } else {
        setError(data.error || "حدث خطأ في حفظ الإعدادات")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/supervisor/hackathons/${hackathonId}`)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إعدادات الهاكاثون</h1>
            {hackathon && (
              <p className="text-gray-600">{hackathon.title}</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Permissions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>الصلاحيات</CardTitle>
              <CardDescription>الصلاحيات الممنوحة لك في هذا الهاكاثون</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              هذه الصلاحيات يتم تحديدها من قبل مدير النظام ولا يمكن تعديلها من هنا
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">عرض التفاصيل</div>
                  <div className="text-sm text-gray-500">القدرة على عرض تفاصيل المشاركين والفرق</div>
                </div>
              </div>
              <Badge className={permissions.canViewDetails ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {permissions.canViewDetails ? "ممنوح" : "غير ممنوح"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">الموافقة على المشاركين</div>
                  <div className="text-sm text-gray-500">القدرة على قبول طلبات المشاركة</div>
                </div>
              </div>
              <Badge className={permissions.canApprove ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {permissions.canApprove ? "ممنوح" : "غير ممنوح"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">رفض المشاركين</div>
                  <div className="text-sm text-gray-500">القدرة على رفض طلبات المشاركة</div>
                </div>
              </div>
              <Badge className={permissions.canReject ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {permissions.canReject ? "ممنوح" : "غير ممنوح"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">إرسال الرسائل</div>
                  <div className="text-sm text-gray-500">القدرة على إرسال رسائل للمشاركين</div>
                </div>
              </div>
              <Badge className={permissions.canMessage ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {permissions.canMessage ? "ممنوح" : "غير ممنوح"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">تصدير البيانات</div>
                  <div className="text-sm text-gray-500">القدرة على تصدير بيانات المشاركين والفرق</div>
                </div>
              </div>
              <Badge className={permissions.canExportData ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {permissions.canExportData ? "ممنوح" : "غير ممنوح"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>الإشعارات</CardTitle>
              <CardDescription>إدارة إعدادات الإشعارات الخاصة بك</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="newParticipant" className="font-medium">
                  مشارك جديد
                </Label>
                <p className="text-sm text-gray-500">
                  تلقي إشعار عند تسجيل مشارك جديد
                </p>
              </div>
              <Switch
                id="newParticipant"
                checked={notifications.emailOnNewParticipant}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, emailOnNewParticipant: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="teamUpdate" className="font-medium">
                  تحديثات الفرق
                </Label>
                <p className="text-sm text-gray-500">
                  تلقي إشعار عند تحديث بيانات الفريق
                </p>
              </div>
              <Switch
                id="teamUpdate"
                checked={notifications.emailOnTeamUpdate}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, emailOnTeamUpdate: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="projectSubmission" className="font-medium">
                  تسليم المشاريع
                </Label>
                <p className="text-sm text-gray-500">
                  تلقي إشعار عند تسليم فريق لمشروعه
                </p>
              </div>
              <Switch
                id="projectSubmission"
                checked={notifications.emailOnProjectSubmission}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, emailOnProjectSubmission: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="dailyDigest" className="font-medium">
                  ملخص يومي
                </Label>
                <p className="text-sm text-gray-500">
                  تلقي ملخص يومي بالنشاطات والإحصائيات
                </p>
              </div>
              <Switch
                id="dailyDigest"
                checked={notifications.dailyDigest}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, dailyDigest: checked})
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => fetchSettings()}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSaveNotifications}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
