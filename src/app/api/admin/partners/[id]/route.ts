import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)

const PARTNER_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"] as const
const BUSINESS_TYPES   = ["BUSINESS_CARD", "EVENT_SPACE", "EVENT_PLANNER", "VENDOR", "OTHERS"] as const

const updateSchema = z.object({
  status:             z.enum(PARTNER_STATUSES).optional(),
  partnerRate:        z.number().int().min(0).max(1000000).optional(),
  companyName:        z.string().min(1).max(120).optional(),
  contactPerson:      z.string().min(1).max(120).optional(),
  email:              z.string().email().optional(),
  phone:              z.string().min(1).max(30).optional(),
  businessType:       z.enum(BUSINESS_TYPES).optional(),
  slug:               z.string().min(2).max(60).regex(/^[a-z0-9-]+$/).optional(),
  logo:               z.string().url().optional().nullable(),
  address:            z.string().max(300).optional().nullable(),
  registrationNumber: z.string().max(60).optional().nullable(),
  website:            z.string().url().optional().nullable(),
  instagram:          z.string().max(60).optional().nullable(),
  facebook:           z.string().max(60).optional().nullable(),
})

type Context = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) return null
  return session
}

export async function GET(_req: NextRequest, { params }: Context) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const { status, partnerRate, ...rest } = data
    const hasChanges = status !== undefined || partnerRate !== undefined || Object.keys(rest).length > 0
    if (!hasChanges) return NextResponse.json({ error: "Tiada perubahan" }, { status: 400 })

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        ...(status      !== undefined ? { status }      : {}),
        ...(partnerRate !== undefined ? { partnerRate } : {}),
        ...rest,
      },
      select: { id: true, status: true, partnerRate: true },
    })

    return NextResponse.json({ partner })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 })
    }
    // Unique constraint violations (slug, email)
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Slug atau e-mel sudah digunakan" }, { status: 409 })
    }
    return NextResponse.json({ error: "Kemaskini gagal" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const partner = await prisma.partner.findUnique({
    where: { id },
    select: { _count: { select: { cards: true, usages: true, invoices: true } } },
  })

  if (!partner) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const total = partner._count.cards + partner._count.usages + partner._count.invoices
  if (total > 0) {
    return NextResponse.json(
      { error: `Tidak boleh padam — partner mempunyai ${total} rekod berkaitan (kad / penggunaan / invois)` },
      { status: 409 },
    )
  }

  await prisma.partner.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
