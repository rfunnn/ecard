import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const addSchema = z.object({
  imageUrl: z.string().min(1),
  caption: z.string().optional(),
})

const deleteSchema = z.object({
  id: z.string().min(1),
})

async function resolveCard(slug: string) {
  return prisma.invitationCard.findUnique({ where: { slug }, select: { id: true, userId: true } })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const card = await resolveCard(slug)
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const items = await prisma.photoItem.findMany({
    where: { cardId: card.id },
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json({ items })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await params
  try {
    const body = await req.json()
    const data = addSchema.parse(body)

    const card = await resolveCard(slug)
    if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (card.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const count = await prisma.photoItem.count({ where: { cardId: card.id } })
    const item = await prisma.photoItem.create({
      data: { ...data, cardId: card.id, sortOrder: count },
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to add photo" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await params
  try {
    const body = await req.json()
    const { id } = deleteSchema.parse(body)

    const card = await resolveCard(slug)
    if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (card.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await prisma.photoItem.delete({ where: { id, cardId: card.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}
