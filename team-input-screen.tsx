"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEvaluation } from "@/contexts/evaluation-context"
import { Users, Play, ArrowRight } from "lucide-react"

interface TeamInputScreenProps {
  onStartEvaluation: () => void
}

export default function TeamInputScreen({ onStartEvaluation }: TeamInputScreenProps) {
  const { setCurrentTeam } = useEvaluation()
  const [teamName, setTeamName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const teamData = {
      id: Date.now().toString(),
      name: teamName,
      timestamp: new Date().toISOString(),
    }

    setCurrentTeam(teamData)
    onStartEvaluation()
  }

  const isFormValid = teamName.trim() !== ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F4FB] to-[#E6E9F2] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-[#6C4AB6]/10">
              <Users className="w-12 h-12 text-[#6C4AB6]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#1F2A44] mb-2">{"إدخال بيانات الفريق"}</h1>
          <p className="text-[#9AA3B2] text-lg">{"أدخل اسم الفريق قبل بدء التقييم"}</p>
          <p className="text-[#6C4AB6] text-sm mt-2 font-medium">{"الفرق مرقمة من الفريق الأول إلى الفريق العشرين"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="bg-white/90 backdrop-blur-sm border-[#E6E9F2]">
            <CardHeader>
              <CardTitle className="text-[#1F2A44] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6C4AB6]" />
                {"معلومات الفريق"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-[#1F2A44] font-medium">
                  {"اسم الفريق *"}
                </Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-[#F6F4FB] border-[#E6E9F2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20"
                  placeholder="مثال: الفريق الأول، الفريق الثاني، إلخ..."
                  required
                />
              </div>
              <div className="bg-[#6C4AB6]/5 border border-[#6C4AB6]/20 rounded-lg p-4">
                <p className="text-[#6C4AB6] text-sm font-medium mb-2">{"إرشادات تسمية الفريق:"}</p>
                <ul className="text-[#6C4AB6] text-sm space-y-1">
                  <li>{"• استخدم أرقام الفرق من 1 إلى 20"}</li>
                  <li>{"• مثال: الفريق الأول، الفريق الثاني، الفريق الثالث"}</li>
                  <li>{"• أو يمكنك استخدام اسم مميز لفريقك"}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              type="submit"
              disabled={!isFormValid}
              size="lg"
              className="bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] hover:from-[#5b3fa0] hover:to-[#5a96e8] text-white px-12 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="ml-3 w-6 h-6" />
              {"ابدأ التقييم"}
              <ArrowRight className="mr-3 w-6 h-6" />
            </Button>
            <p className="text-[#9AA3B2] text-sm mt-4">{"أدخل اسم الفريق للمتابعة"}</p>
          </div>
        </form>
      </div>
    </div>
  )
}
