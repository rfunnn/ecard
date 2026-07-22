import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/slug"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params

  const source = await prisma.invitationCard.findUnique({
    where: { slug },
    include: {
      theme:       true,
      media:       true,
      scrollConfig: true,
      giftItems:   { orderBy: { sortOrder: "asc" } },
      photoItems:  { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (source.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const draftCount = await prisma.invitationCard.count({
    where: { userId: session.user.id, isPublished: false },
  })
  if (draftCount >= 3) {
    return NextResponse.json({ error: "DRAFT_LIMIT_EXCEEDED" }, { status: 403 })
  }

  // Generate a unique slug
  let newSlug = generateSlug()
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.invitationCard.findUnique({ where: { slug: newSlug } })
    if (!exists) break
    newSlug = generateSlug()
  }

  const copy = await prisma.invitationCard.create({
    data: {
      slug:          newSlug,
      userId:        session.user.id,
      templateId:    source.templateId,
      title:         `${source.title} (Salinan)`,
      groomName:     source.groomName,
      brideName:     source.brideName,
      subtitle:      source.subtitle,
      eventDate:     source.eventDate,
      eventTime:     source.eventTime,
      venueName:     source.venueName,
      venueAddress:  source.venueAddress,
      venueMapUrl:   source.venueMapUrl,
      description:   source.description,
      footerNote:    source.footerNote,
      whatsappNumber: source.whatsappNumber,
      contactName:   source.contactName,
      language:      source.language,
      wizardConfig:  source.wizardConfig ?? undefined,
      // isPublished: false (default), cardNum: null, expiresAt: null
      ...(source.theme ? {
        theme: {
          create: {
            primaryColor:   source.theme.primaryColor,
            secondaryColor: source.theme.secondaryColor,
            accentColor:    source.theme.accentColor,
            bgColor:        source.theme.bgColor,
            titleFont:      source.theme.titleFont,
            bodyFont:       source.theme.bodyFont,
            titleSize:      source.theme.titleSize,
            bodySize:       source.theme.bodySize,
            titleColor:     source.theme.titleColor,
            bodyColor:      source.theme.bodyColor,
            textAlign:      source.theme.textAlign,
            bgImageUrl:     source.theme.bgImageUrl,
            bgOpacity:      source.theme.bgOpacity,
          },
        },
      } : {}),
      ...(source.media ? {
        media: {
          create: {
            youtubeUrl:     source.media.youtubeUrl,
            youtubeVideoId: source.media.youtubeVideoId,
            audioEnabled:   source.media.audioEnabled,
            autoplay:       source.media.autoplay,
            volume:         source.media.volume,
            loopAudio:      source.media.loopAudio,
          },
        },
      } : {}),
      ...(source.scrollConfig ? {
        scrollConfig: {
          create: {
            autoScroll:   source.scrollConfig.autoScroll,
            speed:        source.scrollConfig.speed,
            pauseOnHover: source.scrollConfig.pauseOnHover,
          },
        },
      } : {}),
      ...(source.giftItems.length ? {
        giftItems: {
          create: source.giftItems.map(g => ({
            imageUrl:  g.imageUrl,
            link:      g.link,
            label:     g.label,
            sortOrder: g.sortOrder,
          })),
        },
      } : {}),
      ...(source.photoItems.length ? {
        photoItems: {
          create: source.photoItems.map(p => ({
            imageUrl:  p.imageUrl,
            caption:   p.caption,
            sortOrder: p.sortOrder,
          })),
        },
      } : {}),
    },
    select: { slug: true },
  })

  return NextResponse.json({ slug: copy.slug }, { status: 201 })
}
