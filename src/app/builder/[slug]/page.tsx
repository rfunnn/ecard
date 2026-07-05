import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma"
import { WizardShell } from "@/components/wizard/WizardShell"
import type { InvitationCardData } from "@/types/invitation"
import { DEFAULT_THEME, DEFAULT_MEDIA, DEFAULT_SCROLL } from "@/types/invitation"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BuilderRoute({ params }: Props) {
  const { slug } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/login?callbackUrl=/builder/${slug}`)

  let card: InvitationCardData | null = null

  try {
    const raw = await prisma.invitationCard.findUnique({
      where: { slug, userId: session.user.id },
      include: {
        template: { select: { slug: true, name: true, category: true, image1Url: true, image2Url: true } },
        theme: true,
        media: true,
        scrollConfig: true,
        giftItems:  { orderBy: { sortOrder: "asc" } },
        photoItems: { orderBy: { sortOrder: "asc" } },
      },
    })

    if (!raw) return notFound()

    card = {
      id: raw.id,
      slug: raw.slug,
      templateId: raw.templateId,
      title: raw.title,
      groomName: raw.groomName ?? undefined,
      brideName: raw.brideName ?? undefined,
      subtitle: raw.subtitle ?? undefined,
      eventDate: raw.eventDate?.toISOString() ?? undefined,
      eventTime: raw.eventTime ?? undefined,
      venueName: raw.venueName ?? undefined,
      venueAddress: raw.venueAddress ?? undefined,
      venueMapUrl: raw.venueMapUrl ?? undefined,
      description: raw.description ?? undefined,
      footerNote: raw.footerNote ?? undefined,
      whatsappNumber: raw.whatsappNumber ?? undefined,
      contactName: raw.contactName ?? undefined,
      isPublished: raw.isPublished,
      language: raw.language,
      viewCount: raw.viewCount,
      template: {
        slug:      raw.template.slug,
        name:      raw.template.name,
        category:  raw.template.category as "WEDDING" | "BIRTHDAY" | "CORPORATE" | "GENERIC",
        image1Url: raw.template.image1Url ?? null,
        image2Url: raw.template.image2Url ?? null,
      },
      theme: raw.theme
        ? {
            primaryColor: raw.theme.primaryColor,
            secondaryColor: raw.theme.secondaryColor,
            accentColor: raw.theme.accentColor,
            bgColor: raw.theme.bgColor,
            titleFont: raw.theme.titleFont,
            bodyFont: raw.theme.bodyFont,
            titleSize: raw.theme.titleSize,
            bodySize: raw.theme.bodySize,
            titleColor: raw.theme.titleColor,
            bodyColor: raw.theme.bodyColor,
            textAlign: raw.theme.textAlign as "left" | "center" | "right",
            bgImageUrl: raw.theme.bgImageUrl ?? undefined,
            bgOpacity: raw.theme.bgOpacity,
          }
        : { ...DEFAULT_THEME },
      media: raw.media
        ? {
            youtubeUrl: raw.media.youtubeUrl ?? undefined,
            youtubeVideoId: raw.media.youtubeVideoId ?? undefined,
            audioEnabled: raw.media.audioEnabled,
            autoplay: raw.media.autoplay,
            volume: raw.media.volume,
            loopAudio: raw.media.loopAudio,
          }
        : { ...DEFAULT_MEDIA },
      scrollConfig: raw.scrollConfig
        ? {
            autoScroll: raw.scrollConfig.autoScroll,
            speed: raw.scrollConfig.speed as "SLOW" | "MEDIUM" | "FAST",
            pauseOnHover: raw.scrollConfig.pauseOnHover,
          }
        : { ...DEFAULT_SCROLL },
      giftItems: raw.giftItems.map((g) => ({
        id: g.id,
        imageUrl: g.imageUrl,
        link: g.link,
        label: g.label ?? undefined,
        sortOrder: g.sortOrder,
      })),
      photoItems: raw.photoItems.map((p) => ({
        id: p.id,
        imageUrl: p.imageUrl,
        caption: p.caption ?? undefined,
        sortOrder: p.sortOrder,
      })),
      wizardConfig: (raw.wizardConfig ?? undefined) as import("@/types/config").WizardConfig | undefined,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    }
  } catch {
    return notFound()
  }

  if (!card) return notFound()
  return <WizardShell initialCard={card} />
}
