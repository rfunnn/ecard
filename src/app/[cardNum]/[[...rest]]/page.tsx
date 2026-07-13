import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { InviteClient } from "@/components/invite/InviteClient"
import type { InvitationCardData } from "@/types/invitation"
import { DEFAULT_THEME, DEFAULT_MEDIA, DEFAULT_SCROLL } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"

export const dynamic = "force-dynamic"

function ExpiredPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-neutral-950">
      <p className="text-4xl mb-5">📅</p>
      <h1 className="text-xl font-semibold text-white mb-2">Pautan Telah Tamat Tempoh</h1>
      <p className="text-sm text-neutral-400 max-w-xs">
        Tempoh sah pautan jemputan ini telah berakhir. Sila hubungi penganjur majlis untuk maklumat lanjut.
      </p>
    </div>
  )
}

interface Props {
  params: Promise<{ cardNum: string; rest?: string[] }>
  searchParams: Promise<{ name?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cardNum: cardNumStr } = await params
  const cardNum = parseInt(cardNumStr, 10)
  if (isNaN(cardNum)) return { title: "Jemputan", robots: { index: false } }

  try {
    const card = await prisma.invitationCard.findUnique({
      where: { cardNum },
      select: { title: true, description: true, isPublished: true, expiresAt: true },
    })
    if (!card) return { title: "Jemputan", robots: { index: false } }

    const isExpired = card.expiresAt != null && card.expiresAt < new Date()
    const shouldIndex = card.isPublished && !isExpired
    const title = card.title || "Kad Jemputan Digital"
    const description = card.description ?? "Anda dijemput! Buka pautan ini untuk melihat kad jemputan."

    return {
      title,
      description,
      alternates: { canonical: `https://ekadku.com/${cardNum}` },
      robots: shouldIndex ? { index: true, follow: false } : { index: false, follow: false },
      openGraph: {
        title,
        description,
        url: `https://ekadku.com/${cardNum}`,
        siteName: "ekadku.com",
        locale: "ms_MY",
        type: "website",
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        site: "@ekadku",
        images: ["/opengraph-image"],
      },
    }
  } catch {
    return { title: "Jemputan", robots: { index: false } }
  }
}

export default async function CardNumInvitePage({ params, searchParams }: Props) {
  const { cardNum: cardNumStr } = await params
  const cardNum = parseInt(cardNumStr, 10)
  if (isNaN(cardNum)) return notFound()

  const sp = await searchParams
  const nameOverride = sp.name

  let card: InvitationCardData | null = null

  try {
    const raw = await prisma.invitationCard.findUnique({
      where: { cardNum },
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

    if (raw.expiresAt && raw.expiresAt < new Date()) {
      return <ExpiredPage />
    }

    card = {
      id: raw.id,
      slug: raw.slug,
      cardNum: raw.cardNum,
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
      wizardConfig: (raw.wizardConfig ?? undefined) as WizardConfig | undefined,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    }
  } catch {
    return notFound()
  }

  if (!card) return notFound()

  if (nameOverride) {
    const parts = nameOverride.split(/\s*&\s*/).map((s) => s.trim())
    const wc = (card.wizardConfig ?? {}) as WizardConfig
    card = {
      ...card,
      groomName: parts[0] || card.groomName,
      brideName: parts[1] || card.brideName,
      wizardConfig: {
        ...wc,
        displayName: nameOverride,
        ...(parts.length > 1 && wc.fullNames !== undefined
          ? { fullNames: `${parts[0]}\n&\n${parts[1]}` }
          : {}),
      } as WizardConfig,
    }
  }

  const wc = card.wizardConfig as { startDateTime?: string; venueLine?: string; venueAddress?: string } | undefined
  const eventLd = card.isPublished
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: card.title,
        url: `https://ekadku.com/${cardNum}`,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        ...(card.eventDate || wc?.startDateTime
          ? { startDate: card.eventDate ?? wc?.startDateTime }
          : {}),
        ...((card.venueName || wc?.venueLine)
          ? {
              location: {
                "@type": "Place",
                name: card.venueName ?? wc?.venueLine,
                ...(card.venueAddress || wc?.venueAddress
                  ? { address: card.venueAddress ?? wc?.venueAddress }
                  : {}),
              },
            }
          : {}),
        organizer: { "@type": "Organization", name: "ekadku.com", url: "https://ekadku.com" },
      }
    : null

  return (
    <>
      {eventLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
        />
      )}
      <InviteClient card={card} />
    </>
  )
}
