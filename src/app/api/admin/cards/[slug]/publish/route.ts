import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

const PACKAGE_LABELS: Record<string, string> = {
  basic:   "Basic (RM0)",
  pro:     "Pro (RM0)",
  premium: "Premium (RM0)",
}

const bodySchema = z.object({
  tier: z.enum(["basic", "pro", "premium"]).default("premium"),
})

export async function POST(
  req: NextRequest,
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
  const body = await req.json().catch(() => ({}))
  const { tier } = bodySchema.parse(body)

  const card = await prisma.invitationCard.findUnique({
    where: { slug },
    select: { id: true, isPublished: true, cardNum: true, wizardConfig: true },
  })
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 })
  if (card.isPublished) return NextResponse.json({ error: "Already published" }, { status: 409 })

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setMonth(expiresAt.getMonth() + 6)

  const agg = await prisma.invitationCard.aggregate({ _max: { cardNum: true } })
  const cardNum = (agg._max.cardNum ?? 0) + 1

  const currentConfig = (card.wizardConfig ?? {}) as Record<string, unknown>
  await prisma.invitationCard.update({
    where: { id: card.id },
    data: {
      isPublished: true,
      expiresAt,
      cardNum,
      wizardConfig: { ...currentConfig, packageType: PACKAGE_LABELS[tier] },
    },
  })

  return NextResponse.json({ ok: true })
}
