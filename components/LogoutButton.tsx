"use client"

import { useRouter } from "next/navigation"

export default function LogoutButton() {
	const router = useRouter()
	const onClick = async () => {
		try {
			await fetch("/api/logout", { method: "POST" })
			router.push("/login")
			router.refresh()
		} catch (e) {
			// ignore
		}
	}
	return (
		<button onClick={onClick} className="rounded bg-gray-900 px-3 py-2 text-white hover:bg-black">
			تسجيل الخروج
		</button>
	)
} 