import { type NextRequest } from "next/server"

// Delegate to unified auth login route to avoid Prisma import and duplicate logic
export async function POST(request: NextRequest) {
  const { POST: authPost } = await import("../auth/login/route")
  return authPost(request)
}

export const dynamic = "force-dynamic"

