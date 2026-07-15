import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

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

import { InviteClient } from "@/components/invite/InviteClient"
import type { InvitationCardData } from "@/types/invitation"
import { DEFAULT_THEME, DEFAULT_MEDIA, DEFAULT_SCROLL } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"

const getCachedCard = unstable_cache(
  async (slug: string) => prisma.invitationCard.findUnique({
    where: { slug },
    include: {
      template: { select: { slug: true, name: true, category: true, image1Url: true, image2Url: true } },
      theme: true,
      media: true,
      scrollConfig: true,
      giftItems:  { orderBy: { sortOrder: "asc" } },
      photoItems: { orderBy: { sortOrder: "asc" } },
    },
  }),
  ["invite-card"],
  { revalidate: 60 }
)

const getCachedCardMeta = unstable_cache(
  async (slug: string) => prisma.invitationCard.findUnique({
    where: { slug },
    select: { title: true, description: true, isPublished: true, expiresAt: true },
  }),
  ["invite-card-meta"],
  { revalidate: 60 }
)

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ name?: string; template?: string; package?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (slug === "demo") {
    return {
      title: "Contoh Kad Jemputan Digital | ekadku.com",
      description: "Lihat contoh kad jemputan digital ekadku.com — perkahwinan, hari jadi, dan korporat. Cuba templat pilihan secara percuma.",
      alternates: { canonical: "https://ekadku.com/invite/demo" },
      openGraph: {
        title: "Contoh Kad Jemputan Digital | ekadku.com",
        description: "Lihat contoh kad jemputan digital yang cantik dari ekadku.com.",
        url: "https://ekadku.com/invite/demo",
        siteName: "ekadku.com",
        locale: "ms_MY",
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ekadku.com — Kad Jemputan Digital" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Contoh Kad Jemputan Digital | ekadku.com",
        description: "Lihat contoh kad jemputan digital yang cantik dari ekadku.com.",
        site: "@ekadku",
        images: ["/opengraph-image"],
      },
    }
  }

  try {
    const card = await getCachedCardMeta(slug)
    if (!card) return { title: "Jemputan", robots: { index: false } }

    const isExpired = card.expiresAt != null && new Date(card.expiresAt) < new Date()
    const shouldIndex = card.isPublished && !isExpired

    const title = card.title || "Kad Jemputan Digital"
    const description = card.description ?? "Anda dijemput! Buka pautan ini untuk melihat kad jemputan."

    return {
      title,
      description,
      alternates: { canonical: `https://ekadku.com/invite/${slug}` },
      robots: shouldIndex ? { index: true, follow: false } : { index: false, follow: false },
      openGraph: {
        title,
        description,
        url: `https://ekadku.com/invite/${slug}`,
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

const PACKAGE_META: Record<string, { label: string; emoji: string; price: string }> = {
  bronze: { label: "Bronze", emoji: "🥉", price: "RM30" },
  silver: { label: "Silver", emoji: "🥈", price: "RM40" },
  gold:   { label: "Gold",   emoji: "🥇", price: "RM60" },
}

export default async function InvitePage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const nameOverride = sp.name
  const templateSlug = sp.template
  const packageParam = (sp.package ?? "gold").toLowerCase()

  if (slug === "demo") {
    // Fetch the selected template first so its colours can drive the whole demo
    const demoTemplate = await prisma.template.findFirst({
      where: { slug: templateSlug ?? "wedding-classic" },
      select: { slug: true, name: true, category: true, image1Url: true, image2Url: true, defaultConfig: true },
    }) ?? await prisma.template.findFirst({
      where: { slug: "wedding-classic" },
      select: { slug: true, name: true, category: true, image1Url: true, image2Url: true, defaultConfig: true },
    })

    const tmplCfgRaw  = (demoTemplate?.defaultConfig ?? {}) as Record<string, unknown>
    const authored    = tmplCfgRaw.authored as import("@/types/template-admin").AuthoredInvite | undefined
    const tmplCfg    = tmplCfgRaw as { primaryColor?: string; bgColor?: string; titleFont?: string }
    const isTemplatePreview = !!templateSlug
    const demoPrimary = isTemplatePreview ? (tmplCfg.primaryColor ?? "#9b4d5e") : "#9b4d5e"
    const demoBg      = isTemplatePreview ? (tmplCfg.bgColor      ?? "#faf7f4") : "#faf7f4"

    // When admin previews a template that has been authored, use the full
    // authored config so animation, animation colour, and text colour changes
    // are reflected — not the hardcoded demo defaults.
    if (isTemplatePreview && authored?.wizardConfig) {
      let wc: WizardConfig = { ...authored.wizardConfig }

      if (nameOverride) {
        wc = { ...wc, displayName: nameOverride }
        const parts = nameOverride.split(/\s*&\s*/).map((s) => s.trim())
        if (parts.length > 1 && wc.fullNames !== undefined) {
          wc = { ...wc, fullNames: `${parts[0]}\n&\n${parts[1]}` }
        }
      }

      if (packageParam === "bronze") {
        wc = {
          ...wc, effectAnimation: "Tiada",
          rsvp: { ...wc.rsvp, mode: "NONE" },
          segments: { ...wc.segments, attendance: false, wishes: false, confirmBtn: false, writeWishBtn: false },
        }
      } else if (packageParam === "gold" && !wc.bankName) {
        wc = { ...wc, bankName: "Maybank", bankAccountName: "Ahmad Faris bin Ahmad", bankAccountNumber: "1234567890" }
      }

      const pkgMeta2 = PACKAGE_META[packageParam] ?? PACKAGE_META.gold
      const authoredTheme = authored.theme ?? DEFAULT_THEME
      const authoredGiftItems = packageParam !== "bronze"
        ? (authored.giftItems ?? []).map((g, i) => ({ id: `demo-gift-${i}`, imageUrl: g.imageUrl, link: g.link, label: g.label, sortOrder: g.sortOrder ?? i }))
        : []
      const authoredPhotoItems = (authored.photoItems ?? []).map((p, i) => ({ id: `demo-photo-${i}`, imageUrl: p.imageUrl, caption: p.caption, sortOrder: p.sortOrder ?? i }))

      const authoredDemoCard: InvitationCardData = {
        id: "demo", slug: "demo", templateId: "demo",
        title: wc.eventType || "Demo",
        groomName: nameOverride ? nameOverride.split(/\s*&\s*/)[0]?.trim() : wc.displayName?.split(/\s*&\s*/)[0]?.trim(),
        brideName:  nameOverride ? nameOverride.split(/\s*&\s*/)[1]?.trim() : wc.displayName?.split(/\s*&\s*/)[1]?.trim(),
        whatsappNumber: wc.contacts?.[0]?.phone || "60123456789",
        contactName:    wc.contacts?.[0]?.name  || "Ali",
        isPublished: true, language: wc.language || "ms", viewCount: 0,
        template: {
          slug:      demoTemplate?.slug     ?? "wedding-classic",
          name:      demoTemplate?.name     ?? "Wedding Classic",
          category:  (demoTemplate?.category ?? "WEDDING") as "WEDDING" | "BIRTHDAY" | "CORPORATE" | "GENERIC",
          image1Url: demoTemplate?.image1Url ?? null,
          image2Url: demoTemplate?.image2Url ?? null,
        },
        theme: { ...DEFAULT_THEME, ...authoredTheme },
        media: authored.media
          ? { ...DEFAULT_MEDIA, ...authored.media }
          : { ...DEFAULT_MEDIA, audioEnabled: true, youtubeUrl: "https://www.youtube.com/watch?v=Tf_zS_ES_7k", youtubeVideoId: "Tf_zS_ES_7k" },
        scrollConfig: authored.scrollConfig ?? { autoScroll: true, speed: "MEDIUM", pauseOnHover: true },
        wizardConfig: wc,
        giftItems: authoredGiftItems,
        photoItems: authoredPhotoItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return <InviteClient card={authoredDemoCard} demoBadge={`${pkgMeta2.emoji} ${pkgMeta2.label} · ${pkgMeta2.price}`} />
    }

    // Future event date — 60 days from now
    // eslint-disable-next-line react-hooks/purity
    const eventStart = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    eventStart.setHours(10, 0, 0, 0)
    const eventEnd = new Date(eventStart.getTime() + 3 * 60 * 60 * 1000)

    const demoWizardConfig: WizardConfig = {
      language: "ms",
      packageType: "Gold",
      addOnCustomDesign: false,
      addOnCoverVideo: false,
      designCode: "",
      openingStyle: "Tingkap A",
      openingStyleColor: "#f2f2f2",
      effectAnimation: "Bunga #1",
      effectColor: demoPrimary,
      effectSize: 100,
      footerBgColor: "",
      footerBgOpacity: 70,
      footerIconColor: "",
      scrollAnimation: "Naik",

      // Cover
      eventType: "Walimatul Urus",
      eventTypeSize: 13,
      displayName: "Ahmad Faris & Nur Aisyah",
      displayNameFont: "GreatVibes",
      displayNameColor: demoPrimary,
      displayNameSize: 52,
      startDateTime: eventStart.toISOString(),
      endDateTime: eventEnd.toISOString(),
      dayAndDate: `${eventStart.toLocaleDateString("ms-MY", { weekday: "long" })}\n${eventStart.toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" })}`,
      dayAndDateSize: 18,
      venueLine: "Dewan Seri Murni, Kuala Lumpur",
      venueLineSize: 13,

      // Invitation text
      openingSpeech: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\n\nWalimatul Urus",
      organizerCount: 2,
      organizer1: { name: "Hj. Ahmad bin Abdul Razak", relationship: "Bapa Lelaki" },
      organizer2: { name: "Hjh. Fatimah binti Ismail", relationship: "Ibu Perempuan" },
      organizerFont: "Cormorant",
      organizerSize: 18,
      invitationSpeech: "Dengan penuh rasa syukur ke hadrat Allah S.W.T.,\nkami menjemput Dato\' | Datin | Tuan | Puan\nserta seisi keluarga hadir ke majlis\nperkahwinan anakanda kami",
      fullNames: "Ahmad Faris bin Ahmad\n&\nNur Aisyah binti Ibrahim",
      fullNamesFont: "Cormorant",
      fullNamesSize: 24,

      // Venue & Date
      hijriDate: "15 Jamadil Akhir 1446H",
      venueAddress: "Dewan Seri Murni\nJalan Ampang, 50450\nKuala Lumpur",
      deliveryAddress: "",
      bankName: "",
      bankAccountName: "",
      bankAccountNumber: "",
      bankQrUrl: "",
      googleMapsUrl: "https://maps.google.com/?q=3.158360,101.712160",
      wazeUrl: "https://waze.com/ul?ll=3.158360,101.712160&navigate=yes",
      gpsCoordinates: "3.158360, 101.712160",

      // Program
      additionalInfo1: "Kod Pakaian: Baju Melayu / Kurung / Kebaya",
      eventProgram: "Ketibaan Tetamu\n8:30 pagi\n\nAkad Nikah\n10:00 pagi\n\nMajlis Resepsi\n12:00 tengah hari\n\nMajlis Berakhir\n3:00 petang",
      additionalInfo2: "\"Dan di antara tanda-tanda kekuasaanNya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikanNya di antaramu rasa kasih dan sayang.\"\n\n— Surah Ar-Rum (30:21)",

      // Style — driven by the selected template's colours
      generalFont: "Cormorant",
      generalColor: demoPrimary,
      generalSize: 16,
      headingFont: "Cormorant",
      headingSize: 36,
      backgroundColor: demoBg,
      sideMargin: 1.25,

      // RSVP
      rsvp: {
        mode: "RSVP_WISHES",
        note: "Sila sahkan kehadiran anda",
        closeDate: "",
        showFields: {
          name: true, phone: true, email: false, address: false,
          company: false, jobTitle: false, vehiclePlate: false,
          notes: false, wishes: true,
        },
        separateChildren: false,
        guestLimitPerRSVP: 5,
        totalGuestLimit: 500,
        hasSlots: false,
      },

      // Contacts
      contacts: [
        { name: "Ali", role: "", phone: "60123456789", isWhatsApp: true },
      ],

      // Music & scroll
      youtubeUrl: "https://www.youtube.com/watch?v=Tf_zS_ES_7k",
      musicStartTime: "00:00",
      showMusicPlayer: true,
      autoplayMusic: true,
      scrollDelay: 3.5,

      // Segments — everything on by default (overridden per package below)
      segments: {
        venue: true, date: true, time: true, endTime: true,
        saveDateBtn: true, eventProgram: true, countdown: true,
        attendance: true, wishes: true, confirmBtn: true, writeWishBtn: true,
        photoGallery: true,
      },
    }

    // Apply package-specific feature overrides
    if (packageParam === "bronze") {
      demoWizardConfig.effectAnimation = "Tiada"
      demoWizardConfig.rsvp = { ...demoWizardConfig.rsvp, mode: "NONE" }
      demoWizardConfig.segments = {
        ...demoWizardConfig.segments,
        attendance: false,
        wishes: false,
        confirmBtn: false,
        writeWishBtn: false,
      }
    } else if (packageParam === "gold") {
      demoWizardConfig.bankName = "Maybank"
      demoWizardConfig.bankAccountName = "Ahmad Faris bin Ahmad"
      demoWizardConfig.bankAccountNumber = "1234567890"
    }
    // Silver keeps base config: effects ON, RSVP ON, no bank details

    if (nameOverride) {
      demoWizardConfig.displayName = nameOverride
      const parts = nameOverride.split(/\s*&\s*/).map((s) => s.trim())
      if (parts[0]) demoWizardConfig.fullNames = parts.length > 1
        ? `${parts[0]}\n&\n${parts[1]}`
        : parts[0]
    }

    const demoGiftItems = packageParam === "gold"
      ? [
          {
            id: "demo-gift-1",
            label: "Set Makan Porselin 32pcs",
            imageUrl: "https://picsum.photos/seed/ceramicset/400/400",
            link: "https://www.lazada.com.my/",
            sortOrder: 0,
          },
          {
            id: "demo-gift-2",
            label: "Set Cadar Queen Premium",
            imageUrl: "https://picsum.photos/seed/beddingset/400/400",
            link: "https://shopee.com.my/",
            sortOrder: 1,
          },
          {
            id: "demo-gift-3",
            label: "Blender Dapur Elektrik",
            imageUrl: "https://picsum.photos/seed/kitchenblend/400/400",
            link: "https://www.lazada.com.my/",
            sortOrder: 2,
          },
        ]
      : []

    const pkgMeta = PACKAGE_META[packageParam] ?? PACKAGE_META.gold
    const demoBadge = `${pkgMeta.emoji} ${pkgMeta.label} · ${pkgMeta.price}`

    const demoCard: InvitationCardData = {
      id: "demo",
      slug: "demo",
      templateId: "demo",
      title: "Walimatul Urus",
      groomName: nameOverride ? nameOverride.split(/\s*&\s*/)[0]?.trim() : "Ahmad Faris",
      brideName: nameOverride ? nameOverride.split(/\s*&\s*/)[1]?.trim() : "Nur Aisyah",
      whatsappNumber: "60123456789",
      contactName: "Ali",
      isPublished: true,
      language: "ms",
      viewCount: 0,
      template: {
        slug:      demoTemplate?.slug     ?? "wedding-classic",
        name:      demoTemplate?.name     ?? "Wedding Classic",
        category:  (demoTemplate?.category ?? "WEDDING") as "WEDDING" | "BIRTHDAY" | "CORPORATE" | "GENERIC",
        image1Url: demoTemplate?.image1Url ?? null,
        image2Url: demoTemplate?.image2Url ?? null,
      },
      theme: {
        primaryColor: demoPrimary,
        secondaryColor: demoBg,
        accentColor: demoPrimary,
        bgColor: demoBg,
        titleFont: tmplCfg.titleFont ?? "Cormorant Garamond",
        bodyFont: "Lato",
        titleSize: 36,
        bodySize: 16,
        titleColor: demoPrimary,
        bodyColor: demoPrimary,
        textAlign: "center",
        bgOpacity: 0,
      },
      media: {
        ...DEFAULT_MEDIA,
        audioEnabled: true,
        youtubeUrl: "https://www.youtube.com/watch?v=Tf_zS_ES_7k",
        youtubeVideoId: "Tf_zS_ES_7k",
      },
      scrollConfig: { autoScroll: true, speed: "MEDIUM", pauseOnHover: true },
      wizardConfig: demoWizardConfig,
      giftItems: demoGiftItems,
      photoItems: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return <InviteClient card={demoCard} demoBadge={demoBadge} />
  }

  let card: InvitationCardData | null = null
  let expired = false

  try {
    const raw = await getCachedCard(slug)

    if (!raw) return notFound()

    if (raw.expiresAt && new Date(raw.expiresAt) < new Date()) {
      expired = true
    } else {
    card = {
      id: raw.id,
      slug: raw.slug,
      templateId: raw.templateId,
      title: raw.title,
      groomName: raw.groomName ?? undefined,
      brideName: raw.brideName ?? undefined,
      subtitle: raw.subtitle ?? undefined,
      eventDate: raw.eventDate ? new Date(raw.eventDate).toISOString() : undefined,
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
      createdAt: new Date(raw.createdAt).toISOString(),
      updatedAt: new Date(raw.updatedAt).toISOString(),
    }
    }
  } catch (err) {
    console.error("[invite-page] failed to load card:", slug, err)
    return notFound()
  }

  if (expired) return <ExpiredPage />
  if (!card) return notFound()

  // Preview name override — passed from the template picker via ?name=
  if (nameOverride) {
    const parts = nameOverride.split(/\s*&\s*/).map((s) => s.trim())
    const wc = (card.wizardConfig ?? {}) as import("@/types/config").WizardConfig
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
      } as import("@/types/config").WizardConfig,
    }
  }

  const wc = card.wizardConfig as { startDateTime?: string; venueLine?: string; venueAddress?: string } | undefined
  const eventLd = card.isPublished
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: card.title,
        url: `https://ekadku.com/invite/${slug}`,
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
