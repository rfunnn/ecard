import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const rsvpSchema = z.object({
  guestName: z.string().min(1).max(100),
  attendance: z.enum(["ATTENDING", "NOT_ATTENDING", "MAYBE"]),
  guestCount: z.number().int().min(1).max(20).default(1),
  message: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const card = await prisma.invitationCard.findUnique({
      where: { slug },
      select: { id: true, isPublished: true },
    })
    if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (!card.isPublished) return NextResponse.json({ error: "Card not published" }, { status: 403 })

    const body = await req.json()
    const data = rsvpSchema.parse(body)

    const rsvp = await prisma.rSVP.create({
      data: { cardId: card.id, ...data },
    })

    await prisma.cardAnalytic.create({
      data: {
        cardId: card.id,
        event: "RSVP_SUBMIT",
        ipHash: req.headers.get("x-forwarded-for") ?? undefined,
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
