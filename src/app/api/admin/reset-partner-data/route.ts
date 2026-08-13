import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

// ONE-TIME TEST RESET — delete this file after use.
// Clears all partner records and nulls partner attribution on users/cards.
// Admin-only.

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase())
  if (!token?.email || !adminEmails.includes((token.email as string).toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [
    invoiceItems,
    invoices,
    quotas,
    usages,
    usersReset,
    cardsReset,
    partners,
  ] = await prisma.$transaction([
    prisma.partnerInvoiceItem.deleteMany({}),
    prisma.partnerInvoice.deleteMany({}),
    prisma.partnerClientQuota.deleteMany({}),
    prisma.partnerUsage.deleteMany({}),
    prisma.user.updateMany({ where: { partnerOriginId: { not: null } }, data: { partnerOriginId: null } }),
    prisma.invitationCard.updateMany({ where: { partnerId: { not: null } }, data: { partnerId: null } }),
    prisma.partner.deleteMany({}),
  ])

  return NextResponse.json({
    ok: true,
    deleted: {
      invoiceItems: invoiceItems.count,
      invoices:     invoices.count,
      quotas:       quotas.count,
      usages:       usages.count,
      usersReset:   usersReset.count,
      cardsReset:   cardsReset.count,
      partners:     partners.count,
    },
  })
}
