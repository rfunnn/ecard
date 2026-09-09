import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions)
  if (
    !session?.user?.email ||
    !ADMIN_EMAILS.includes(session.user.email.toLowerCase())
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params
  const card = await prisma.invitationCard.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 })

  await prisma.scrollConfig.upsert({
    where: { cardId: card.id },
    create: { cardId: card.id, autoScroll: true },
    update: { autoScroll: true },
  })

  return NextResponse.json({ ok: true })
}
