import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { fulfillPaidOrder } from "@/lib/checkout-fulfillment"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (
    !session?.user?.email ||
    !ADMIN_EMAILS.includes(session.user.email.toLowerCase())
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const ok = await fulfillPaidOrder(id)
  if (!ok) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
