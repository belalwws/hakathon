"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, Trophy, BarChart3, Download, RefreshCw } from "lucide-react"

interface TeamResult {
  team_id: string
  team_number: number
  average_score: number
  total_evaluations: number
}

export function AdminDashboard() {
  const { user, logout, getAuthHeaders } = useAuth()
  const [results, setResults] = useState<TeamResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/results", {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (response.ok) {
        setResults(data.results)
      } else {
        alert(data.error || "حدث خطأ في جلب النتائج")
      }
    } catch (error) {
      alert("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const exportResults = () => {
    const csvContent = [
      ["الترتيب", "رقم الفريق", "متوسط النتيجة", "عدد التقييمات"].join(","),
      ...results.map((result, index) =>
        [index + 1, result.team_number, result.average_score?.toFixed(2) || "0.00", result.total_evaluations].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `hackathon_results_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
      default:
        return "bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#01645e] via-[#3ab666] to-[#c3e956]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#3ab666]/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Copy%20of%20%D8%A7%D9%84%D9%87%D9%88%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D8%B4%D8%AA%D8%B1%D9%83%D8%A9%20%D9%84%D9%87%D8%A7%D9%83%D8%A7%D8%AB%D9%88%D9%86%20%D8%A7%D9%84%D8%A7%D8%A8%D8%AA%D9%83%D8%A7%D8%B1%20%D9%81%D9%89%20%D8%A7%D9%84%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AD%D9%83%D9%88%D9%85%D9%8A%D8%A9%20%20_20250811_071941_0000-mhYmT6CBMBAiGfKtW6ODkUAWW0nPfS.png"
              alt="هاكاثون الابتكار في الخدمات الحكومية"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-[#01645e]">لوحة تحكم الإدارة</h1>
              <p className="text-sm text-[#8b7632]">مرحباً، {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchResults}
              disabled={loading}
              variant="outline"
              className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </Button>
            <Button
              onClick={exportResults}
              disabled={results.length === 0}
              variant="outline"
              className="border-[#c3e956] text-[#8b7632] hover:bg-[#c3e956] hover:text-[#8b7632] bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              تصدير
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              className="border-[#01645e] text-[#01645e] hover:bg-[#01645e] hover:text-white bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-3d">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8b7632] mb-1">إجمالي الفرق</p>
                    <p className="text-3xl font-bold text-[#01645e]">20</p>
                  </div>
                  <Trophy className="w-8 h-8 text-[#c3e956]" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-3d">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8b7632] mb-1">الفرق المقيمة</p>
                    <p className="text-3xl font-bold text-[#01645e]">{results.length}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-[#3ab666]" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-3d">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8b7632] mb-1">متوسط التقييمات</p>
                    <p className="text-3xl font-bold text-[#01645e]">
                      {results.length > 0
                        ? (results.reduce((sum, r) => sum + (r.total_evaluations || 0), 0) / results.length).toFixed(1)
                        : "0"}
                    </p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-[#8b7632]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          <Card className="glass-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#01645e]">
                <Trophy className="w-5 h-5" />
                نتائج المسابقة النهائية
              </CardTitle>
              <CardDescription className="text-[#8b7632]">
                ترتيب الفرق حسب متوسط النتائج - النتائج مفاجئة ولا تظهر للمحكمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#01645e]" />
                  <p className="text-[#8b7632]">جاري تحميل النتائج...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-[#c3e956]" />
                  <p className="text-[#8b7632]">لا توجد نتائج متاحة حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div
                      key={result.team_id}
                      className={`p-4 rounded-lg border ${getRankColor(
                        index + 1,
                      )} shadow-lg transform hover:scale-105 transition-all duration-200`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">{getRankIcon(index + 1)}</div>
                          <div>
                            <h3 className="font-bold text-lg">الفريق رقم {result.team_number}</h3>
                            <p className="text-sm opacity-90">عدد التقييمات: {result.total_evaluations}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{result.average_score?.toFixed(2) || "0.00"}</div>
                          <div className="text-sm opacity-90">من 5.00</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
