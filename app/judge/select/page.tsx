"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"

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

	if (loading) return <div className="p-6">جاري التحميل...</div>
	if (error) return <div className="p-6 text-red-600">{error}</div>

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 p-6">
			<div className="max-w-5xl mx-auto">
				<div className="text-center mb-8 pt-8">
					<div className="w-24 h-24 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
						<Users size={48} className="text-white" />
					</div>
					<h1 className="text-4xl font-bold text-[#01645e] mb-2">اختيار الفريق</h1>
					<p className="text-[#8b7632] text-lg">اختر الفريق المراد تقييمه</p>
				</div>

				<div className="glass rounded-3xl shadow-xl p-8">
					<div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
						{teams.map((team) => {
							const disabled = evaluatedIds.includes(team.id)
							return (
								<button
									key={team.id}
									disabled={disabled}
									onClick={() => router.push(`/judge/evaluate?teamId=${team.id}&teamNumber=${team.team_number}`)}
									className={`aspect-square rounded-xl flex items-center justify-center text-lg font-bold transition-all border ${
										disabled
											? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
											: "bg-gradient-to-br from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white border-transparent shadow"
										}`}
								>
									{team.team_number}
								</button>
							)
						})}
					</div>
					<div className="text-center mt-4">
						<p className="text-[#8b7632] text-sm">الفِرق التي قيّمتها أنت تصبح معطلة</p>
					</div>
				</div>
			</div>
		</div>
	)
} 