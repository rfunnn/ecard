import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createHash } from "crypto"

const eventSchema = z.object({
  event: z.enum(["VIEW", "RSVP_OPEN", "RSVP_SUBMIT", "MAP_CLICK", "WHATSAPP_CLICK", "MUSIC_PLAY"]),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const card = await prisma.invitationCard.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await req.json()
    const { event } = eventSchema.parse(body)

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16)

    await prisma.cardAnalytic.create({
      data: {
        cardId: card.id,
        event,
        ipHash,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const card = await prisma.invitationCard.findUnique({
    where: { slug },
    select: { id: true, viewCount: true },
  })
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const events = await prisma.cardAnalytic.groupBy({
    by: ["event"],
    where: { cardId: card.id },
    _count: true,
  })

  return NextResponse.json({
    viewCount: card.viewCount,
    events: Object.fromEntries(events.map((e) => [e.event, e._count])),
  })
}
