"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

type Role = "admin" | "judge"

interface User {
	id: string
	name: string
	email: string
	role: Role
}

interface AuthContextValue {
	user: User | null
	login: (email: string, password: string) => Promise<boolean>
	logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)

	const login = useCallback(async (email: string, password: string) => {
		try {
			const res = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			})
			const data = await res.json()
			if (!res.ok) return false
			setUser(data.user as User)
			return true
		} catch {
			return false
		}
	}, [])

	const logout = useCallback(async () => {
		try {
			await fetch("/api/logout", { method: "POST" })
		} finally {
			setUser(null)
		}
	}, [])

	return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error("useAuth must be used within AuthProvider")
	return ctx
} 