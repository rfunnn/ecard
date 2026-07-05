import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$|^[a-z0-9]{3,60}$/

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const card = await prisma.invitationCard.findUnique({
    where: { slug, userId: session.user.id },
    select: { id: true },
  })
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let { newSlug } = await req.json() as { newSlug?: string }
  newSlug = (newSlug ?? "").trim().toLowerCase()

  if (!SLUG_RE.test(newSlug)) {
    return NextResponse.json(
      { error: "Link mesti 3–60 aksara, huruf kecil, nombor, dan sempang sahaja." },
      { status: 400 }
    )
  }

  if (newSlug === slug) {
    return NextResponse.json({ slug: newSlug })
  }

  const taken = await prisma.invitationCard.findUnique({
    where: { slug: newSlug },
    select: { id: true },
  })
  if (taken) {
    return NextResponse.json({ error: "Link ini sudah digunakan. Cuba yang lain." }, { status: 409 })
  }

  await prisma.invitationCard.update({
    where: { id: card.id },
    data: { slug: newSlug },
  })

  return NextResponse.json({ slug: newSlug })
}
