import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { PanduanClient } from "./PanduanClient"

export const dynamic = "force-dynamic"

export default async function PartnerPanduanPage() {
  const session = await getServerSession(authOptions)

  let partnerRate: number | null = null
  let partnerSlug: string | null = null
  let isPartner = false

  if (session?.user?.email) {
    const partner = await prisma.partner.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { partnerRate: true, slug: true },
    })
    if (partner) {
      isPartner = true
      partnerRate = partner.partnerRate
      partnerSlug = partner.slug
    }
  }

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "ekadku.com"

  return (
    <PanduanClient
      partnerRate={partnerRate}
      partnerSlug={partnerSlug}
      isPartner={isPartner}
      baseDomain={baseDomain}
    />
  )
}
