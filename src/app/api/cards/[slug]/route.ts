import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { extractYoutubeVideoId } from "@/lib/youtube"

const updateSchema = z.object({
  title: z.string().optional(),
  groomName: z.string().optional().nullable(),
  brideName: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  eventDate: z.string().optional().nullable(),
  eventTime: z.string().optional().nullable(),
  venueName: z.string().optional().nullable(),
  venueAddress: z.string().optional().nullable(),
  venueMapUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  footerNote: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  password: z.string().optional().nullable(),
  language: z.enum(["ms", "en"]).optional(),
  theme: z
    .object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      bgColor: z.string().optional(),
      titleFont: z.string().optional(),
      bodyFont: z.string().optional(),
      titleSize: z.number().min(12).max(72).optional(),
      bodySize: z.number().min(10).max(32).optional(),
      titleColor: z.string().optional(),
      bodyColor: z.string().optional(),
      textAlign: z.enum(["left", "center", "right"]).optional(),
      bgImageUrl: z.string().optional().nullable(),
      bgOpacity: z.number().min(0).max(1).optional(),
    })
    .optional(),
  media: z
    .object({
      youtubeUrl: z.string().optional().nullable(),
      audioEnabled: z.boolean().optional(),
      autoplay: z.boolean().optional(),
      volume: z.number().min(0).max(1).optional(),
      loopAudio: z.boolean().optional(),
    })
    .optional(),
  scrollConfig: z
    .object({
      autoScroll: z.boolean().optional(),
      speed: z.enum(["SLOW", "MEDIUM", "FAST"]).optional(),
      pauseOnHover: z.boolean().optional(),
    })
    .optional(),
  wizardConfig: z.record(z.string(), z.unknown()).optional().nullable(),
  templateId: z.string().optional(),
})

async function getCard(slug: string) {
  return prisma.invitationCard.findUnique({
    where: { slug },
    include: {
      template: { select: { slug: true, name: true, category: true } },
      theme: true,
      media: true,
      scrollConfig: true,
      giftItems:  { orderBy: { sortOrder: "asc" } },
      photoItems: { orderBy: { sortOrder: "asc" } },
    },
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const card = await getCard(slug)
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const passwordHeader = req.headers.get("x-invite-password")
  if (card.passwordHash) {
    if (!passwordHeader) {
      return NextResponse.json({ error: "Password required", passwordProtected: true }, { status: 401 })
    }
    const valid = await bcrypt.compare(passwordHeader, card.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 })
    }
  }

  await prisma.invitationCard.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  })

  return NextResponse.json({ card })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const existing = await getCard(slug)
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { theme, media, scrollConfig, wizardConfig, password, ...cardFields } = data

    let passwordHash: string | undefined
    if (password === null) {
      passwordHash = undefined
    } else if (password) {
      passwordHash = await bcrypt.hash(password, 10)
    }

    let youtubeVideoId: string | undefined | null
    if (media?.youtubeUrl !== undefined) {
      youtubeVideoId = media.youtubeUrl
        ? extractYoutubeVideoId(media.youtubeUrl) ?? null
        : null
    }

    const card = await prisma.invitationCard.update({
      where: { slug },
      data: {
        ...cardFields,
        ...(wizardConfig !== undefined ? { wizardConfig: wizardConfig === null ? Prisma.DbNull : (wizardConfig as Prisma.InputJsonValue) } : {}),
        ...(passwordHash !== undefined ? { passwordHash } : {}),
        ...(password === null ? { passwordHash: null } : {}),
        ...(theme
          ? {
              theme: {
                upsert: {
                  create: theme as never,
                  update: theme,
                },
              },
            }
          : {}),
        ...(media
          ? {
              media: {
                upsert: {
                  create: {
                    ...media,
                    ...(youtubeVideoId !== undefined ? { youtubeVideoId } : {}),
                  } as never,
                  update: {
                    ...media,
                    ...(youtubeVideoId !== undefined ? { youtubeVideoId } : {}),
                  },
                },
              },
            }
          : {}),
        ...(scrollConfig
          ? {
              scrollConfig: {
                upsert: {
                  create: scrollConfig as never,
                  update: scrollConfig,
                },
              },
            }
          : {}),
      },
      include: {
        template: { select: { slug: true, name: true, category: true } },
        theme: true,
        media: true,
        scrollConfig: true,
      },
    })

    return NextResponse.json({ card })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update card" }, { status: 500 })
  }
}
