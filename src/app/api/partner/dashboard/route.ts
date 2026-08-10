import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const partner = await prisma.partner.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, status: true },
  })

  if (!partner) {
    return NextResponse.json({ error: "Bukan partner" }, { status: 403 })
  }

  const [
    totalCards,
    uniqueCustomers,
    usages,
    invoiceCount,
  ] = await Promise.all([
    prisma.invitationCard.count({ where: { partnerId: partner.id } }),
    prisma.invitationCard.findMany({
      where: { partnerId: partner.id },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.partnerUsage.findMany({
      where: { partnerId: partner.id },
      select: { amount: true, status: true },
    }),
    prisma.partnerInvoice.count({ where: { partnerId: partner.id } }),
  ])

  const totalUsageAmount = usages.reduce((s, u) => s + u.amount, 0)
  const unbilledAmount   = usages.filter((u) => u.status === "UNBILLED").reduce((s, u) => s + u.amount, 0)
  const unbilledCount    = usages.filter((u) => u.status === "UNBILLED").length
  const invoicedAmount   = usages.filter((u) => u.status === "INVOICED").reduce((s, u) => s + u.amount, 0)

  return NextResponse.json({
    totalCards,
    totalCustomers: uniqueCustomers.length,
    totalUsageAmount,
    unbilledAmount,
    unbilledCount,
    invoicedAmount,
    invoiceCount,
  })
}
