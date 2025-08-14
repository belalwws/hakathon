"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Trophy, Crown, Medal, Award, FileText, Download, Share2, RotateCcw } from "lucide-react"
import ResetScoresButton from "@/components/ResetScoresButton"

interface Winner {
	team_id: string
	team_number: number
	average_score: number
	total_evaluations: number
}

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

export default function AdminDashboardPage() {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [winner, setWinner] = useState<Winner | null>(null)
	const [teamAverages, setTeamAverages] = useState<TeamAverage[]>([])
	const [detailedResults, setDetailedResults] = useState<DetailedTeam[]>([])
	const [totalTeams, setTotalTeams] = useState(0)
	const [totalJudges, setTotalJudges] = useState(0)
	const [showResults, setShowResults] = useState(false)

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true)
				const res = await fetch("/api/admin/results", { cache: "no-store" })
				if (!res.ok) throw new Error("فشل في جلب النتائج")
				const data = await res.json()
				setWinner(data.summary?.winner || null)
				setTeamAverages((data.team_averages || []).sort((a: TeamAverage, b: TeamAverage) => (b.average_score || 0) - (a.average_score || 0)))
				setDetailedResults(data.detailed_results || [])
				setTotalTeams(data.summary?.total_teams || 0)
				setTotalJudges(data.summary?.total_judges || 0)
			} catch (e: any) {
				setError(e?.message || "حدث خطأ")
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

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

	const getRankIcon = (rank: number) => {
		if (rank === 0) return <Crown className="w-8 h-8 text-yellow-500" fill="currentColor" />
		if (rank === 1) return <Medal className="w-8 h-8 text-gray-400" />
		if (rank === 2) return <Award className="w-8 h-8 text-amber-600" />
		return <div className="w-8 h-8 bg-[#01645e] rounded-full flex items-center justify-center text-white font-bold">{rank + 1}</div>
	}

	const getRankBg = (rank: number) => {
		if (rank === 0) return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
		if (rank === 1) return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
		if (rank === 2) return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"
		return "bg-white border-[#c3e956]/30"
	}

	if (loading) return <div className="p-6">جاري التحميل...</div>
	if (error) return <div className="p-6 text-red-600">{error}</div>

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 p-6">
			<div className="mx-auto max-w-6xl">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-3xl font-bold text-[#01645e]">لوحة تحكم الأدمن</h1>
					<div className="flex items-center gap-3">
						<button onClick={() => setShowResults((v) => !v)} className="rounded bg-[#01645e] text-white px-3 py-2 hover:bg-[#014a46]">
							{showResults ? "إخفاء النتائج" : "إظهار النتائج"}
						</button>
						<ResetScoresButton />
					</div>
				</div>

				<motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
					<div className="w-32 h-32 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
						<Trophy size={64} className="text-white" />
					</div>
					<h2 className="text-5xl font-bold text-[#01645e] mb-4">النتائج النهائية</h2>
					<p className="text-xl text-[#8b7632]">إجمالي الفرق: {totalTeams} — إجمالي المحكّمين: {totalJudges}</p>
				</motion.div>

				{showResults && (
				<>
					{winner && (
						<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="glass rounded-3xl shadow-xl p-12 mb-12 bg-gradient-to-r from-[#01645e]/5 to-[#3ab666]/5">
							<div className="text-center">
								<div className="w-24 h-24 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
									<Trophy size={48} className="text-white" />
								</div>
								<h3 className="text-4xl font-bold text-[#01645e] mb-2">فريق #{winner.team_number}</h3>
								<div className="text-7xl font-bold text-[#01645e] mb-4">{(winner.average_score ?? 0).toFixed(2)}</div>
								<p className="text-2xl text-[#8b7632] mb-2">من 5.0</p>
								<div className="bg-green-100 text-green-800 px-6 py-3 rounded-full inline-block font-semibold">الفائز ✓</div>
							</div>
						</motion.div>
					)}

					{teamAverages.length > 0 && (
						<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="glass rounded-3xl shadow-xl p-10 mb-12">
							<h3 className="text-3xl font-bold text-[#01645e] text-center mb-8 flex items-center justify-center gap-3">
								<Crown className="w-8 h-8 text-[#01645e]" />
								ترتيب الفرق
							</h3>
							<div className="space-y-4">
								{teamAverages.map((t, index) => (
									<motion.div key={t.team_id} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }} className={`${getRankBg(index)} border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg`}>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-4">
												{getRankIcon(index)}
												<div>
													<h4 className="text-xl font-bold text-[#01645e]">فريق #{t.team_number}</h4>
													<p className="text-[#8b7632]">عدد التقييمات: {t.total_evaluations}</p>
												</div>
											</div>
											<div className="text-center">
												<div className="text-3xl font-bold text-[#01645e] mb-1">{(t.average_score ?? 0).toFixed(2)}</div>
												<div className="text-sm text-[#8b7632]">من 5.0</div>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</motion.div>
					)}

					{detailedResults.length > 0 && (
						<div className="space-y-6">
							<h3 className="text-xl font-bold">تفاصيل التقييمات</h3>
							{detailedResults.map((team) => (
								<div key={team.team_id} className="rounded-lg border p-4 bg:white/70">
									<div className="mb-2 flex items-center justify-between">
										<h4 className="text-lg font-semibold">فريق #{team.team_number} — متوسط: {(team.average_score ?? 0).toFixed(2)}</h4>
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
					)}
				</>
				)}

				<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }} className="flex flex-wrap justify-center gap-6 mt-10">
					<button onClick={exportToCSV} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
						<span className="flex items-center gap-3">
							<FileText size={24} />
							تحميل CSV
						</span>
					</button>
					<button onClick={exportToJSON} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
						<span className="flex items-center gap-3">
							<Download size={24} />
							تحميل JSON
						</span>
					</button>
					<button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
						<span className="flex items-center gap-3">
							<Share2 size={24} />
							مشاركة النتائج
						</span>
					</button>
					<button onClick={() => window.location.reload()} className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
						<span className="flex items-center gap-3">
							<RotateCcw size={24} />
							تحديث البيانات
						</span>
					</button>
				</motion.div>
			</div>
		</div>
	)
} 