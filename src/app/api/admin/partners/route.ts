import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import type { PartnerStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)

const PER_PAGE = 25
const VALID_STATUSES: PartnerStatus[] = ["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1)
  const statusParam = searchParams.get("status") as PartnerStatus | null
  const statusFilter = statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : undefined

  const where = statusFilter ? { status: statusFilter } : {}

  const [total, partners] = await Promise.all([
    prisma.partner.count({ where }),
    prisma.partner.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        slug: true,
        companyName: true,
        contactPerson: true,
        email: true,
        phone: true,
        businessType: true,
        status: true,
        partnerRate: true,
        createdAt: true,
      },
    }),
  ])

  return NextResponse.json({ partners, total, page, totalPages: Math.ceil(total / PER_PAGE) })
}
