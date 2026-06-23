import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/slug"
import { DEFAULT_THEME, DEFAULT_MEDIA, DEFAULT_SCROLL } from "@/types/invitation"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slugsParam = searchParams.get("slugs")
  if (!slugsParam) return NextResponse.json({ cards: [] })

  const slugs = slugsParam.split(",").filter(Boolean).slice(0, 20)

  try {
    const cards = await prisma.invitationCard.findMany({
      where: { slug: { in: slugs } },
      orderBy: { updatedAt: "desc" },
      select: {
        slug: true,
        title: true,
        groomName: true,
        brideName: true,
        language: true,
        updatedAt: true,
        template: { select: { name: true, nameMs: true, category: true } },
        theme: { select: { primaryColor: true, bgColor: true } },
      },
    })
    return NextResponse.json({ cards })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

const createCardSchema = z.object({
  templateId: z.string().min(1),
  title: z.string().min(1).default("Jemputan"),
  language: z.enum(["ms", "en"]).default("ms"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createCardSchema.parse(body)

    const template = await prisma.template.findUnique({
      where: { id: data.templateId },
    })
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    let slug = generateSlug()
    let attempts = 0
    while (attempts < 5) {
      const existing = await prisma.invitationCard.findUnique({ where: { slug } })
      if (!existing) break
      slug = generateSlug()
      attempts++
    }

    const session = await getServerSession(authOptions)

    const card = await prisma.invitationCard.create({
      data: {
        slug,
        templateId: data.templateId,
        title: data.title,
        language: data.language,
        ...(session?.user?.id ? { userId: session.user.id } : {}),
        theme: { create: { ...DEFAULT_THEME } },
        media: { create: { ...DEFAULT_MEDIA } },
        scrollConfig: { create: { ...DEFAULT_SCROLL } },
      },
      include: {
        template: { select: { slug: true, name: true, category: true } },
        theme: true,
        media: true,
        scrollConfig: true,
      },
    })

    return NextResponse.json({ card }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 })
  }
}
