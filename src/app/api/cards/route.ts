import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/slug"
import { DEFAULT_THEME, DEFAULT_MEDIA, DEFAULT_SCROLL } from "@/types/invitation"
import { buildDemoWizardConfig, DEMO_YOUTUBE_URL, DEMO_YOUTUBE_VIDEO_ID, DEMO_GIFT_ITEMS } from "@/lib/demo-wizard-config"

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
        id: true,
        slug: true,
        title: true,
        groomName: true,
        brideName: true,
        language: true,
        isPublished: true,
        wizardConfig: true,
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
      select: { id: true, slug: true, defaultConfig: true },
    })
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    const tmplCfg = (template.defaultConfig ?? {}) as { primaryColor?: string; bgColor?: string; titleFont?: string }
    const wizardConfig = buildDemoWizardConfig(
      tmplCfg.primaryColor ?? "#9b4d5e",
      tmplCfg.bgColor      ?? "#faf7f4",
      tmplCfg.titleFont,
      template.slug,
    )

    let slug = generateSlug()
    let attempts = 0
    while (attempts < 5) {
      const existing = await prisma.invitationCard.findUnique({ where: { slug } })
      if (!existing) break
      slug = generateSlug()
      attempts++
    }

    const session = await getServerSession(authOptions)

    // A JWT session can outlive its User row — e.g. the DB was reset by
    // `prisma db push --accept-data-loss` on deploy while the browser kept a
    // valid session cookie. Writing that stale id would violate the userId
    // foreign key and fail the whole insert, so verify the user still exists.
    let userId: string | undefined
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
      })
      if (!user) {
        return NextResponse.json({ error: "SESSION_EXPIRED" }, { status: 401 })
      }
      userId = user.id

      const draftCount = await prisma.invitationCard.count({
        where: { userId, isPublished: false },
      })
      if (draftCount >= 3) {
        return NextResponse.json({ error: "DRAFT_LIMIT_EXCEEDED" }, { status: 403 })
      }
    }

    const card = await prisma.invitationCard.create({
      data: {
        slug,
        templateId: data.templateId,
        title: data.title,
        language: data.language,
        wizardConfig: wizardConfig as object,
        ...(userId ? { userId } : {}),
        theme: { create: { ...DEFAULT_THEME } },
        media: { create: { ...DEFAULT_MEDIA, youtubeUrl: DEMO_YOUTUBE_URL, youtubeVideoId: DEMO_YOUTUBE_VIDEO_ID } },
        scrollConfig: { create: { ...DEFAULT_SCROLL } },
        giftItems: { create: DEMO_GIFT_ITEMS.map((item) => ({ ...item })) },
      },
      include: {
        template: { select: { slug: true, name: true, category: true } },
        theme: true,
        media: true,
        scrollConfig: true,
        giftItems:  { orderBy: { sortOrder: "asc" } },
        photoItems: { orderBy: { sortOrder: "asc" } },
      },
    })

    return NextResponse.json({ card }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    console.error("POST /api/cards failed:", err)
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 })
  }
}
