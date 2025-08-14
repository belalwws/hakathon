"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function LoginPage() {
	const [loginEmail, setLoginEmail] = useState("")
	const [loginPassword, setLoginPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [loginError, setLoginError] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { login, user } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (user?.role === "admin") router.push("/admin")
		else if (user?.role === "judge") router.push("/judge")
	}, [user, router])

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoginError("")
		setIsSubmitting(true)
		try {
			const success = await login(loginEmail, loginPassword)
			if (!success) setLoginError("بيانات الدخول غير صحيحة")
		} catch (err) {
			setLoginError("حدث خطأ أثناء تسجيل الدخول")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center p-4">
			<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="glass rounded-3xl shadow-2xl p-8 w-full max-w-md">
				<div className="text-center mb-8">
					<div className="w-20 h-20 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
						<Users size={40} className="text-white" />
					</div>
					<h2 className="text-3xl font-bold text-[#01645e] mb-2">تسجيل الدخول</h2>
					<p className="text-[#8b7632]">ادخل بياناتك للوصول إلى نظام التقييم</p>
				</div>

				<form onSubmit={handleLogin} className="space-y-6" aria-busy={isSubmitting}>
					<div>
						<label className="block text-[#01645e] font-medium mb-2">البريد الإلكتروني</label>
						<input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isSubmitting} className="w-full p-4 bg-[#c3e956]/10 border border-[#c3e956]/30 rounded-xl text-[#01645e] placeholder:text-[#8b7632] focus:border-[#01645e] focus:ring-[#01645e]/20 disabled:opacity-60 disabled:cursor-not-allowed" placeholder="أدخل البريد الإلكتروني" required />
					</div>

					<div>
						<label className="block text-[#01645e] font-medium mb-2">كلمة المرور</label>
						<div className="relative">
							<input type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isSubmitting} className="w-full p-4 bg-[#c3e956]/10 border border-[#c3e956]/30 rounded-xl text-[#01645e] placeholder:text-[#8b7632] focus:border-[#01645e] focus:ring-[#01645e]/20 pr-12 disabled:opacity-60 disabled:cursor-not-allowed" placeholder="أدخل كلمة المرور" required />
							<button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b7632] hover:text-[#01645e] disabled:opacity-50">
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					{loginError && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-3">
							<p className="text-red-700 text-sm">{loginError}</p>
						</div>
					)}

					<button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed">
						{isSubmitting ? (
							<span className="flex items-center justify-center gap-2">
								<Loader2 size={20} className="animate-spin" />
								جاري تسجيل الدخول...
							</span>
						) : (
							<span>تسجيل الدخول</span>
						)}
					</button>
				</form>
			</motion.div>
		</div>
	)
} 