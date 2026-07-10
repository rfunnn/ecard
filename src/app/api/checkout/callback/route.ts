import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseToyyibpayCallback, verifyToyyibpayBillPaid } from "@/lib/toyyibpay"
import { fulfillPaidOrder } from "@/lib/checkout-fulfillment"

// Toyyibpay calls this endpoint (application/x-www-form-urlencoded POST)
// after every payment attempt (success or failure).
export async function POST(req: NextRequest) {
  // Guard with a shared secret embedded in the callback URL (?secret=...).
  // Set TOYYIBPAY_CALLBACK_SECRET in env and it will be appended to billCallbackUrl
  // at bill-creation time. Rejects any POST that doesn't carry the correct token,
  // blocking unauthenticated DOS/spoofing attempts without an IP allowlist.
  const callbackSecret = process.env.TOYYIBPAY_CALLBACK_SECRET
  if (callbackSecret) {
    const provided = new URL(req.url).searchParams.get("secret")
    if (provided !== callbackSecret) {
      console.warn("[callback] Rejected request with missing/invalid callback secret")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  try {
    const body = await req.text()
    const { orderId, status } = parseToyyibpayCallback(body)

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Idempotency: skip if already processed
    if (order.status === "PAID") {
      return NextResponse.json({ ok: true })
    }

    // Toyyibpay status codes: 1 = success, 2 = pending, 3 = unsuccessful, 4 = pending.
    if (status === "1") {
      // Always verify against the billCode stored in the DB — never trust the one
      // from the callback body, which an attacker could substitute with their own
      // paid billCode to fulfill someone else's order for free.
      const paid = await verifyToyyibpayBillPaid(order.billCode || "", order.totalAmount)
      if (paid) {
        await fulfillPaidOrder(order.id)
      } else {
        console.warn(`[callback] Verification failed for order ${order.id} (billCode=${order.billCode})`)
      }
    } else if (status === "3") {
      // Unsuccessful — mark failed. A later successful callback can still flip it
      // to PAID (the idempotency guard only short-circuits once PAID).
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      })
    }
    // status === "2" or "4" = pending — do nothing, wait for the final callback

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[callback] Toyyibpay callback error:", err)
    return NextResponse.json({ error: "Callback error" }, { status: 500 })
  }
}
