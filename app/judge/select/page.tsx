"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Lock } from "lucide-react"

interface Team { id: string; team_number: number }

export default function JudgeSelectPage() {
	const router = useRouter()
	const [teams, setTeams] = useState<Team[]>([])
	const [evaluatedIds, setEvaluatedIds] = useState<string[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true)
				const [teamsRes, scoredRes] = await Promise.all([
					fetch("/api/teams", { cache: "no-store" }),
					fetch("/api/judge/my-scores", { cache: "no-store" }),
				])
				if (!teamsRes.ok) throw new Error("فشل في جلب الفرق")
				const teamsData = await teamsRes.json()
				setTeams(teamsData.teams || [])
				if (scoredRes.ok) {
					const scoredData = await scoredRes.json()
					setEvaluatedIds(scoredData.team_ids || [])
				}
			} catch (e: any) {
				setError(e.message || "خطأ")
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	// دالة لتحديد الفريق التالي المطلوب تقييمه
	const getNextTeamToEvaluate = () => {
		const sortedTeams = teams.sort((a, b) => a.team_number - b.team_number)
		return sortedTeams.find(team => !evaluatedIds.includes(team.id))
	}

	// دالة لتحديد ما إذا كان الفريق قابل للتقييم
	const isTeamAvailable = (team: Team) => {
		const nextTeam = getNextTeamToEvaluate()
		return nextTeam?.id === team.id
	}

	const getTeamStatus = (team: Team) => {
		if (evaluatedIds.includes(team.id)) {
			return "evaluated" // مقيم
		}
		if (isTeamAvailable(team)) {
			return "next" // التالي للتقييم
		}
		return "locked" // مقفل
	}

	if (loading) return <div className="p-6">جاري التحميل...</div>
	if (error) return <div className="p-6 text-red-600">{error}</div>

	const nextTeam = getNextTeamToEvaluate()
	const sortedTeams = teams.sort((a, b) => a.team_number - b.team_number)

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 p-6">
			<div className="max-w-5xl mx-auto">
				<div className="text-center mb-8 pt-8">
					<div className="w-24 h-24 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
						<Users size={48} className="text-white" />
					</div>
					<h1 className="text-4xl font-bold text-[#01645e] mb-2">تقييم الفرق بالترتيب</h1>
					<p className="text-[#8b7632] text-lg">يجب تقييم الفرق بالترتيب من 1 إلى 18</p>
				</div>

				{nextTeam && (
					<div className="glass rounded-3xl shadow-xl p-6 mb-6 bg-gradient-to-r from-[#c3e956]/10 to-[#3ab666]/10 border-2 border-[#c3e956]">
						<div className="text-center">
							<h2 className="text-2xl font-bold text-[#01645e] mb-2">الفريق التالي للتقييم</h2>
							<div className="text-6xl font-bold text-[#3ab666] mb-4">فريق {nextTeam.team_number}</div>
							<button
								onClick={() => router.push(`/judge/evaluate?teamId=${nextTeam.id}&teamNumber=${nextTeam.team_number}`)}
								className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg transition-all duration-300 hover:scale-105"
							>
								ابدأ التقييم
							</button>
						</div>
					</div>
				)}

				{!nextTeam && (
					<div className="glass rounded-3xl shadow-xl p-6 mb-6 bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-300">
						<div className="text-center">
							<h2 className="text-2xl font-bold text-green-700 mb-2">🎉 تم الانتهاء من جميع التقييمات</h2>
							<p className="text-green-600">لقد قمت بتقييم جميع الفرق بنجاح!</p>
						</div>
					</div>
				)}

				<div className="glass rounded-3xl shadow-xl p-8">
					<h3 className="text-xl font-bold text-[#01645e] mb-6 text-center">حالة التقييم للفرق</h3>
					<div className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-3">
						{sortedTeams.map((team) => {
							const status = getTeamStatus(team)
							return (
								<div
									key={team.id}
									className={`aspect-square rounded-xl flex flex-col items-center justify-center text-lg font-bold transition-all border relative ${
										status === "evaluated"
											? "bg-green-100 text-green-700 border-green-300"
											: status === "next"
											? "bg-gradient-to-br from-[#c3e956] to-[#3ab666] text-white border-transparent shadow-lg animate-pulse"
											: "bg-gray-100 text-gray-400 border-gray-200"
									}`}
								>
									{status === "locked" && (
										<Lock size={12} className="absolute top-1 right-1 text-gray-400" />
									)}
									{status === "evaluated" && (
										<span className="absolute top-1 right-1 text-green-600">✓</span>
									)}
									<span className="text-sm">{team.team_number}</span>
								</div>
							)
						})}
					</div>
					
					<div className="mt-6 text-center space-y-2">
						<div className="flex justify-center items-center gap-6 text-sm">
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
								<span className="text-green-700">مقيم ✓</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded"></div>
								<span className="text-[#01645e]">التالي للتقييم</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
								<span className="text-gray-600">مقفل 🔒</span>
							</div>
						</div>
						<p className="text-[#8b7632] text-sm">يجب تقييم الفرق بالترتيب الرقمي</p>
						<p className="text-[#8b7632] text-xs">التقدم: {evaluatedIds.length} من {teams.length} فريق</p>
					</div>
				</div>
			</div>
		</div>
	)
} 