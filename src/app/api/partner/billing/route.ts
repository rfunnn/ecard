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
    select: { id: true, status: true, partnerRate: true },
  })

  if (!partner) {
    return NextResponse.json({ error: "Bukan partner" }, { status: 403 })
  }

  const [usages, invoices] = await Promise.all([
    prisma.partnerUsage.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        cardId: true,
        packageName: true,
        partnerRateAtUsage: true,
        amount: true,
        billingPeriod: true,
        status: true,
        createdAt: true,
        card: { select: { slug: true, title: true } },
      },
    }),
    prisma.partnerInvoice.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        invoiceNumber: true,
        billingPeriodStart: true,
        billingPeriodEnd: true,
        subtotal: true,
        total: true,
        status: true,
        dueDate: true,
        issuedAt: true,
        paidAt: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
  ])

  return NextResponse.json({ usages, invoices, partnerRate: partner.partnerRate })
}
