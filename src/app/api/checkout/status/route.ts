import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { verifyToyyibpayBillPaid } from "@/lib/toyyibpay"
import { fulfillPaidOrder } from "@/lib/checkout-fulfillment"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orderId = new URL(req.url).searchParams.get("orderId")
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  let order = await prisma.order.findUnique({
    where: { id: orderId, userId: session.user.id },
    include: {
      items: {
        include: {
          card: { select: { slug: true, cardNum: true, groomName: true, brideName: true, title: true } },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Self-heal: the success page hits this right after the payer returns, which
  // can be before Toyyibpay's callback lands (or if the callback was missed).
  // Verify server-to-server and fulfill so the card publishes without waiting.
  if (order.status === "PENDING" && order.billCode) {
    const paid = await verifyToyyibpayBillPaid(order.billCode, order.totalAmount)
    if (paid) {
      await fulfillPaidOrder(order.id, order.billCode)
      order = await prisma.order.findUnique({
        where: { id: orderId, userId: session.user.id },
        include: {
          items: {
            include: {
              card: { select: { slug: true, cardNum: true, groomName: true, brideName: true, title: true } },
            },
          },
        },
      })
    }
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({
    status: order.status,
    totalAmount: order.totalAmount,
    paidAt: order.paidAt,
    cards: order.items.map((i) => ({
      slug:    i.card.slug,
      cardNum: i.card.cardNum,
      name:    i.card.groomName && i.card.brideName
        ? `${i.card.groomName} & ${i.card.brideName}`
        : i.card.title,
      package: i.package,
      amount:  i.amount,
    })),
  })
}
