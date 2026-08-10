import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Context = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Context) {
  const { slug } = await params

  const partner = await prisma.partner.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      companyName: true,
      contactPerson: true,
      businessType: true,
      logo: true,
      address: true,
      website: true,
      instagram: true,
      facebook: true,
      status: true,
      // Bank info is never returned by this public endpoint
    },
  })

  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 })
  }

  return NextResponse.json({ partner })
}
