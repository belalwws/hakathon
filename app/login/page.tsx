"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { LogIn, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
	const [loginEmail, setLoginEmail] = useState("")
	const [loginPassword, setLoginPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [loginError, setLoginError] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { login, user, loading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		// Wait for auth to finish loading
		if (loading) {
			console.log('🔄 Login page: Auth still loading...')
			return
		}

		// If no user, clear redirect flag and stay on login page
		if (!user) {
			console.log('✅ Login page: No user, staying on login page')
			if (typeof window !== 'undefined') {
				sessionStorage.removeItem('login-redirected')
			}
			return
		}

		console.log('🔄 Login page: User detected, redirecting...', user.role)

		// Immediate redirect without session check
		const searchParams = new URLSearchParams(window.location.search)
		const redirectUrl = searchParams.get('redirect')

		if (redirectUrl) {
			console.log('🔀 Redirecting to:', redirectUrl)
			router.replace(redirectUrl)
		} else {
			// Default redirect based on role
			let targetUrl = '/hackathons'
			if (user.role === "master") targetUrl = "/master"
			else if (user.role === "admin") targetUrl = "/admin/dashboard"
			else if (user.role === "judge") targetUrl = "/judge"
			else if (user.role === "supervisor") targetUrl = "/supervisor/dashboard"
			else if (user.role === "participant") targetUrl = "/participant/dashboard"

			console.log('🔀 Redirecting to:', targetUrl)
			router.replace(targetUrl)
		}
	}, [user, loading, router])

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoginError("")
		setIsSubmitting(true)
		try {
			const success = await login(loginEmail, loginPassword)
			if (!success) {
				setLoginError("بيانات الدخول غير صحيحة")
			} else {
				console.log('✅ Login successful, clearing redirect flag')
				// Clear the redirect flag to allow fresh redirect
				if (typeof window !== 'undefined') {
					sessionStorage.removeItem('login-redirected')
				}
			}
		} catch (err) {
			setLoginError("حدث خطأ أثناء تسجيل الدخول")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="w-full max-w-md"
			>
				<Card className="border border-slate-200 shadow-lg">
					<CardHeader className="space-y-4 text-center pb-8">
						<div className="mx-auto w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center">
							<LogIn className="w-8 h-8 text-white" />
						</div>
						<div>
							<CardTitle className="text-2xl font-bold text-slate-900">تسجيل الدخول</CardTitle>
							<CardDescription className="text-slate-600 mt-2">
								أدخل بياناتك للوصول إلى حسابك
							</CardDescription>
						</div>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleLogin} className="space-y-5">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-slate-700 font-medium">
									البريد الإلكتروني
								</Label>
								<Input
									id="email"
									type="email"
									value={loginEmail}
									onChange={(e) => setLoginEmail(e.target.value)}
									disabled={isSubmitting}
									className="border-slate-200 focus:border-slate-900 h-11"
									placeholder="example@email.com"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password" className="text-slate-700 font-medium">
									كلمة المرور
								</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										value={loginPassword}
										onChange={(e) => setLoginPassword(e.target.value)}
										disabled={isSubmitting}
										className="border-slate-200 focus:border-slate-900 h-11 pr-10"
										placeholder="••••••••"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										disabled={isSubmitting}
										className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
									>
										{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
									</button>
								</div>
							</div>

							{loginError && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className="bg-red-50 border border-red-200 rounded-lg p-3"
								>
									<p className="text-red-700 text-sm text-center">{loginError}</p>
								</motion.div>
							)}

							<Button
								type="submit"
								disabled={isSubmitting}
								className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base font-semibold"
							>
								{isSubmitting ? (
									<span className="flex items-center justify-center gap-2">
										<Loader2 className="w-5 h-5 animate-spin" />
										جاري تسجيل الدخول...
									</span>
								) : (
									<span className="flex items-center justify-center gap-2">
										<LogIn className="w-5 h-5" />
										تسجيل الدخول
									</span>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Footer */}
				<p className="text-center text-sm text-slate-600 mt-6">
					نظام إدارة الهاكاثونات © 2024
				</p>
			</motion.div>
		</div>
	)
}