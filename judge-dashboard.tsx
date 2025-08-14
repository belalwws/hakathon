"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, Star, Users, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Team {
	id: string
	team_number: number
}

const CRITERIA = [
	{ id: "strategic", name: "الجدوى", weight: 20, description: "مدى قدرة الفكرة على تحقيق قيمة واضحة وعائد ملموس للمؤسسة، مع قابلية استدامتها على المدى الطويل، وتوازن التكلفة مع الفوائد المتوقعة." },
	{ id: "innovation", name: "ابتكارية الفكرة", weight: 25, description: "مدى إبداع الفكرة وجديدتها. هل تقدم الفكرة حلولًا مبتكرة لتحديات أو احتياجات قائمة؟ هل هناك تفكير متجدد يعكس تميز الفكرة ويعزز من فعالية العمليات في المؤسسة؟" },
	{ id: "feasibility", name: "قابلية التطبيق", weight: 25, description: "إمكانية تنفيذ الفكرة باستخدام الموارد المتاحة ضمن المعايير والقيود المحددة. هل يمكن تطبيق الفكرة في الإطار الزمني والمالي المحدد؟ وهل الفكرة قابلة للتنفيذ ضمن البيئات والظروف المتاحة؟" },
	{ id: "impact", name: "التأثير على المؤسسة", weight: 20, description: "يركز هذا المعيار على تأثير الفكرة في تحسين أداء المؤسسة. هل ستسهم الفكرة في تعزيز كفاءة العمل ورفع الإنتاجية داخل المؤسسة؟ وهل سيكون لها تأثير إيجابي على العمليات والنتائج التشغيلية؟" },
	{ id: "presentation", name: "مهارات العرض", weight: 10, description: "يتم تقييم طريقة تقديم الفكرة من قبل الفريق. كيف يعرض الفريق فكرته بشكل احترافي ومقنع؟ هل العرض واضح ومنظم بطريقة تسهل فهم الفكرة من قبل المعنيين في المؤسسة؟" },
]

const EVAL_OVERVIEW: Array<{ name: string; weight: string; color: string }> = [
	{ name: "الجدوى", weight: "20%", color: "#01645e" },
	{ name: "ابتكارية الفكرة", weight: "25%", color: "#3ab666" },
	{ name: "قابلية التطبيق", weight: "25%", color: "#c3e956" },
	{ name: "التأثير على المؤسسة", weight: "20%", color: "#8b7632" },
	{ name: "مهارات العرض", weight: "10%", color: "#01645e" },
]

const EVALUATION_STAGES = [
	{ id: "strategic", title: "الجدوى", weight: 20, color: "#01645e", icon: Star, description: CRITERIA[0].description },
	{ id: "innovation", title: "ابتكارية الفكرة", weight: 25, color: "#3ab666", icon: Star, description: CRITERIA[1].description },
	{ id: "feasibility", title: "قابلية التطبيق", weight: 25, color: "#c3e956", icon: Star, description: CRITERIA[2].description },
	{ id: "impact", title: "التأثير على المؤسسة", weight: 20, color: "#8b7632", icon: Star, description: CRITERIA[3].description },
	{ id: "presentation", title: "مهارات العرض", weight: 10, color: "#01645e", icon: Star, description: CRITERIA[4].description },
]

function StarRating({ rating, onRate, color }: { rating: number; onRate: (n: number) => void; color: string }) {
	const stars = [1, 2, 3, 4, 5]
	return (
		<div className="flex gap-2 justify-center">
			{stars.map((s) => (
				<button key={s} onClick={() => onRate(s)} className="transition-all hover:scale-110">
					<Star size={32} fill={s <= rating ? color : "transparent"} stroke={color} className="cursor-pointer" />
				</button>
			))}
		</div>
	)
}

export function JudgeDashboard() {
	const { user, logout } = useAuth()
	const [teams, setTeams] = useState<Team[]>([])
	const [selectedTeam, setSelectedTeam] = useState<string>("")
	const [ratings, setRatings] = useState<Record<string, number>>({})
	const [comments, setComments] = useState<Record<string, string>>({})
	const [currentStage, setCurrentStage] = useState(0)
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		fetchTeams()
	}, [])

	const fetchTeams = async () => {
		try {
			const response = await fetch("/api/teams")
			const data = await response.json()
			if (response.ok) setTeams(data.teams)
		} catch (error) {
			console.error("Error fetching teams:", error)
		}
	}

	const calculateTotalScore = () => {
		return CRITERIA.reduce((total, c) => total + ((ratings[c.id] || 0) * c.weight) / 100, 0)
	}

	const handleStageComplete = async () => {
		if (!selectedTeam) return
		if (currentStage < EVALUATION_STAGES.length - 1) {
			setCurrentStage(currentStage + 1)
			return
		}
		// Final stage: submit total
		setSubmitting(true)
		try {
			const total = calculateTotalScore()
			const res = await fetch("/api/submit-score", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ team_id: selectedTeam, score: total }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || "فشل حفظ التقييم")
			alert("تم حفظ التقييم بنجاح!")
			setRatings({})
			setComments({})
			setCurrentStage(0)
			setSelectedTeam("")
		} catch (e) {
			alert("حدث خطأ في حفظ التقييم")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20">
			<header className="bg-white/90 backdrop-blur-md border-b border-[#3ab666]/20 sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<img
							src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Copy%20of%20%D8%A7%D9%84%D9%87%D9%88%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D8%B4%D8%AA%D8%B1%D9%83%D8%A9%20%D9%84%D9%87%D8%A7%D9%83%D8%A7%D8%AB%D9%88%D9%86%20%D8%A7%D9%84%D8%A7%D8%A8%D8%AA%D9%83%D8%A7%D8%B1%20%D9%81%D9%89%20%D8%A7%D9%84%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AD%D9%83%D9%88%D9%85%D9%8A%D8%A9%20%20_20250811_071941_0000-mhYmT6CBMBAiGfKtW6ODkUAWW0nPfS.png"
							alt="هاكاثون الابتكار في الخدمات الحكومية"
							className="h-12 w-auto"
						/>
						<div>
							<h1 className="text-xl font-bold text-[#01645e]">لوحة تحكم المحكم</h1>
							<p className="text-sm text-[#8b7632]">مرحباً، {user?.name}</p>
						</div>
					</div>
					<Button onClick={logout} variant="outline" className="border-[#01645e] text-[#01645e] hover:bg-[#01645e] hover:text-white bg-transparent">
						<LogOut className="w-4 h-4 mr-2" />
						تسجيل الخروج
					</Button>
				</div>
			</header>

			<div className="container mx-auto px-4 py-8">
				<div className="grid gap-6">
					<Card className="glass-3d">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-[#01645e]">
								<Users className="w-5 h-5" />
								اختيار الفريق
							</CardTitle>
							<CardDescription className="text-[#8b7632]">اختر الفريق المراد تقييمه</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
								{teams.map((team) => {
									const isSelected = selectedTeam === team.id
									return (
										<button
											key={team.id}
											onClick={() => setSelectedTeam(team.id)}
											className={
												"aspect-square rounded-xl flex items-center justify-center text-lg font-bold transition-all border " +
												(isSelected ? "bg-[#01645e] text-white border-[#01645e] shadow-lg" : "bg-white/70 text-[#01645e] border-[#3ab666]/30 hover:bg-[#01645e]/10 hover:border-[#01645e]")
											}
										>
											{team.team_number}
										</button>
									)
								})}
							</div>
						</CardContent>
					</Card>

					{selectedTeam && (
						<>

							{/* Staged Evaluation */}
							<div className="min-h-screen bg-transparent">
								{/* Header */}
								<div className="bg-white shadow-sm border-b border-[#c3e956]/30 p-4">
									<div className="max-w-4xl mx-auto flex justify-between items-center">
										<div>
											<h1 className="text-xl font-bold text-[#01645e]">تقييم: فريق #{teams.find(t=>t.id===selectedTeam)?.team_number}</h1>
										</div>
										<div className="bg-[#01645e]/10 text-[#01645e] px-4 py-2 rounded-full font-medium">المرحلة {currentStage + 1} من {EVALUATION_STAGES.length}</div>
									</div>
								</div>

								<div className="max-w-4xl mx-auto p-6">
									<AnimatePresence mode="wait">
										{(() => {
											const stage = EVALUATION_STAGES[currentStage]
											const Icon = stage.icon
											return (
												<motion.div key={currentStage} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }} className="glass rounded-3xl shadow-xl p-10 mb-8">
													<div className="text-center mb-10">
														<div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ backgroundColor: `${stage.color}20`, border: `2px solid ${stage.color}` }}>
															<Icon size={48} style={{ color: stage.color }} />
														</div>
														<h2 className="text-3xl font-bold text-[#01645e] mb-4">{stage.title}</h2>
														<p className="text-[#8b7632] text-lg mb-6 max-w-2xl mx-auto">{stage.description}</p>
														<div className="inline-block px-6 py-2 rounded-full text-white font-semibold" style={{ backgroundColor: `${stage.color}30`, border: `1px solid ${stage.color}`, color: stage.color }}>
															الوزن: {stage.weight}%
														</div>
													</div>

													<div className="space-y-8">
														<div className="text-center">
															<h3 className="text-xl font-bold text-[#01645e] mb-6">قيّم هذا المعيار</h3>
															<StarRating rating={ratings[stage.id] || 0} onRate={(r) => setRatings((prev) => ({ ...prev, [stage.id]: r }))} color={stage.color} />
															{ratings[stage.id] && (
																<p className="text-[#8b7632] mt-4">
																	التقييم: {ratings[stage.id]}/5 - {["ضعيف جداً", "ضعيف", "متوسط", "جيد", "ممتاز"][((ratings[stage.id] || 1) - 1) as 0 | 1 | 2 | 3 | 4]}
																</p>
															)}
														</div>

														<div>
															<label className="block text-[#01645e] font-medium mb-3">ملاحظات (اختياري)</label>
															<textarea value={comments[stage.id] || ""} onChange={(e) => setComments((prev) => ({ ...prev, [stage.id]: e.target.value }))} className="w-full p-4 bg-[#c3e956]/10 border border-[#c3e956]/30 rounded-xl text-[#01645e] placeholder:text-[#8b7632] focus:border-[#01645e] focus:ring-[#01645e]/20 resize-none" placeholder="أضف ملاحظاتك حول هذا المعيار..." rows={4} />
														</div>
													</div>
												</motion.div>
											)
										})()}
									</AnimatePresence>

									<div className="flex justify-between items-center">
										<button onClick={() => setCurrentStage(Math.max(0, currentStage - 1))} disabled={currentStage === 0} className="bg-white hover:bg-[#c3e956]/10 disabled:bg-gray-100 text-[#01645e] disabled:text-gray-400 px-6 py-3 rounded-xl font-medium border border-[#c3e956]/30 transition-all duration-200 disabled:cursor-not-allowed">
											<span className="flex items-center gap-2">
												<ArrowRight size={20} />
												السابق
											</span>
										</button>

										<div className="flex gap-2">
											{EVALUATION_STAGES.map((_, index) => (
												<div key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${index < currentStage ? "bg-green-400" : index === currentStage ? "bg-[#01645e] animate-pulse" : "bg-[#c3e956]/30"}`} />
											))}
										</div>

										<button onClick={handleStageComplete} disabled={!(ratings[EVALUATION_STAGES[currentStage].id] > 0) || submitting} className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed">
											<span className="flex items-center gap-2">
												{currentStage === EVALUATION_STAGES.length - 1 ? (
													<>
														إنهاء التقييم
														<CheckCircle size={20} />
													</>
												) : (
													<>
														التالي
														<ArrowLeft size={20} />
													</>
												)}
											</span>
										</button>
									</div>
								</div>
							</div>
							{/* End staged evaluation */}
						</>
					)}
				</div>
			</div>
		</div>
	)
}
