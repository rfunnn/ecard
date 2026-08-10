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
    },
  })

  if (!partner) {
    return NextResponse.json({ partner: null }, { status: 200 })
  }

  return NextResponse.json({ partner })
}
