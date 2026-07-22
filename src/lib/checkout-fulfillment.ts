import { prisma } from "@/lib/prisma"
import { sendOrderNotification } from "@/lib/email"
import { getPackageTier } from "@/types/config"

const UPGRADE_PACKAGE_LABEL: Record<string, string> = {
  silver: "Silver (RM40)",
  gold:   "Gold (RM60)",
}

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
  const newExpiresAt = new Date(paidAt)
  newExpiresAt.setMonth(newExpiresAt.getMonth() + 6)

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID", paidAt, billCode: billCode || order.billCode },
    })
    const agg = await tx.invitationCard.aggregate({ _max: { cardNum: true } })
    let nextNum = (agg._max.cardNum ?? 0) + 1
    for (const item of order.items) {
      if (item.package === "renewal") {
        // Extend expiry by 6 months from current expiry (if still in future) or from now
        const existing = await tx.invitationCard.findUnique({
          where: { id: item.cardId },
          select: { expiresAt: true },
        })
        const baseDate =
          existing?.expiresAt && existing.expiresAt > paidAt ? existing.expiresAt : paidAt
        const renewedExpiry = new Date(baseDate)
        renewedExpiry.setMonth(renewedExpiry.getMonth() + 6)
        await tx.invitationCard.update({
          where: { id: item.cardId },
          data: { expiresAt: renewedExpiry },
        })
      } else if (item.package.startsWith("upgrade-")) {
        // Upgrade package tier: update wizardConfig.packageType on the published card
        const targetTier = item.package.replace("upgrade-", "")
        const newLabel   = UPGRADE_PACKAGE_LABEL[targetTier]
        if (newLabel) {
          const existing = await tx.invitationCard.findUnique({
            where: { id: item.cardId },
            select: { wizardConfig: true },
          })
          const currentConfig = (existing?.wizardConfig ?? {}) as Record<string, unknown>
          const currentTier   = getPackageTier((currentConfig.packageType as string | undefined) ?? "")
          // Only apply if it's actually an upgrade
          const tierRank = { bronze: 0, silver: 1, gold: 2 }
          if ((tierRank[targetTier as keyof typeof tierRank] ?? -1) > (tierRank[currentTier] ?? -1)) {
            await tx.invitationCard.update({
              where: { id: item.cardId },
              data: { wizardConfig: { ...currentConfig, packageType: newLabel } },
            })
          }
        }
      } else {
        await tx.invitationCard.updateMany({
          where: { id: item.cardId, cardNum: null },
          data: { isPublished: true, expiresAt: newExpiresAt, cardNum: nextNum++ },
        })
      }
    }
  })

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
