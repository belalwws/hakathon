"use client"

import { useState, useEffect } from "react"
import Cookies from "js-cookie"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "judge"
}

function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const base64 = token.split(".")[1]
    if (!base64) return null
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
    const json = typeof window !== "undefined" ? atob(padded) : Buffer.from(padded, "base64").toString("utf8")
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get("auth-token")
    if (token) {
      const payload = decodeJwtPayload<{ userId: string; name: string; email: string; role: User["role"] }>(token)
      if (payload) {
        setUser({
          id: payload.userId,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        })
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "فشل في تسجيل الدخول")
    }

    // Store token in cookie
    Cookies.set("auth-token", data.token, { expires: 1 }) // 1 day
    setUser(data.user)

    return data
  }

  const logout = () => {
    Cookies.remove("auth-token")
    setUser(null)
  }

  const getAuthHeaders = () => {
    const token = Cookies.get("auth-token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  return {
    user,
    loading,
    login,
    logout,
    getAuthHeaders,
    isAdmin: user?.role === "admin",
    isJudge: user?.role === "judge",
  }
}
