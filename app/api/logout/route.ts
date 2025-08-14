import { NextResponse } from "next/server"

export async function POST() {
	const response = NextResponse.json({ message: "تم تسجيل الخروج" })
	response.cookies.set("auth-token", "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 0,
	})
	return response
}

export const dynamic = "force-dynamic" 