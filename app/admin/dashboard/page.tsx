"use client"

import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Database, Save, RotateCcw, Users as UsersIcon, FileText, Download, Share2 } from "lucide-react"
import ResetScoresButton from "@/components/ResetScoresButton"

interface TeamAverage {
  team_id: string
  team_number: number
  average_score: number
  total_evaluations: number
}

interface DetailedTeam {
  team_id: string
  team_number: number
  average_score: number
  total_evaluations: number
  individual_scores: Array<{
    judge_id: string
    judge_name: string
    judge_email: string
    score: number
    created_at: string
  }>
}

interface SnapshotMeta { id: string; name: string | null; createdAt: string }

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [teamAverages, setTeamAverages] = useState<TeamAverage[]>([])
  const [detailedResults, setDetailedResults] = useState<DetailedTeam[]>([])
  const [snapshots, setSnapshots] = useState<SnapshotMeta[]>([])
  const [savingSnapshot, setSavingSnapshot] = useState(false)
  const [currentSnapshotName, setCurrentSnapshotName] = useState<string | null>(null)

  const [judges, setJudges] = useState<{ id: string; name: string; email: string; is_active: boolean }[]>([])
  const [loadingJudges, setLoadingJudges] = useState(false)

  useEffect(() => {
    loadLiveResults()
    loadSnapshots()
    loadJudges()
  }, [])

  const loadLiveResults = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/results", { cache: "no-store" })
      if (!res.ok) throw new Error("فشل في جلب النتائج")
      const data = await res.json()
      setTeamAverages((data.team_averages || []).sort((a: TeamAverage, b: TeamAverage) => (b.average_score || 0) - (a.average_score || 0)))
      setDetailedResults(data.detailed_results || [])
      setCurrentSnapshotName(null)
    } catch (e: any) {
      setError(e?.message || "حدث خطأ")
    } finally {
      setLoading(false)
    }
  }

  const loadSnapshots = async () => {
    try {
      const res = await fetch("/api/admin/snapshots", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setSnapshots(data.snapshots || [])
    } catch {}
  }

  const saveSnapshot = async () => {
    const name = prompt("اسم اللقطة (اختياري):") || null
    setSavingSnapshot(true)
    try {
      const res = await fetch("/api/admin/snapshots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
      if (!res.ok) throw new Error()
      const data = await res.json()
      await loadSnapshots()
      // عرض اللقطة مباشرة لإظهار نتيجة فورية
      if (data?.snapshot?.id) {
        await viewSnapshot(data.snapshot.id)
      }
      alert("تم حفظ اللقطة بنجاح")
    } catch {
      alert("فشل حفظ اللقطة")
    } finally {
      setSavingSnapshot(false)
    }
  }

  const viewSnapshot = async (id: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/snapshots/${id}`, { cache: "no-store" })
      if (!res.ok) throw new Error("لقطة غير متاحة")
      const data = await res.json()
      const snap = data.snapshot as { name: string | null; data: { team_averages: TeamAverage[]; detailed_results: DetailedTeam[] } }
      setTeamAverages((snap.data.team_averages || []).sort((a: TeamAverage, b: TeamAverage) => (b.average_score || 0) - (a.average_score || 0)))
      setDetailedResults(snap.data.detailed_results || [])
      setCurrentSnapshotName(snap.name || id)
    } catch (e: any) {
      setError(e?.message || "حدث خطأ")
    } finally {
      setLoading(false)
    }
  }

  const loadJudges = async () => {
    try {
      setLoadingJudges(true)
      const res = await fetch("/api/admin/judges", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setJudges(data.judges || [])
    } catch {}
    finally { setLoadingJudges(false) }
  }

  const toggleJudge = async (id: string, next: boolean) => {
    try {
      const res = await fetch(`/api/admin/judges/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: next }) })
      if (!res.ok) throw new Error()
      setJudges((prev) => prev.map((j) => (j.id === id ? { ...j, is_active: next } : j)))
    } catch {
      alert("تعذر تحديث حالة المحكّم")
    }
  }

  const exportToCSV = () => {
    if (!teamAverages.length) return
    const headers = ["رقم الفريق", "المتوسط", "عدد التقييمات"]
    const rows = teamAverages.map((t) => [t.team_number, (t.average_score ?? 0).toFixed(2), t.total_evaluations])
    const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ranking_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToJSON = () => {
    const json = JSON.stringify({ exportedAt: new Date().toISOString(), teams: teamAverages, detailed: detailedResults }, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ranking_${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="p-6">جاري التحميل...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#01645e]">لوحة التحكم</h1>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={saveSnapshot} disabled={savingSnapshot} className="rounded bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"><Save size={18}/> حفظ لقطة</button>
            <button onClick={loadLiveResults} className="rounded bg-gray-600 text-white px-3 py-2 hover:bg-gray-700 flex items-center gap-2"><RotateCcw size={18}/> تحديث</button>
            <ResetScoresButton />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border bg-white/70 p-4 mb-6">
          <h3 className="font-bold text-[#01645e] flex items-center gap-2 mb-3"><Database size={18}/> لقطات النتائج</h3>
          <div className="text-sm text-[#8b7632] mb-2">
            {currentSnapshotName ? (
              <span>تعرض الآن لقطة: <span className="text-[#01645e] font-medium">{currentSnapshotName}</span></span>
            ) : (
              <span>تعرض الآن النتائج المباشرة</span>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto divide-y">
            {snapshots.length === 0 && <div className="text-sm text-[#8b7632]">لا توجد لقطات محفوظة بعد</div>}
            {snapshots.map((s) => (
              <div key={s.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name || s.id}</div>
                  <div className="text-xs text-[#8b7632]">{new Date(s.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => viewSnapshot(s.id)} className="rounded bg-[#01645e] text-white px-2 py-1 hover:bg-[#014a46]">عرض</button>
                  <a href={`/api/admin/snapshots/${s.id}`} className="rounded border px-2 py-1" target="_blank" rel="noreferrer">JSON</a>
                  <button onClick={async () => {
                    if (!confirm("هل تريد حذف هذه اللقطة؟")) return
                    const res = await fetch(`/api/admin/snapshots/${s.id}`, { method: "DELETE" })
                    if (res.ok) {
                      await loadSnapshots()
                      // إذا كنا نعرض هذه اللقطة الآن، نعود للوضع المباشر
                      if (currentSnapshotName && (currentSnapshotName === s.name || currentSnapshotName === s.id)) {
                        await loadLiveResults()
                      }
                    } else {
                      alert("تعذر حذف اللقطة")
                    }
                  }} className="rounded bg-red-600 text-white px-2 py-1 hover:bg-red-700">حذف</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ترتيب الفرق بالكامل */}
        {teamAverages.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border bg-white/70 p-4 mb-6">
            <h3 className="font-bold text-[#01645e] mb-3">ترتيب الفرق ({currentSnapshotName ? "من لقطة محفوظة" : "مباشر"})</h3>
            <div className="space-y-2">
              {teamAverages.map((t, index) => (
                <div key={t.team_id} className="flex items-center justify-between rounded border px-3 py-2 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-center font-bold text-[#01645e]">{index + 1}</div>
                    <div>فريق #{t.team_number} <span className="text-xs text-[#8b7632]">(التقييمات: {t.total_evaluations})</span></div>
                  </div>
                  <div className="text-[#01645e] font-semibold">{(t.average_score ?? 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* تفاصيل التقييمات بالكامل */}
        {detailedResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border bg-white/70 p-4 mb-6">
            <h3 className="font-bold text-[#01645e] mb-3">تفاصيل التقييمات ({currentSnapshotName ? "من لقطة محفوظة" : "مباشر"})</h3>
            <div className="space-y-6">
              {detailedResults.map((team) => (
                <div key={team.team_id} className="rounded border p-4 bg-white">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold">فريق #{team.team_number} — متوسط: {(team.average_score ?? 0).toFixed(2)}</h4>
                    <span className="text-sm text-gray-500">عدد التقييمات: {team.total_evaluations}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-right">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border px-3 py-2">المحكّم</th>
                          <th className="border px-3 py-2">الإيميل</th>
                          <th className="border px-3 py-2">النتيجة</th>
                          <th className="border px-3 py-2">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.individual_scores.map((s, idx) => (
                          <tr key={`${team.team_id}-${idx}`}>
                            <td className="border px-3 py-2">{s.judge_name}</td>
                            <td className="border px-3 py-2">{s.judge_email}</td>
                            <td className="border px-3 py-2">{s.score.toFixed(2)}</td>
                            <td className="border px-3 py-2">{new Date(s.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* إدارة المحكّمين */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border bg-white/70 p-4 mb-6">
          <h3 className="font-bold text-[#01645e] flex items-center gap-2 mb-3"><UsersIcon size={18}/> إدارة المحكّمين</h3>
          {loadingJudges ? (
            <div className="text-sm">جاري التحميل...</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {judges.map((j) => (
                <div key={j.id} className="flex items-center justify-between border rounded px-3 py-2 bg-white">
                  <div>
                    <div className="font-medium">{j.name}</div>
                    <div className="text-xs text-[#8b7632]">{j.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${j.is_active ? "text-green-700" : "text-red-700"}`}>{j.is_active ? "مفعّل" : "معطّل"}</span>
                    <button onClick={() => toggleJudge(j.id, !j.is_active)} className={`rounded px-3 py-1 ${j.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white`}>{j.is_active ? "تعطيل" : "تفعيل"}</button>
                  </div>
                </div>
              ))}
              {judges.length === 0 && <div className="text-sm text-[#8b7632]">لا يوجد محكّمون</div>}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border bg-white/70 p-4">
          <h3 className="font-bold text-[#01645e] mb-3">تصدير النتائج</h3>
          <div className="flex items-center gap-3">
            <button onClick={exportToCSV} className="rounded bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 flex items-center gap-2"><FileText size={18}/> CSV</button>
            <button onClick={exportToJSON} className="rounded bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 flex items-center gap-2"><Download size={18}/> JSON</button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="rounded bg-pink-600 text-white px-3 py-2 hover:bg-pink-700 flex items-center gap-2"><Share2 size={18}/> للأعلى</button>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 