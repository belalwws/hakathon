"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEvaluation } from "@/contexts/evaluation-context"
import { Trophy, Download, RotateCcw, FileText, Star } from "lucide-react"

interface ResultsScreenProps {
  onRestart: () => void
}

export default function ResultsScreen({ onRestart }: ResultsScreenProps) {
  const { getAllResults, currentTeam } = useEvaluation()
  const [showCelebration, setShowCelebration] = useState(true)
  const results = getAllResults()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCelebration(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const exportToExcel = async () => {
    if (results.length === 0) return

    try {
      const XLSX = await import("xlsx")

      const data = results.map((result) => ({
        "اسم الفريق": result.team.name,
        "اسم المشروع": result.team.projectName,
        "بريد المحكم": "current-judge",
        "التوافق الاستراتيجي (20%)": result.evaluation.scores.strategic || 0,
        "ابتكارية الفكرة (25%)": result.evaluation.scores.innovation || 0,
        "قابلية التطبيق (25%)": result.evaluation.scores.feasibility || 0,
        "التأثير المؤسسي (20%)": result.evaluation.scores.impact || 0,
        "مهارات العرض (10%)": result.evaluation.scores.presentation || 0,
        "النتيجة المرجحة": result.evaluation.weightedScore,
        الملاحظات: Object.values(result.evaluation.comments).join("; "),
        التاريخ: new Date(result.evaluation.timestamp).toLocaleString("ar-SA"),
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "النتائج")
      XLSX.writeFile(wb, `نتائج_الهاكاثون_${new Date().toISOString().split("T")[0]}.xlsx`)
    } catch (error) {
      console.error("خطأ في تصدير Excel:", error)
    }
  }

  const exportToCSV = () => {
    if (results.length === 0) return

    const headers = [
      "اسم الفريق",
      "اسم المشروع",
      "بريد المحكم",
      "التوافق الاستراتيجي",
      "ابتكارية الفكرة",
      "قابلية التطبيق",
      "التأثير المؤسسي",
      "مهارات العرض",
      "النتيجة المرجحة",
      "الملاحظات",
      "التاريخ",
    ]

    const csvRows = results.map((result) => {
      const row = [
        result.team.name.replace(/"/g, '""'),
        result.team.projectName.replace(/"/g, '""'),
        "current-judge",
        result.evaluation.scores.strategic || 0,
        result.evaluation.scores.innovation || 0,
        result.evaluation.scores.feasibility || 0,
        result.evaluation.scores.impact || 0,
        result.evaluation.scores.presentation || 0,
        result.evaluation.weightedScore,
        Object.values(result.evaluation.comments).join("; ").replace(/"/g, '""'),
        new Date(result.evaluation.timestamp).toLocaleString("ar-SA"),
      ]

      return row.map((field) => (typeof field === "string" ? `"${field}"` : field)).join(",")
    })

    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n")

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `نتائج_الهاكاثون_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (showCelebration && results.length > 0) {
    const finalScore = results[0].evaluation.weightedScore

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#6C4AB6] via-[#6FA8FF] to-[#8EA7FF] flex items-center justify-center z-50">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <p className="text-2xl text-yellow-300">شكراً لإتمام التقييم</p>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <Star size={20} className="text-yellow-400" fill="currentColor" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F4FB] to-[#E6E9F2] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-[#6C4AB6]/10">
              <Trophy className="w-12 h-12 text-[#6C4AB6]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#1F2A44] mb-2">{"النتائج النهائية"}</h1>
          <p className="text-[#9AA3B2] text-lg">{`تقييم ${currentTeam?.name}`}</p>
        </div>

        {results.length > 0 ? (
          <>
            <Card className="bg-gradient-to-r from-[#6C4AB6]/10 to-[#6FA8FF]/10 backdrop-blur-sm border-[#6C4AB6]/20 shadow-xl mb-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Trophy className="w-16 h-16 text-[#6C4AB6] animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold text-[#1F2A44] mb-2">{currentTeam?.name}</h2>
                  <p className="text-[#9AA3B2] mb-4">{currentTeam?.projectName}</p>
                  <div className="text-6xl font-bold text-[#6C4AB6] mb-4">
                    {results[0].evaluation.weightedScore.toFixed(1)}
                  </div>
                  <p className="text-xl text-[#9AA3B2]">{"من 5.0"}</p>
                  <Badge className="bg-[#6C4AB6]/10 text-[#6C4AB6] border-[#6C4AB6]/20 mt-4">{"تقييم مكتمل"}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-[#E6E9F2] mb-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-[#1F2A44] mb-6 text-center">{"تفصيل التقييم"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: "strategic", title: "التوافق الاستراتيجي", weight: 20, color: "#3B82F6" },
                    { key: "innovation", title: "ابتكارية الفكرة", weight: 25, color: "#F59E0B" },
                    { key: "feasibility", title: "قابلية التطبيق", weight: 25, color: "#10B981" },
                    { key: "impact", title: "التأثير المؤسسي", weight: 20, color: "#8B5CF6" },
                    { key: "presentation", title: "مهارات العرض", weight: 10, color: "#EF4444" },
                  ].map((stage) => (
                    <div key={stage.key} className="bg-[#F6F4FB] rounded-lg p-4">
                      <h4 className="font-semibold text-[#1F2A44] text-sm mb-2">{stage.title}</h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[#9AA3B2] text-xs">{`الوزن: ${stage.weight}%`}</span>
                        <span className="text-lg font-bold" style={{ color: stage.color }}>
                          {`${results[0].evaluation.scores[stage.key] || 0}/5`}
                        </span>
                      </div>
                      <div className="w-full bg-[#E6E9F2] rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${((results[0].evaluation.scores[stage.key] || 0) / 5) * 100}%`,
                            backgroundColor: stage.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={exportToExcel}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4"
              >
                <Download className="w-5 h-5 ml-2" />
                {"تحميل Excel"}
              </Button>

              <Button
                onClick={exportToCSV}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4"
              >
                <FileText className="w-5 h-5 ml-2" />
                {"تحميل CSV"}
              </Button>

              <Button
                onClick={onRestart}
                variant="outline"
                size="lg"
                className="border-[#6C4AB6] text-[#6C4AB6] hover:bg-[#6C4AB6]/10 px-8 py-4 bg-transparent"
              >
                <RotateCcw className="w-5 h-5 ml-2" />
                {"تقييم جديد"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-[#9AA3B2] text-lg mb-4">{"لا توجد نتائج للعرض"}</p>
            <Button
              onClick={onRestart}
              className="bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] hover:from-[#5b3fa0] hover:to-[#5a96e8] text-white"
            >
              {"ابدأ تقييم جديد"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
