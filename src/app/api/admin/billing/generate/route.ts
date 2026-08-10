import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)

const generateSchema = z.object({
  partnerId:     z.string().min(1),
  billingPeriod: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM"),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { partnerId, billingPeriod } = generateSchema.parse(body)

    const unbilledUsages = await prisma.partnerUsage.findMany({
      where: { partnerId, billingPeriod, status: "UNBILLED" },
    })

    if (unbilledUsages.length === 0) {
      return NextResponse.json({ error: "Tiada penggunaan belum dibilkan untuk tempoh ini" }, { status: 400 })
    }

    const subtotal = unbilledUsages.reduce((s, u) => s + u.amount, 0)
    const [year, month] = billingPeriod.split("-").map(Number)
    const periodStart = new Date(year, month - 1, 1)
    const periodEnd   = new Date(year, month, 0, 23, 59, 59)
    const dueDate     = new Date(year, month, 14)

    const invoiceCount = await prisma.partnerInvoice.count()
    const invoiceNumber = `INV-${billingPeriod}-${String(invoiceCount + 1).padStart(4, "0")}`

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.partnerInvoice.create({
        data: {
          partnerId,
          invoiceNumber,
          billingPeriodStart: periodStart,
          billingPeriodEnd:   periodEnd,
          subtotal,
          total: subtotal,
          status: "ISSUED",
          issuedAt: new Date(),
          dueDate,
        },
      })

      await tx.partnerInvoiceItem.createMany({
        data: unbilledUsages.map((u) => ({
          invoiceId: inv.id,
          usageId:   u.id,
          amount:    u.amount,
        })),
      })

      await tx.partnerUsage.updateMany({
        where: { id: { in: unbilledUsages.map((u) => u.id) } },
        data: { status: "INVOICED" },
      })

      return inv
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Jana invois gagal" }, { status: 500 })
  }
}
