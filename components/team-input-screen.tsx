"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEvaluation } from "@/contexts/evaluation-context"
import { Users, Plus, Trash2, Upload, Play, ArrowRight } from "lucide-react"

interface TeamInputScreenProps {
  onStartEvaluation: () => void
}

interface TeamMember {
  name: string
  role: string
}

export default function TeamInputScreen({ onStartEvaluation }: TeamInputScreenProps) {
  const { setCurrentTeam } = useEvaluation()
  const [teamName, setTeamName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [members, setMembers] = useState<TeamMember[]>([{ name: "", role: "" }])

  const addMember = () => {
    setMembers([...members, { name: "", role: "" }])
  }

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index))
    }
  }

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...members]
    updatedMembers[index][field] = value
    setMembers(updatedMembers)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const teamData = {
      id: Date.now().toString(),
      name: teamName,
      projectName,
      members: members.filter((m) => m.name.trim() !== ""),
      timestamp: new Date().toISOString(),
    }

    setCurrentTeam(teamData)
    onStartEvaluation()
  }

  const isFormValid = teamName.trim() !== "" && projectName.trim() !== "" && members.some((m) => m.name.trim() !== "")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F4FB] to-[#E6E9F2] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-[#6C4AB6]/10">
              <Users className="w-12 h-12 text-[#6C4AB6]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#1F2A44] mb-2">{"إدخال بيانات الفريق"}</h1>
          <p className="text-[#9AA3B2] text-lg">{"أدخل معلومات الفريق والمشروع قبل بدء التقييم"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="bg-white/90 backdrop-blur-sm border-[#E6E9F2]">
            <CardHeader>
              <CardTitle className="text-[#1F2A44] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6C4AB6]" />
                {"معلومات أساسية"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-[#1F2A44] font-medium">
                    {"اسم الفريق *"}
                  </Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-[#F6F4FB] border-[#E6E9F2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20"
                    placeholder="مثال: فريق الابتكار الرقمي"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-[#1F2A44] font-medium">
                    {"اسم المشروع *"}
                  </Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-[#F6F4FB] border-[#E6E9F2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20"
                    placeholder="مثال: منصة الخدمات الذكية"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-[#E6E9F2]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#1F2A44] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#6C4AB6]" />
                  {"أعضاء الفريق"}
                  <Badge className="bg-[#6C4AB6]/10 text-[#6C4AB6] border-[#6C4AB6]/20">
                    {`${members.filter((m) => m.name.trim() !== "").length} عضو`}
                  </Badge>
                </CardTitle>
                <Button
                  type="button"
                  onClick={addMember}
                  variant="outline"
                  size="sm"
                  className="border-[#6C4AB6] text-[#6C4AB6] hover:bg-[#6C4AB6]/10 bg-transparent"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  {"إضافة عضو"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.map((member, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label className="text-[#1F2A44] font-medium text-sm">{`اسم العضو ${index + 1}`}</Label>
                    <Input
                      value={member.name}
                      onChange={(e) => updateMember(index, "name", e.target.value)}
                      className="bg-[#F6F4FB] border-[#E6E9F2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20"
                      placeholder="اسم العضو"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-[#1F2A44] font-medium text-sm">{"التخصص/الدور"}</Label>
                    <Input
                      value={member.role}
                      onChange={(e) => updateMember(index, "role", e.target.value)}
                      className="bg-[#F6F4FB] border-[#E6E9F2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20"
                      placeholder="مثال: مطور تطبيقات"
                    />
                  </div>
                  {members.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeMember(index)}
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="border-t border-[#E6E9F2] pt-4 mt-6">
                <div className="flex items-center justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#6FA8FF] text-[#6FA8FF] hover:bg-[#6FA8FF]/10 bg-transparent"
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    {"رفع ملف CSV (اختياري)"}
                  </Button>
                </div>
                <p className="text-xs text-[#9AA3B2] text-center mt-2">
                  {"يمكنك رفع ملف CSV يحتوي على أسماء وأدوار الأعضاء"}
                </p>
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
            <p className="text-[#9AA3B2] text-sm mt-4">{"تأكد من إدخال جميع البيانات المطلوبة قبل المتابعة"}</p>
          </div>
        </form>
      </div>
    </div>
  )
}
