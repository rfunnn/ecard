import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const revalidate = 300

export async function GET() {
  const partners = await prisma.partner.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, companyName: true, logo: true, slug: true },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json({ partners })
}
