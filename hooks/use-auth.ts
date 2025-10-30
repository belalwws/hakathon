"use client"

import { useState, useEffect } from "react"

interface User {
	id: string
	name: string
	email: string
	role: "admin" | "judge" | "participant"
}

export function useAuth() {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Optionally, we could fetch "/api/me" if available to hydrate user from cookie
		setLoading(false)
	}, [])

	const login = async (email: string, password: string) => {
		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		})

		const data = await response.json()
		if (!response.ok) {
			throw new Error(data.error || "فشل في تسجيل الدخول")
		}

		setUser(data.user)
		return data
	}

	const logout = async () => {
		try {
			await fetch("/api/logout", { method: "POST" })
		} finally {
			setUser(null)
		}
	}

	const getAuthHeaders = () => {
		// We rely on httpOnly cookie for auth; no headers needed
		return {}
	}

	return {
		user,
		loading,
		login,
		logout,
		getAuthHeaders,
		isAdmin: user?.role === "admin",
		isJudge: user?.role === "judge",
		isParticipant: user?.role === "participant",
	}
} 