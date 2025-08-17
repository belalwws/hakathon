"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Crown, Medal, Award, RotateCcw, Building2, Play, Pause, X, Eye, Sparkles } from "lucide-react"

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

interface OrganizationResults {
	name: string
	teams: TeamAverage[]
	winners: TeamAverage[]
	winnerCount: number
	color: string
	icon: string
	gradient: string
	description: string
	primaryColor: string
	secondaryColor: string
}

export default function AdminPresentationPage() {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [teamAverages, setTeamAverages] = useState<TeamAverage[]>([])
	const [totalTeams, setTotalTeams] = useState(0)
	const [totalJudges, setTotalJudges] = useState(0)
	const [showByOrganization, setShowByOrganization] = useState(true)
	const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null)
	const [revealedWinners, setRevealedWinners] = useState<Set<string>>(new Set())
	const [presentationMode, setPresentationMode] = useState(false)
	const [fullScreenWinner, setFullScreenWinner] = useState<{winner: TeamAverage, rank: number, orgName: string, orgColors: {primary: string, secondary: string}} | null>(null)
	const [autoRevealMode, setAutoRevealMode] = useState(false)

	useEffect(() => {
		loadLiveResults()
	}, [])

	const loadLiveResults = useCallback(async () => {
		try {
			setLoading(true)
			const res = await fetch("/api/admin/results", { cache: "no-store" })
			if (!res.ok) throw new Error("فشل في جلب النتائج")
			const data = await res.json()
			setTeamAverages((data.team_averages || []).sort((a: TeamAverage, b: TeamAverage) => (b.average_score || 0) - (a.average_score || 0)))
			setTotalTeams(data.summary?.total_teams || 0)
			setTotalJudges(data.summary?.total_judges || 0)
		} catch (e: any) {
			setError(e?.message || "حدث خطأ")
		} finally {
			setLoading(false)
		}
	}, [])

	const organizationResults = useMemo((): OrganizationResults[] => {
		const organizations = [
			{
				name: "الدفاع المدني",
				teamRange: [1, 8],
				winnerCount: 3,
				color: "text-red-600",
				icon: "🚒",
				gradient: "from-[#01645e] via-[#c3e956] to-[#3ab666]",
				description: "حماة الوطن وخط الدفاع الأول",
				primaryColor: "#01645e",
				secondaryColor: "#c3e956"
			},
			{
				name: "المديرية العامة للجوازات",
				teamRange: [9, 11],
				winnerCount: 1,
				color: "text-blue-600",
				icon: "🛂",
				gradient: "from-[#3ab666] via-[#c3e956] to-[#01645e]",
				description: "بوابة المملكة للعالم",
				primaryColor: "#3ab666",
				secondaryColor: "#01645e"
			},
			{
				name: "إمارة الباحة",
				teamRange: [12, 18],
				winnerCount: 3,
				color: "text-green-600",
				icon: "🏛️",
				gradient: "from-[#c3e956] via-[#3ab666] to-[#01645e]",
				description: "جوهرة الجنوب السعودي",
				primaryColor: "#c3e956",
				secondaryColor: "#3ab666"
			}
		]

		return organizations.map(org => {
			const orgTeams = teamAverages
				.filter(team => team.team_number >= org.teamRange[0] && team.team_number <= org.teamRange[1])
				.sort((a, b) => (b.average_score || 0) - (a.average_score || 0))
			
			const winners = orgTeams.slice(0, org.winnerCount)

			return {
				name: org.name,
				teams: orgTeams,
				winners,
				winnerCount: org.winnerCount,
				color: org.color,
				icon: org.icon,
				gradient: org.gradient,
				description: org.description,
				primaryColor: org.primaryColor,
				secondaryColor: org.secondaryColor
			}
		})
	}, [teamAverages])

	const handleOrganizationClick = useCallback((orgName: string) => {
		const org = organizationResults.find(o => o.name === orgName)
		if (org) {
			setSelectedOrganization(orgName)
			setRevealedWinners(new Set()) // Start with all hidden
			// Enter fullscreen immediately on first click
			if (!presentationMode) {
				setPresentationMode(true)
				document.documentElement.requestFullscreen?.()
			}
		}
	}, [organizationResults, presentationMode])

	const revealWinner = useCallback((teamId: string) => {
		setRevealedWinners(prev => new Set([...prev, teamId]))
	}, [])

	const revealWinnerFullScreen = useCallback((winner: TeamAverage, rank: number, orgName: string, orgColors: {primary: string, secondary: string}) => {
		// First reveal the winner, then show fullscreen
		setRevealedWinners(prev => new Set([...prev, winner.team_id]))
		// Small delay to show the reveal animation, then fullscreen
		setTimeout(() => {
			setFullScreenWinner({ winner, rank, orgName, orgColors })
		}, 500)
	}, [])

	const startAutoReveal = useCallback(() => {
		const selectedOrg = organizationResults.find(org => org.name === selectedOrganization)
		if (selectedOrg) {
			setAutoRevealMode(true)
			selectedOrg.winners.forEach((winner, index) => {
				setTimeout(() => {
					setRevealedWinners(prev => new Set([...prev, winner.team_id]))
				}, (index + 1) * 2000) // 2 seconds between reveals
			})
			setTimeout(() => setAutoRevealMode(false), selectedOrg.winners.length * 2000 + 1000)
		}
	}, [selectedOrganization, organizationResults])

	const revealAllWinners = useCallback(() => {
		const selectedOrg = organizationResults.find(org => org.name === selectedOrganization)
		if (selectedOrg) {
			setRevealedWinners(new Set(selectedOrg.winners.map(w => w.team_id)))
		}
	}, [selectedOrganization, organizationResults])

	const showFullScreenWinner = useCallback((winner: TeamAverage, rank: number, orgName: string, orgColors: {primary: string, secondary: string}) => {
		setFullScreenWinner({ winner, rank, orgName, orgColors })
	}, [])

	const closeFullScreen = useCallback(() => {
		setFullScreenWinner(null)
	}, [])

	const closeOrganizationView = useCallback(() => {
		setSelectedOrganization(null)
		setRevealedWinners(new Set())
		setAutoRevealMode(false)
	}, [])

	const getRankIcon = useCallback((rank: number, size: string = "w-12 h-12") => {
		if (rank === 0) return <Crown className={`${size} text-[#c3e956] drop-shadow-lg`} fill="currentColor" />
		if (rank === 1) return <Medal className={`${size} text-gray-300 drop-shadow-lg`} />
		if (rank === 2) return <Award className={`${size} text-[#3ab666] drop-shadow-lg`} />
		return <div className={`${size} bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl`}>{rank + 1}</div>
	}, [])

	const togglePresentationMode = useCallback(() => {
		setPresentationMode(!presentationMode)
		if (!presentationMode) {
			document.documentElement.requestFullscreen?.()
		} else {
			document.exitFullscreen?.()
		}
	}, [presentationMode])

	if (loading) return (
		<div className="min-h-screen bg-gradient-to-br from-[#01645e] via-[#3ab666] to-[#c3e956] flex items-center justify-center">
			<div className="text-center">
				<motion.div 
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					className="w-16 h-16 border-4 border-white border-t-[#c3e956] rounded-full mx-auto mb-4"
				/>
				<motion.h2 
					animate={{ opacity: [0.5, 1, 0.5] }}
					transition={{ duration: 1.5, repeat: Infinity }}
					className="text-3xl font-bold text-white drop-shadow-lg"
				>
					جاري تحضير نتائج هاكاثون الابتكار...
				</motion.h2>
			</div>
		</div>
	)
	
	if (error) return <div className="p-6 text-red-600 text-center text-xl">{error}</div>

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#01645e] via-[#3ab666] to-[#c3e956] relative overflow-hidden">
			{/* Magical Background Effects */}
			<div className="absolute inset-0 opacity-30">
				{[...Array(12)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-20 h-20 rounded-full"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							background: `radial-gradient(circle, ${['#01645e', '#3ab666', '#c3e956'][i % 3]}40 0%, transparent 70%)`
						}}
						animate={{
							scale: [1, 1.5, 1],
							opacity: [0.3, 0.6, 0.3],
							y: [0, -30, 0]
						}}
						transition={{
							duration: 4 + Math.random() * 2,
							repeat: Infinity,
							delay: Math.random() * 2,
						}}
					/>
				))}
			</div>

			{/* Sparkle Effects */}
			<div className="absolute inset-0 pointer-events-none">
				{[...Array(20)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-2 h-2 bg-[#c3e956] rounded-full"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
						}}
						animate={{
							scale: [0, 1, 0],
							opacity: [0, 1, 0],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							delay: Math.random() * 4,
						}}
					/>
				))}
			</div>

			{/* Full Screen Winner Modal */}
			<AnimatePresence>
				{fullScreenWinner && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
						onClick={closeFullScreen}
					>
						<motion.div
							initial={{ scale: 0.5, rotateY: -90 }}
							animate={{ scale: 1, rotateY: 0 }}
							exit={{ scale: 0.5, rotateY: 90 }}
							transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
							className="relative w-full max-w-5xl h-full max-h-[90vh] flex items-center justify-center"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<motion.button
								onClick={closeFullScreen}
								whileHover={{ scale: 1.1, rotate: 90 }}
								whileTap={{ scale: 0.9 }}
								className="absolute top-4 right-4 z-20 w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl transition-colors"
							>
								<X size={24} />
							</motion.button>

							{/* Winner Card */}
							<motion.div 
								className="w-full h-full rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden"
								style={{ 
									background: `linear-gradient(135deg, ${fullScreenWinner.orgColors.primary}, ${fullScreenWinner.orgColors.secondary})`
								}}
								animate={{
									boxShadow: [
										`0 0 50px ${fullScreenWinner.orgColors.primary}50`,
										`0 0 100px ${fullScreenWinner.orgColors.secondary}70`,
										`0 0 50px ${fullScreenWinner.orgColors.primary}50`
									]
								}}
								transition={{ duration: 2, repeat: Infinity }}
							>
								{/* Magical Particles */}
								<div className="absolute inset-0 pointer-events-none">
									{[...Array(30)].map((_, i) => (
										<motion.div
											key={i}
											className="absolute w-3 h-3 bg-white rounded-full"
											style={{
												left: `${Math.random() * 100}%`,
												top: `${Math.random() * 100}%`,
											}}
											animate={{
												y: [-20, -100],
												opacity: [1, 0],
												scale: [0, 1, 0]
											}}
											transition={{
												duration: 3,
												repeat: Infinity,
												delay: Math.random() * 2,
											}}
										/>
									))}
								</div>

								{/* Winner Content */}
								<div className="relative z-10 text-center px-8 py-12">
									{/* Trophy with Rotation */}
									<motion.div 
										className="w-40 h-40 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"
										animate={{ 
											rotateY: [0, 360],
											scale: [1, 1.1, 1]
										}}
										transition={{ 
											rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
											scale: { duration: 2, repeat: Infinity }
										}}
									>
										{getRankIcon(fullScreenWinner.rank, "w-20 h-20")}
									</motion.div>
									
									{/* Team Number with Typewriter Effect */}
									<motion.h1 
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 1 }}
										className="text-8xl font-bold text-white mb-6 drop-shadow-2xl"
									>
										فريق {fullScreenWinner.winner.team_number}
									</motion.h1>
									
									{/* Winner Badge with Pulse */}
									<motion.div 
										className="space-y-6"
										initial={{ y: 50, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ delay: 1 }}
									>
										<motion.div 
											className="bg-white/20 backdrop-blur-sm text-white px-12 py-6 rounded-full text-3xl font-bold shadow-xl"
											animate={{ scale: [1, 1.05, 1] }}
											transition={{ duration: 1.5, repeat: Infinity }}
										>
											🎉 فائز {fullScreenWinner.rank === 0 ? '🥇' : fullScreenWinner.rank === 1 ? '🥈' : '🥉'}
										</motion.div>

										<div className="space-y-3 text-white/90">
											<p className="text-2xl font-semibold">{fullScreenWinner.orgName}</p>
											<p className="text-xl">عدد التقييمات: {fullScreenWinner.winner.total_evaluations}</p>
										</div>
									</motion.div>
								</div>
							</motion.div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Organization Full View */}
			<AnimatePresence>
				{selectedOrganization && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/95 z-40 flex items-center justify-center p-6"
						onClick={closeOrganizationView}
					>
						<motion.div
							initial={{ scale: 0.8, y: 100 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.8, y: 100 }}
							transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
							className="w-full max-w-7xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-h-[95vh] overflow-y-auto"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<motion.button
								onClick={closeOrganizationView}
								whileHover={{ scale: 1.1, rotate: 90 }}
								whileTap={{ scale: 0.9 }}
								className="absolute top-4 right-4 w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl transition-colors"
							>
								<X size={24} />
							</motion.button>

							{(() => {
								const org = organizationResults.find(o => o.name === selectedOrganization)
								if (!org) return null

								return (
									<>
										{/* Organization Header */}
										<motion.div 
											className="text-center mb-12"
											initial={{ y: -50, opacity: 0 }}
											animate={{ y: 0, opacity: 1 }}
											transition={{ duration: 0.6 }}
										>
											<motion.div 
												className={`w-24 h-24 bg-gradient-to-br ${org.gradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl`}
												animate={{ 
													rotate: [0, 360],
													scale: [1, 1.1, 1]
												}}
												transition={{ 
													rotate: { duration: 4, repeat: Infinity, ease: "linear" },
													scale: { duration: 2, repeat: Infinity }
												}}
											>
												<span className="text-4xl">{org.icon}</span>
											</motion.div>
											<h3 className="text-4xl font-bold text-white mb-3">{org.name}</h3>
											<p className="text-white/80 text-lg italic">{org.description}</p>
											<motion.p 
												className="text-[#c3e956] text-xl font-semibold mt-4"
												animate={{ opacity: [0.7, 1, 0.7] }}
												transition={{ duration: 2, repeat: Infinity }}
											>
												{org.winnerCount} فرق فائزة من {org.teams.length}
											</motion.p>
										</motion.div>

										{/* Action Buttons */}
										<motion.div 
											className="flex justify-center gap-6 mb-12 flex-wrap"
											initial={{ y: 50, opacity: 0 }}
											animate={{ y: 0, opacity: 1 }}
											transition={{ delay: 0.3, duration: 0.6 }}
										>
											<motion.button
												onClick={revealAllWinners}
												whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(195,233,86,0.3)" }}
												whileTap={{ scale: 0.95 }}
												className="bg-gradient-to-r from-[#c3e956] to-[#3ab666] text-[#01645e] font-bold px-8 py-4 rounded-full shadow-xl transition-all duration-300 flex items-center gap-3"
											>
												<Eye size={20} />
												كشف جميع الفائزين
											</motion.button>
											
											<motion.button
												onClick={startAutoReveal}
												whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(1,100,94,0.3)" }}
												whileTap={{ scale: 0.95 }}
												className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white font-bold px-8 py-4 rounded-full shadow-xl transition-all duration-300 flex items-center gap-3"
												disabled={autoRevealMode}
											>
												<Sparkles size={20} />
												{autoRevealMode ? "جاري الكشف..." : "كشف تدريجي"}
											</motion.button>
										</motion.div>

										{/* Winners Grid */}
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{org.winners.map((winner, index) => {
												const isRevealed = revealedWinners.has(winner.team_id)
												return (
													<motion.div
														key={winner.team_id}
														initial={{ opacity: 0, y: 50, rotateX: -30 }}
														animate={{ opacity: 1, y: 0, rotateX: 0 }}
														transition={{ delay: index * 0.1, duration: 0.6 }}
														className="relative"
													>
														{!isRevealed ? (
															// Mystery Card
															<motion.div
																whileHover={{ scale: 1.05, rotateY: 5 }}
																whileTap={{ scale: 0.95 }}
																onClick={() => revealWinnerFullScreen(winner, index, org.name, {primary: org.primaryColor, secondary: org.secondaryColor})}
																className="h-72 rounded-2xl p-6 cursor-pointer relative overflow-hidden"
																style={{ 
																	background: `linear-gradient(135deg, ${org.primaryColor}20, ${org.secondaryColor}15)`,
																	border: `2px dashed ${org.primaryColor}60`,
																	boxShadow: `0 10px 30px ${org.primaryColor}20`
																}}
															>
																{/* Mystery Animation */}
																<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
																
																<div className="flex flex-col items-center justify-center h-full text-center">
																	<motion.div
																		className="w-20 h-20 rounded-full flex items-center justify-center mb-6 relative"
																		style={{ background: `linear-gradient(135deg, ${org.primaryColor}40, ${org.secondaryColor}40)` }}
																		animate={{ 
																			rotateY: [0, 180, 360],
																			scale: [1, 1.1, 1]
																		}}
																		transition={{ 
																			duration: 3, 
																			repeat: Infinity,
																			ease: "easeInOut"
																		}}
																	>
																		<motion.span 
																			className="text-4xl"
																			animate={{ opacity: [0.5, 1, 0.5] }}
																			transition={{ duration: 1.5, repeat: Infinity }}
																		>
																			❓
																		</motion.span>
																		
																		{/* Floating Sparkles */}
																		{[...Array(6)].map((_, i) => (
																			<motion.div
																				key={i}
																				className="absolute w-2 h-2 bg-[#c3e956] rounded-full"
																				style={{
																					left: `${20 + Math.random() * 60}%`,
																					top: `${20 + Math.random() * 60}%`,
																				}}
																				animate={{
																					y: [-10, -30, -10],
																					opacity: [0, 1, 0],
																					scale: [0, 1, 0]
																				}}
																				transition={{
																					duration: 2,
																					repeat: Infinity,
																					delay: i * 0.3,
																				}}
																			/>
																		))}
																	</motion.div>
																	
																	<motion.h5 
																		className="text-2xl font-bold text-white mb-4"
																		animate={{ opacity: [0.7, 1, 0.7] }}
																		transition={{ duration: 2, repeat: Infinity }}
																	>
																		المركز {index + 1}
																	</motion.h5>
																	
																	<motion.p 
																		className="text-white/80 text-lg mb-4"
																		animate={{ scale: [1, 1.05, 1] }}
																		transition={{ duration: 2, repeat: Infinity }}
																	>
																		انقر للكشف عن الفائز
																	</motion.p>
																	
																	<motion.div 
																		className="text-[#c3e956] font-bold text-lg"
																		animate={{ 
																			textShadow: [
																				"0 0 10px rgba(195,233,86,0.5)",
																				"0 0 20px rgba(195,233,86,0.8)",
																				"0 0 10px rgba(195,233,86,0.5)"
																			]
																		}}
																		transition={{ duration: 1.5, repeat: Infinity }}
																	>
																		🎁 مفاجأة!
																	</motion.div>
																</div>
															</motion.div>
														) : (
															// Revealed Winner Card
															<motion.div
																initial={{ scale: 0, rotateY: -180 }}
																animate={{ scale: 1, rotateY: 0 }}
																transition={{ 
																	type: "spring", 
																	duration: 1.2, 
																	bounce: 0.4,
																	delay: 0.2
																}}
																whileHover={{ 
																	scale: 1.02, 
																	rotateY: 5,
																	boxShadow: `0 20px 40px ${org.primaryColor}30`
																}}
																onClick={() => showFullScreenWinner(winner, index, org.name, {primary: org.primaryColor, secondary: org.secondaryColor})}
																className="h-72 rounded-2xl p-6 cursor-pointer relative overflow-hidden"
																style={{ 
																	background: `linear-gradient(135deg, ${org.primaryColor}30, ${org.secondaryColor}20)`,
																	borderColor: org.primaryColor,
																	border: "2px solid",
																	boxShadow: `0 15px 35px ${org.primaryColor}25`
																}}
															>
																{/* Success Particles */}
																<div className="absolute inset-0 pointer-events-none">
																	{[...Array(8)].map((_, i) => (
																		<motion.div
																			key={i}
																			className="absolute w-2 h-2 bg-[#c3e956] rounded-full"
																			style={{
																				left: `${Math.random() * 100}%`,
																				top: `${Math.random() * 100}%`,
																			}}
																			animate={{
																				y: [0, -50, 0],
																				opacity: [0, 1, 0],
																				scale: [0, 1, 0]
																			}}
																			transition={{
																				duration: 3,
																				repeat: Infinity,
																				delay: Math.random() * 2,
																			}}
																		/>
																	))}
																</div>

																<div className="flex flex-col items-center justify-center h-full text-center relative z-10">
																	{/* Rank Icon with Glow */}
																	<motion.div 
																		className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg"
																		animate={{ 
																			boxShadow: [
																				"0 0 20px rgba(195,233,86,0.5)",
																				"0 0 30px rgba(195,233,86,0.8)",
																				"0 0 20px rgba(195,233,86,0.5)"
																			]
																		}}
																		transition={{ duration: 2, repeat: Infinity }}
																	>
																		{getRankIcon(index, "w-8 h-8")}
																	</motion.div>
																	
																	{/* Team Number */}
																	<motion.h5 
																		className="text-2xl font-bold text-white mb-3"
																		initial={{ opacity: 0, scale: 0.5 }}
																		animate={{ opacity: 1, scale: 1 }}
																		transition={{ delay: 0.3, duration: 0.5 }}
																	>
																		فريق {winner.team_number}
																	</motion.h5>
																	
																	{/* Winner Badge */}
																	<motion.div 
																		className="text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
																		style={{ background: `linear-gradient(135deg, ${org.primaryColor}, ${org.secondaryColor})` }}
																		initial={{ opacity: 0, scale: 0.8 }}
																		animate={{ opacity: 1, scale: 1 }}
																		transition={{ delay: 0.5, duration: 0.5 }}
																		whileHover={{ scale: 1.05 }}
																	>
																		🎉 فائز {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
																	</motion.div>
																</div>
															</motion.div>
														)}
													</motion.div>
												)
											})}
										</div>
									</>
								)
							})()}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="relative z-10 mx-auto max-w-6xl p-6">
				{/* Header */}
				<motion.div 
					className="mb-12 flex items-center justify-between flex-wrap gap-4"
					initial={{ y: -50, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.8 }}
				>
					<div className="flex items-center gap-4">
						<motion.div 
							className="w-16 h-16 bg-gradient-to-r from-[#c3e956] to-[#01645e] rounded-full flex items-center justify-center shadow-xl"
							animate={{ 
								rotate: [0, 360],
								scale: [1, 1.1, 1]
							}}
							transition={{ 
								rotate: { duration: 10, repeat: Infinity, ease: "linear" },
								scale: { duration: 2, repeat: Infinity }
							}}
						>
							<Trophy className="w-8 h-8 text-white" />
						</motion.div>
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-white via-[#c3e956] to-white bg-clip-text text-transparent">
								نتائج هاكاثون الابتكار في الخدمات الحكومية الافتراضي
							</h1>
							<p className="text-white/90 text-lg mt-2">🏆 مسابقة الابتكار التقني 2025</p>
						</div>
					</div>
					
					<div className="flex flex-wrap items-center gap-3">
						<motion.button 
							onClick={togglePresentationMode}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="bg-gradient-to-r from-[#c3e956] to-[#3ab666] text-[#01645e] px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
						>
							{presentationMode ? <Pause size={20}/> : <Play size={20}/>}
							{presentationMode ? "إيقاف العرض" : "وضع العرض"}
						</motion.button>
						
						<motion.button 
							onClick={loadLiveResults} 
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
						>
							<RotateCcw size={18}/> تحديث
						</motion.button>
						
						<a 
							href="/admin/dashboard" 
							className="border-2 border-white/50 text-white px-6 py-3 rounded-full hover:bg-white/10 transition-all duration-300"
						>
							لوحة التحكم
						</a>
					</div>
				</motion.div>

				{/* Main Title */}
				<motion.div 
					className="text-center mb-16"
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 1, delay: 0.2 }}
				>
					<motion.div 
						className="w-32 h-32 bg-gradient-to-r from-[#c3e956] via-[#3ab666] to-[#01645e] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
						animate={{ 
							rotate: [0, 360],
							boxShadow: [
								"0 0 50px rgba(195,233,86,0.3)",
								"0 0 100px rgba(58,182,102,0.5)",
								"0 0 50px rgba(1,100,94,0.3)"
							]
						}}
						transition={{ 
							rotate: { duration: 8, repeat: Infinity, ease: "linear" },
							boxShadow: { duration: 3, repeat: Infinity }
						}}
					>
						<Trophy size={80} className="text-white" />
					</motion.div>
					
					<motion.h2 
						className="text-6xl font-bold bg-gradient-to-r from-white via-[#c3e956] to-white bg-clip-text text-transparent mb-6"
						animate={{ 
							textShadow: [
								"0 0 20px rgba(195,233,86,0.3)",
								"0 0 40px rgba(195,233,86,0.6)",
								"0 0 20px rgba(195,233,86,0.3)"
							]
						}}
						transition={{ duration: 2, repeat: Infinity }}
					>
						النتائج النهائية
					</motion.h2>
					
					<motion.div 
						className="flex justify-center items-center gap-8 text-white/90 text-lg"
						initial={{ y: 30, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.5, duration: 0.6 }}
					>
						<motion.div 
							className="bg-white/15 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30"
							whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
						>
							<Building2 className="w-6 h-6 text-[#c3e956] inline mr-2" />
							<span>3 جهات مشاركة</span>
						</motion.div>
						<motion.div 
							className="bg-white/15 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30"
							whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
						>
							<Trophy className="w-6 h-6 text-[#c3e956] inline mr-2" />
							<span>{totalTeams} فريق متنافس</span>
						</motion.div>
						<motion.div 
							className="bg-white/15 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30"
							whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
						>
							<Crown className="w-6 h-6 text-[#c3e956] inline mr-2" />
							<span>{totalJudges} محكم خبير</span>
						</motion.div>
					</motion.div>
				</motion.div>

				{/* Organizations */}
				{showByOrganization && organizationResults.length > 0 && (
					<motion.div 
						className="space-y-12"
						initial={{ y: 50, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.6, duration: 0.8 }}
					>
						<motion.h3 
							className="text-4xl font-bold text-center bg-gradient-to-r from-white to-[#c3e956] bg-clip-text text-transparent mb-12"
							animate={{ 
								textShadow: [
									"0 0 20px rgba(195,233,86,0.3)",
									"0 0 30px rgba(195,233,86,0.5)",
									"0 0 20px rgba(195,233,86,0.3)"
								]
							}}
							transition={{ duration: 2.5, repeat: Infinity }}
						>
							🏛️ الجهات المشاركة
						</motion.h3>
						
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{organizationResults.map((org, orgIndex) => (
								<motion.div
									key={org.name}
									initial={{ opacity: 0, y: 100, rotateX: -20 }}
									animate={{ opacity: 1, y: 0, rotateX: 0 }}
									transition={{ delay: orgIndex * 0.2, duration: 0.8, type: "spring", bounce: 0.3 }}
									whileHover={{ 
										scale: 1.05, 
										rotateY: 5,
										boxShadow: `0 25px 50px ${org.primaryColor}30`
									}}
									whileTap={{ scale: 0.95 }}
									onClick={() => handleOrganizationClick(org.name)}
									className="relative cursor-pointer group"
								>
									<motion.div
										className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/30 shadow-2xl transition-all duration-500 hover:bg-white/20 hover:border-white/50 relative overflow-hidden"
										animate={{
											borderColor: [
												"rgba(255,255,255,0.3)",
												`${org.primaryColor}60`,
												"rgba(255,255,255,0.3)"
											]
										}}
										transition={{ duration: 4, repeat: Infinity }}
									>
										{/* Animated Background Gradient */}
										<motion.div 
											className="absolute inset-0 opacity-20"
											style={{ 
												background: `linear-gradient(45deg, ${org.primaryColor}20, ${org.secondaryColor}20)`
											}}
											animate={{ 
												backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
											}}
											transition={{ duration: 5, repeat: Infinity }}
										/>

										<div className="text-center relative z-10">
											<motion.div 
												className={`w-24 h-24 bg-gradient-to-br ${org.gradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300`}
												animate={{ 
													rotate: [0, 360],
													scale: [1, 1.1, 1]
												}}
												transition={{ 
													rotate: { duration: 6, repeat: Infinity, ease: "linear" },
													scale: { duration: 2, repeat: Infinity }
												}}
											>
												<span className="text-4xl">{org.icon}</span>
											</motion.div>
											
											<h4 className="text-2xl font-bold text-white mb-4 group-hover:text-[#c3e956] transition-colors duration-300">
												{org.name}
											</h4>
											
											<p className="text-white/80 text-sm mb-6 italic">
												{org.description}
											</p>
											
											<motion.div 
												className="bg-black/30 rounded-full px-6 py-3 backdrop-blur-sm"
												whileHover={{ backgroundColor: "rgba(0,0,0,0.4)" }}
											>
												<Crown className="w-6 h-6 text-[#c3e956] inline mr-2" />
												<span className="text-lg font-semibold text-white">
													{org.winnerCount} فرق فائزة
												</span>
											</motion.div>
											
											<motion.p 
												className="text-[#c3e956] text-sm mt-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
												animate={{ 
													textShadow: [
														"0 0 10px rgba(195,233,86,0.5)",
														"0 0 20px rgba(195,233,86,0.8)",
														"0 0 10px rgba(195,233,86,0.5)"
													]
												}}
												transition={{ duration: 2, repeat: Infinity }}
											>
												اضغط لعرض الفائزين
											</motion.p>
										</div>
									</motion.div>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</div>
		</div>
	)
} 