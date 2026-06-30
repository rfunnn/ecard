import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseToyyibpayCallback } from "@/lib/toyyibpay"

// Toyyibpay calls this endpoint (application/x-www-form-urlencoded POST)
// after every payment attempt (success or failure)
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const { refno, status, billcode } = parseToyyibpayCallback(body)

    if (!refno) {
      return NextResponse.json({ error: "Missing refno" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: refno },
      include: { items: { select: { cardId: true } } },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Idempotency: skip if already processed
    if (order.status === "PAID") {
      return NextResponse.json({ ok: true })
    }

    if (status === "1") {
      // Payment successful — publish all cards in the order
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID", paidAt: new Date(), billCode: billcode || order.billCode },
        }),
        prisma.invitationCard.updateMany({
          where: { id: { in: order.items.map((i) => i.cardId) } },
          data:  { isPublished: true },
        }),
      ])
    } else if (status === "3") {
      await prisma.order.update({
        where: { id: order.id },
        data:  { status: "FAILED" },
      })
    }
    // status === "2" = pending — do nothing, wait for final status

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Callback error" }, { status: 500 })
  }
}
