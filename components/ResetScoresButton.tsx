"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useModal } from "@/hooks/use-modal"

export default function ResetScoresButton() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const { showSuccess, showError, showConfirm, ModalComponents } = useModal()

	const onClick = async () => {
		if (loading) return

		showConfirm(
			"هل أنت متأكد من إعادة ضبط جميع التقييمات؟\n\nسيتم حذف جميع التقييمات والدرجات نهائياً!",
			async () => {
				setLoading(true)
				try {
					const res = await fetch("/api/admin/reset", { method: "POST" })
					const data = await res.json()
					if (!res.ok) throw new Error(data.error || "فشل إعادة الضبط")
					showSuccess("تم إعادة ضبط جميع التقييمات")
					router.refresh()
				} catch (e: any) {
					showError(e?.message || "حدث خطأ")
				} finally {
					setLoading(false)
				}
			},
			"⚠️ إعادة ضبط التقييمات",
			"إعادة ضبط",
			"إلغاء",
			"danger"
		)
	}

	return (
		<>
			<button onClick={onClick} disabled={loading} className="rounded border border-red-300 text-red-700 hover:bg-red-50 px-3 py-2 disabled:opacity-60">
				{loading ? "جاري إعادة الضبط..." : "إعادة ضبط التقييمات"}
			</button>

			{/* Modal Components */}
			<ModalComponents />
		</>
	)
}