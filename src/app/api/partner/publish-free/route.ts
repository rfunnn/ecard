import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { cardSlug } = (await req.json()) as { cardSlug: string }
  if (!cardSlug) return NextResponse.json({ error: "No card specified" }, { status: 400 })

  const card = await prisma.invitationCard.findUnique({
    where: { slug: cardSlug, userId: session.user.id },
    select: { id: true, isPublished: true, partnerId: true, wizardConfig: true },
  })
  if (!card)           return NextResponse.json({ error: "Card not found" }, { status: 404 })
  if (card.isPublished) return NextResponse.json({ error: "Already published" }, { status: 409 })
  if (!card.partnerId)  return NextResponse.json({ error: "No partner attribution" }, { status: 400 })

  const partner = await prisma.partner.findUnique({
    where: { id: card.partnerId, status: "ACTIVE" },
    select: { id: true, partnerRate: true },
  })
  if (!partner) return NextResponse.json({ error: "Partner not active" }, { status: 403 })

  const existingQuota = await prisma.partnerClientQuota.findUnique({
    where: { partnerId_userId: { partnerId: card.partnerId, userId: session.user.id } },
  })
  if (existingQuota) return NextResponse.json({ error: "Free quota already used" }, { status: 409 })

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setMonth(expiresAt.getMonth() + 6)
  const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const agg = await prisma.invitationCard.aggregate({ _max: { cardNum: true } })
  const cardNum = (agg._max.cardNum ?? 0) + 1

  const currentConfig = (card.wizardConfig ?? {}) as Record<string, unknown>

  await prisma.$transaction([
    prisma.invitationCard.update({
      where: { id: card.id },
      data: {
        isPublished: true,
        expiresAt,
        cardNum,
        wizardConfig: { ...currentConfig, packageType: "Premium (RM0)" },
      },
    }),
    prisma.partnerClientQuota.create({
      data: { partnerId: card.partnerId, userId: session.user.id, cardId: card.id },
    }),
    prisma.partnerUsage.create({
      data: {
        partnerId:          card.partnerId,
        cardId:             card.id,
        packageName:        "premium",
        partnerRateAtUsage: partner.partnerRate,
        amount:             partner.partnerRate,
        billingPeriod,
      },
    }),
  ])

  return NextResponse.json({ ok: true, cardNum })
}
