"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function JudgeRootRedirect() {
	const router = useRouter()
	useEffect(() => {
		router.replace("/judge/evaluation")
	}, [router])
	return null
}