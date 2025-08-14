"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function JudgeRootRedirect() {
	const router = useRouter()
	useEffect(() => {
		router.replace("/judge/select")
	}, [router])
	return null
} 