import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [cards, user] = await Promise.all([
    prisma.invitationCard.findMany({
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
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { partnerOriginId: true },
    }),
  ])

  // For unpublished cards: use the card's partnerId if set, otherwise fall back
  // to the user's registered partner origin (covers cards created before feature
  // rollout or before the cookie was read during card creation).
  const effectivePartnerId = (card: { partnerId: string | null }) =>
    card.partnerId ?? user?.partnerOriginId ?? null

  const candidatePartnerIds = [
    ...new Set(
      cards
        .filter(c => !c.isPublished)
        .map(c => effectivePartnerId(c))
        .filter((id): id is string => !!id)
    ),
  ]

  let freeEligiblePartnerIds = new Set<string>()

  if (candidatePartnerIds.length > 0) {
    const [activePartners, usedQuotas] = await Promise.all([
      prisma.partner.findMany({
        where: { id: { in: candidatePartnerIds }, status: "ACTIVE" },
        select: { id: true },
      }),
      prisma.partnerClientQuota.findMany({
        where: { partnerId: { in: candidatePartnerIds }, userId: session.user.id },
        select: { partnerId: true },
      }),
    ])
    const activeSet = new Set(activePartners.map(p => p.id))
    const usedSet   = new Set(usedQuotas.map(q => q.partnerId))
    freeEligiblePartnerIds = new Set([...activeSet].filter(id => !usedSet.has(id)))
  }

  const result = cards.map(c => {
    const pid = effectivePartnerId(c)
    return {
      ...c,
      // Expose the resolved partner ID to the client so publish-free can use it
      partnerId: pid,
      partnerFreeEligible: !!pid && !c.isPublished && freeEligiblePartnerIds.has(pid),
    }
  })

  return NextResponse.json({ cards: result })
}
