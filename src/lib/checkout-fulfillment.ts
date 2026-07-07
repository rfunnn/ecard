import { prisma } from "@/lib/prisma"

// Mark an order paid and publish every card it contains. Idempotent: the
// callback and the return-url status check may both trigger fulfillment, and a
// customer may pay only once, so a second call after PAID is a safe no-op.
export async function fulfillPaidOrder(orderId: string, billCode?: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { cardId: true } } },
  })
  if (!order) return false
  if (order.status === "PAID") return true

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID", paidAt: new Date(), billCode: billCode || order.billCode },
    }),
    prisma.invitationCard.updateMany({
      where: { id: { in: order.items.map((i) => i.cardId) } },
      data: { isPublished: true },
    }),
  ])
  return true
}
