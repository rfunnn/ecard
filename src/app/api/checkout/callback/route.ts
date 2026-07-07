import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseToyyibpayCallback, verifyToyyibpayBillPaid } from "@/lib/toyyibpay"
import { fulfillPaidOrder } from "@/lib/checkout-fulfillment"

// Toyyibpay calls this endpoint (application/x-www-form-urlencoded POST)
// after every payment attempt (success or failure).
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const { orderId, status, billcode } = parseToyyibpayCallback(body)

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
      // Never trust the callback body alone — a spoofed POST could publish cards
      // for free. Confirm the payment server-to-server before fulfilling.
      const paid = await verifyToyyibpayBillPaid(billcode || order.billCode || "")
      if (paid) {
        await fulfillPaidOrder(order.id, billcode)
      } else {
        console.warn(`Toyyibpay callback claimed success but verification failed for order ${order.id}`)
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
    console.error("Toyyibpay callback error:", err)
    return NextResponse.json({ error: "Callback error" }, { status: 500 })
  }
}
