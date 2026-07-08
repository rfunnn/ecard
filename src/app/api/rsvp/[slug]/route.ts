import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitKey } from "@/lib/rate-limit"

function hashIp(raw: string | null): string | undefined {
  if (!raw) return undefined
  // Take first IP in X-Forwarded-For chain, strip port, then SHA-256
  const ip = raw.split(",")[0].trim().replace(/:\d+$/, "")
  return createHash("sha256").update(ip).digest("hex")
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const card = await prisma.invitationCard.findUnique({
      where: { slug },
      select: { id: true, isPublished: true, wizardConfig: true },
    })
    if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (!card.isPublished) return NextResponse.json({ error: "Card not published" }, { status: 403 })

    // 3 RSVP submissions per IP per card per hour
    if (!rateLimit(rateLimitKey(req, `rsvp:${card.id}`), 3, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Terlalu banyak percubaan. Cuba lagi selepas 1 jam." }, { status: 429 })
    }

    const wCfg = card.wizardConfig as { rsvp?: { guestLimitPerRSVP?: number } } | null
    const guestLimitPerRSVP = wCfg?.rsvp?.guestLimitPerRSVP ?? 5

    const rsvpSchema = z.object({
      guestName: z.string().min(1).max(100),
      attendance: z.enum(["ATTENDING", "NOT_ATTENDING", "MAYBE"]),
      guestCount: z.number().int().min(1).max(guestLimitPerRSVP).default(1),
      message: z.string().max(500).optional(),
      phone: z.string().max(20).optional(),
    })

    const body = await req.json()
    const data = rsvpSchema.parse(body)

    const rsvp = await prisma.rSVP.create({
      data: { cardId: card.id, ...data },
    })

    await prisma.cardAnalytic.create({
      data: {
        cardId: card.id,
        event: "RSVP_SUBMIT",
        ipHash: hashIp(req.headers.get("x-forwarded-for")),
      },
    })

    return NextResponse.json({ rsvp }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to submit RSVP" }, { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const card = await prisma.invitationCard.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [rsvps, counts] = await Promise.all([
    prisma.rSVP.findMany({
      where: { cardId: card.id },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.rSVP.groupBy({
      by: ["attendance"],
      where: { cardId: card.id },
      _count: true,
      _sum: { guestCount: true },
    }),
  ])

  return NextResponse.json({ rsvps, counts })
}
