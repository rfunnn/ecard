import { prisma } from "@/lib/prisma"
import { sendOrderNotification } from "@/lib/email"

// Mark an order paid and publish every card it contains. Idempotent: the
// callback and the return-url status check may both trigger fulfillment, and a
// customer may pay only once, so a second call after PAID is a safe no-op.
export async function fulfillPaidOrder(orderId: string, billCode?: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true, name: true } },
      items: {
        select: {
          cardId: true,
          package: true,
          amount: true,
          card: { select: { slug: true, title: true, groomName: true, brideName: true } },
        },
      },
    },
  })
  if (!order) return false
  if (order.status === "PAID") return true

  const paidAt = new Date()
  const expiresAt = new Date(paidAt)
  expiresAt.setMonth(expiresAt.getMonth() + 6)

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID", paidAt, billCode: billCode || order.billCode },
    }),
    prisma.invitationCard.updateMany({
      where: { id: { in: order.items.map((i) => i.cardId) } },
      data: { isPublished: true, expiresAt },
    }),
  ])

  // Fire-and-forget — email failure must never block fulfillment
  sendOrderNotification({
    orderId: order.id,
    userEmail: order.user.email,
    userName: order.user.name,
    totalAmount: order.totalAmount,
    paidAt,
    items: order.items.map((i) => ({
      package: i.package,
      amount: i.amount,
      card: i.card,
    })),
  }).catch((err) => console.error("[email] Order notification failed:", err))

  return true
}
