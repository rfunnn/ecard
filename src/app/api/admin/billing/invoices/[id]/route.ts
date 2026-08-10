import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)

const INVOICE_STATUSES = ["DRAFT", "ISSUED", "PAID", "OVERDUE", "VOID"] as const

const updateSchema = z.object({
  status: z.enum(INVOICE_STATUSES),
})

type Context = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { status } = updateSchema.parse(body)

    const existing = await prisma.partnerInvoice.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Invois tidak dijumpai" }, { status: 404 })
    }

    const data: Record<string, unknown> = { status }
    if (status === "PAID" && existing.status !== "PAID") {
      data.paidAt = new Date()
    }
    if (status === "ISSUED" && !data.issuedAt) {
      data.issuedAt = new Date()
    }

    const invoice = await prisma.partnerInvoice.update({
      where: { id },
      data,
      select: { id: true, status: true, invoiceNumber: true },
    })

    // When marking paid, update all associated usage records too
    if (status === "PAID") {
      await prisma.partnerUsage.updateMany({
        where: {
          invoiceItem: { invoiceId: id },
          status: "INVOICED",
        },
        data: { status: "PAID" },
      })
    }

    // When voiding, revert usage records back to UNBILLED
    if (status === "VOID") {
      await prisma.partnerUsage.updateMany({
        where: {
          invoiceItem: { invoiceId: id },
          status: { in: ["INVOICED"] },
        },
        data: { status: "UNBILLED" },
      })
    }

    return NextResponse.json({ invoice })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Kemaskini gagal" }, { status: 500 })
  }
}
