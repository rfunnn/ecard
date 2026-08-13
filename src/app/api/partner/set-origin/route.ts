import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// Called once from the dashboard after sign-in to stamp partnerOriginId on the
// user if they arrived via a partner subdomain. Safe to call multiple times —
// only writes when the user has no origin set yet and the cookie is present.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const partnerSlug = req.cookies.get("ekadku_partner")?.value
  if (!partnerSlug) return NextResponse.json({ ok: false })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { partnerOriginId: true },
  })
  // Already attributed — do nothing
  if (user?.partnerOriginId) return NextResponse.json({ ok: true })

  const partner = await prisma.partner.findUnique({
    where: { slug: partnerSlug, status: "ACTIVE" },
    select: { id: true },
  })
  if (!partner) return NextResponse.json({ ok: false })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { partnerOriginId: partner.id },
  })

  return NextResponse.json({ ok: true })
}
