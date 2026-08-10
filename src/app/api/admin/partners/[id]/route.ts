import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)

const PARTNER_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"] as const

const updateSchema = z.object({
  status:      z.enum(PARTNER_STATUSES).optional(),
  partnerRate: z.number().int().min(0).max(1000000).optional(),
})

type Context = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const partner = await prisma.partner.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      companyName: true,
      contactPerson: true,
      email: true,
      phone: true,
      businessType: true,
      logo: true,
      address: true,
      registrationNumber: true,
      website: true,
      instagram: true,
      facebook: true,
      status: true,
      partnerRate: true,
      createdAt: true,
      _count: { select: { cards: true, orders: true, usages: true } },
    },
  })

  if (!partner) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ partner })
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    if (!data.status && data.partnerRate === undefined) {
      return NextResponse.json({ error: "Tiada perubahan" }, { status: 400 })
    }

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        ...(data.status      !== undefined ? { status: data.status } : {}),
        ...(data.partnerRate !== undefined ? { partnerRate: data.partnerRate } : {}),
      },
      select: {
        id: true,
        status: true,
        partnerRate: true,
      },
    })

    return NextResponse.json({ partner })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Kemaskini gagal" }, { status: 500 })
  }
}
