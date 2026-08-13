import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const cards = await prisma.invitationCard.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id:          true,
      slug:        true,
      cardNum:     true,
      title:       true,
      groomName:   true,
      brideName:   true,
      isPublished: true,
      expiresAt:   true,
      language:    true,
      viewCount:   true,
      updatedAt:   true,
      createdAt:   true,
      eventDate:   true,
      wizardConfig:true,
      partnerId:   true,
      template:    { select: { name: true, nameMs: true, category: true, image1Url: true, image2Url: true } },
      theme:       { select: { primaryColor: true, bgColor: true, bodyColor: true } },
    },
  })

  // Determine which partner-attributed unpublished cards are eligible for free publish
  const partnerIds = [...new Set(cards.filter(c => c.partnerId && !c.isPublished).map(c => c.partnerId!))]
  let freeEligiblePartnerIds = new Set<string>()

  if (partnerIds.length > 0) {
    const [activePartners, usedQuotas] = await Promise.all([
      prisma.partner.findMany({
        where: { id: { in: partnerIds }, status: "ACTIVE" },
        select: { id: true },
      }),
      prisma.partnerClientQuota.findMany({
        where: { partnerId: { in: partnerIds }, userId: session.user.id },
        select: { partnerId: true },
      }),
    ])
    const activeSet = new Set(activePartners.map(p => p.id))
    const usedSet   = new Set(usedQuotas.map(q => q.partnerId))
    freeEligiblePartnerIds = new Set([...activeSet].filter(id => !usedSet.has(id)))
  }

  const result = cards.map(c => ({
    ...c,
    partnerFreeEligible: !!c.partnerId && !c.isPublished && freeEligiblePartnerIds.has(c.partnerId),
  }))

  return NextResponse.json({ cards: result })
}
