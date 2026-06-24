import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameMs: z.string().optional(),
  slug: z.string().optional(),
  category: z.enum(["WEDDING", "BIRTHDAY", "CORPORATE", "GENERIC"]).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  image1Url: z.string().optional().nullable(),
  image2Url: z.string().optional().nullable(),
  displayConfig: z.record(z.string(), z.unknown()).optional().nullable(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const template = await prisma.template.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ template })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const existing = await prisma.template.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.template.findFirst({
        where: { name: data.name, NOT: { id } },
        select: { id: true },
      })
      if (nameConflict) {
        return NextResponse.json({ error: "Template name already exists" }, { status: 409 })
      }
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.template.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      })
      if (slugConflict) {
        return NextResponse.json({ error: "Slug already in use" }, { status: 409 })
      }
    }

    // If image1Url changes and thumbnail was previously set to the old image1Url, keep them in sync
    const thumbnailUpdate =
      data.image1Url !== undefined && existing.thumbnail === (existing.image1Url ?? "")
        ? { thumbnail: data.image1Url ?? "" }
        : {}

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.nameMs !== undefined ? { nameMs: data.nameMs } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.category !== undefined ? { category: data.category as never } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.image1Url !== undefined ? { image1Url: data.image1Url } : {}),
        ...(data.image2Url !== undefined ? { image2Url: data.image2Url } : {}),
        ...(data.displayConfig !== undefined
          ? { displayConfig: data.displayConfig ? (data.displayConfig as Prisma.InputJsonValue) : Prisma.DbNull }
          : {}),
        ...thumbnailUpdate,
      },
    })

    return NextResponse.json({ template })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const force = new URL(req.url).searchParams.get("force") === "true"
  try {
    const template = await prisma.template.findUnique({
      where: { id },
      include: { _count: { select: { cards: true } } },
    })
    if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (template._count.cards > 0) {
      if (!force) {
        return NextResponse.json(
          {
            error: `Cannot delete: ${template._count.cards} card(s) use this template`,
            cardCount: template._count.cards,
            canForce: true,
          },
          { status: 409 }
        )
      }
      // Delete non-cascading children first, then cards
      const cardIds = await prisma.invitationCard.findMany({
        where: { templateId: id },
        select: { id: true },
      }).then((rows) => rows.map((r) => r.id))

      await prisma.rSVP.deleteMany({ where: { cardId: { in: cardIds } } })
      await prisma.cardAnalytic.deleteMany({ where: { cardId: { in: cardIds } } })
      await prisma.invitationCard.deleteMany({ where: { templateId: id } })
    }
    await prisma.template.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}
