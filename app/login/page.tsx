"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const MOCK_USERS = [
	{ email: "judge1@hackathon.gov.sa", password: "judge123", name: "المحكم الأول" },
	{ email: "judge2@hackathon.gov.sa", password: "judge123", name: "المحكم الثاني" },
	{ email: "judge3@hackathon.gov.sa", password: "judge123", name: "المحكم الثالث" },
]

export default function LoginPage() {
	const [loginEmail, setLoginEmail] = useState("")
	const [loginPassword, setLoginPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [loginError, setLoginError] = useState("")
	const { login, user } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (user?.role === "admin") router.push("/admin")
		else if (user?.role === "judge") router.push("/judge")
	}, [user, router])

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoginError("")
		try {
			const success = await login(loginEmail, loginPassword)
			if (!success) setLoginError("بيانات الدخول غير صحيحة")
		} catch (err) {
			setLoginError("حدث خطأ أثناء تسجيل الدخول")
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

				<form onSubmit={handleLogin} className="space-y-6">
					<div>
						<label className="block text-[#01645e] font-medium mb-2">البريد الإلكتروني</label>
						<input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full p-4 bg-[#c3e956]/10 border border-[#c3e956]/30 rounded-xl text-[#01645e] placeholder:text-[#8b7632] focus:border-[#01645e] focus:ring-[#01645e]/20" placeholder="أدخل البريد الإلكتروني" required />
					</div>

					<div>
						<label className="block text-[#01645e] font-medium mb-2">كلمة المرور</label>
						<div className="relative">
							<input type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full p-4 bg-[#c3e956]/10 border border-[#c3e956]/30 rounded-xl text-[#01645e] placeholder:text-[#8b7632] focus:border-[#01645e] focus:ring-[#01645e]/20 pr-12" placeholder="أدخل كلمة المرور" required />
							<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b7632] hover:text-[#01645e]">
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					{loginError && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-3">
							<p className="text-red-700 text-sm">{loginError}</p>
						</div>
					)}

					<button type="submit" className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
						تسجيل الدخول
					</button>
				</form>

				<div className="mt-6 space-y-3">
					<p className="text-sm text-[#8b7632] text-center mb-3">حسابات تجريبية للاختبار:</p>
					{MOCK_USERS.map((u, index) => (
						<button key={index} onClick={() => { setLoginEmail(u.email); setLoginPassword(u.password); setLoginError("") }} className="w-full bg-[#c3e956]/10 border border-[#c3e956]/30 text-[#01645e] hover:bg-[#01645e]/10 hover:border-[#01645e] py-2 px-4 rounded-lg text-sm transition-all duration-200">
							{u.name}: {u.email}
						</button>
					))}
				</div>
			</motion.div>
		</div>
	)
} 