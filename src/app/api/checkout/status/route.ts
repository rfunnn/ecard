import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orderId = new URL(req.url).searchParams.get("orderId")
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId, userId: session.user.id },
    include: {
      items: {
        include: {
          card: { select: { slug: true, groomName: true, brideName: true, title: true } },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({
    status: order.status,
    totalAmount: order.totalAmount,
    paidAt: order.paidAt,
    cards: order.items.map((i) => ({
      slug:    i.card.slug,
      name:    i.card.groomName && i.card.brideName
        ? `${i.card.groomName} & ${i.card.brideName}`
        : i.card.title,
      package: i.package,
      amount:  i.amount,
    })),
  })
}
