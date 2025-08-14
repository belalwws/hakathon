"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ArrowLeft, ArrowRight, CheckCircle, Trophy, Crown } from "lucide-react"

const STAGES = [
	{ id: "strategic", title: "الجدوى", weight: 20, color: "#01645e", description: "مدى قدرة الفكرة على تحقيق قيمة واضحة وعائد ملموس للمؤسسة، مع قابلية استدامتها على المدى الطويل، وتوازن التكلفة مع الفوائد المتوقعة." },
	{ id: "innovation", title: "ابتكارية الفكرة", weight: 25, color: "#3ab666", description: "مدى إبداع الفكرة وجديدتها. هل تقدم الفكرة حلولًا مبتكرة لتحديات أو احتياجات قائمة؟ هل هناك تفكير متجدد يعكس تميز الفكرة ويعزز من فعالية العمليات في المؤسسة؟" },
	{ id: "feasibility", title: "قابلية التطبيق", weight: 25, color: "#c3e956", description: "إمكانية تنفيذ الفكرة باستخدام الموارد المتاحة ضمن المعايير والقيود المحددة. هل يمكن تطبيق الفكرة في الإطار الزمني والمالي المحدد؟ وهل الفكرة قابلة للتنفيذ ضمن البيئات والظروف المتاحة؟" },
	{ id: "impact", title: "التأثير على المؤسسة", weight: 20, color: "#8b7632", description: "يركز هذا المعيار على تأثير الفكرة في تحسين أداء المؤسسة. هل ستسهم الفكرة في تعزيز كفاءة العمل ورفع الإنتاجية داخل المؤسسة؟ وهل سيكون لها تأثير إيجابي على العمليات والنتائج التشغيلية؟" },
	{ id: "presentation", title: "مهارات العرض", weight: 10, color: "#01645e", description: "يتم تقييم طريقة تقديم الفكرة من قبل الفريق. كيف يعرض الفريق فكرته بشكل احترافي ومقنع؟ هل العرض واضح ومنظم بطريقة تسهل فهم الفكرة من قبل المعنيين في المؤسسة؟" },
]

// Celebration Component
const CelebrationScreen = () => (
	<div className="fixed inset-0 bg-gradient-to-br from-[#01645e] via-[#3ab666] to-[#c3e956] flex items-center justify-center z-50">
		<div className="text-center space-y-8 animate-fade-in">
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ type: "spring", stiffness: 200, damping: 10 }}
				className="relative"
			>
				<Trophy size={120} className="text-yellow-400 mx-auto animate-bounce" />
				<div className="absolute -top-4 -right-4 animate-spin">
					<Star size={40} className="text-yellow-300" fill="currentColor" />
				</div>
				<div className="absolute -bottom-4 -left-4 animate-pulse">
					<Crown size={40} className="text-yellow-400" fill="currentColor" />
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5 }}
				className="space-y-4"
			>
				<p className="text-2xl text-yellow-300">شكراً لإتمام التقييم</p>
			</motion.div>
		</div>

		{/* Floating particles */}
		<div className="absolute inset-0 pointer-events-none">
			{[...Array(30)].map((_, i) => (
				<motion.div
					key={i}
					className="absolute"
					initial={{
						x: typeof window !== "undefined" ? Math.random() * window.innerWidth : 0,
						y: typeof window !== "undefined" ? window.innerHeight + 20 : 0,
						rotate: 0,
						scale: 0,
					}}
					animate={{
						y: -100,
						rotate: 360,
						scale: [0, 1, 0],
					}}
					transition={{
						duration: Math.random() * 3 + 2,
						repeat: Number.POSITIVE_INFINITY,
						delay: Math.random() * 2,
					}}
				>
					{i % 3 === 0 ? (
						<Star size={20} className="text-yellow-400" fill="currentColor" />
					) : i % 3 === 1 ? (
						<Trophy size={16} className="text-yellow-300" />
					) : (
						<Crown size={18} className="text-yellow-500" fill="currentColor" />
					)}
				</motion.div>
			))}
		</div>
	</div>
)

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

function EvaluateContent() {
	const router = useRouter()
	const params = useSearchParams()
	const teamId = params.get("teamId") || ""
	const teamNumber = params.get("teamNumber") || ""
	const [ratings, setRatings] = useState<Record<string, number>>({})
	const [comments, setComments] = useState<Record<string, string>>({})
	const [currentStage, setCurrentStage] = useState(0)
	const [submitting, setSubmitting] = useState(false)

	const calcTotal = () => STAGES.reduce((t, s) => t + ((ratings[s.id] || 0) * s.weight) / 100, 0)

	const handleNext = async () => {
		if (currentStage < STAGES.length - 1) {
			setCurrentStage((s) => s + 1)
			return
		}
		// Submit
		setSubmitting(true)
		try {
			const res = await fetch("/api/submit-score", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ team_id: teamId, score: calcTotal() }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || "فشل حفظ التقييم")
			// Save evaluated team locally
			try {
				const k = "evaluated_team_ids"
				const list = JSON.parse(localStorage.getItem(k) || "[]") as string[]
				if (!list.includes(teamId)) localStorage.setItem(k, JSON.stringify([...list, teamId]))
			} catch {}
			// Show celebration then redirect
			setShowThanks(true)
			setTimeout(() => router.replace("/judge/select"), 2000)
		} catch {
			alert("حدث خطأ في حفظ التقييم")
		} finally {
			setSubmitting(false)
		}
	}

	const [showThanks, setShowThanks] = useState(false)

	if (!teamId) return <div className="p-6">معرّف الفريق غير صحيح</div>
	if (showThanks) {
		return <CelebrationScreen />
	}

	const stage = STAGES[currentStage]
	const canProceed = (ratings[stage.id] || 0) > 0

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20">
			<div className="bg-white shadow-sm border-b border-[#c3e956]/30 p-4">
				<div className="max-w-4xl mx-auto flex justify-between items-center">
					<div>
						<h1 className="text-xl font-bold text-[#01645e]">تقييم: فريق #{teamNumber}</h1>
					</div>
					<div className="bg-[#01645e]/10 text-[#01645e] px-4 py-2 rounded-full font-medium">المرحلة {currentStage + 1} من {STAGES.length}</div>
				</div>
			</div>

			<div className="max-w-4xl mx-auto p-6">
				<AnimatePresence mode="wait">
					<motion.div key={currentStage} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.5 }} className="glass rounded-3xl shadow-xl p-10 mb-8">
						<div className="text-center mb-10">
							<div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ backgroundColor: `${stage.color}20`, border: `2px solid ${stage.color}` }}>
								<Star size={48} style={{ color: stage.color }} />
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
				</AnimatePresence>

				<div className="flex justify-between items-center">
					<button onClick={() => setCurrentStage(Math.max(0, currentStage - 1))} disabled={currentStage === 0} className="bg-white hover:bg-[#c3e956]/10 disabled:bg-gray-100 text-[#01645e] disabled:text-gray-400 px-6 py-3 rounded-xl font-medium border border-[#c3e956]/30 transition-all duration-200 disabled:cursor-not-allowed">
						<span className="flex items-center gap-2">
							<ArrowRight size={20} />
							السابق
						</span>
					</button>

					<div className="flex gap-2">
						{STAGES.map((_, index) => (
							<div key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${index < currentStage ? "bg-green-400" : index === currentStage ? "bg-[#01645e] animate-pulse" : "bg-[#c3e956]/30"}`} />
						))}
					</div>

					<button onClick={handleNext} disabled={!canProceed || submitting} className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed">
						<span className="flex items-center gap-2">
							{currentStage === STAGES.length - 1 ? (
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
	)
}

export default function JudgeEvaluatePage() {
	return (
		<Suspense fallback={<div className="p-6">جاري التحميل...</div>}>
			<EvaluateContent />
		</Suspense>
	)
} 