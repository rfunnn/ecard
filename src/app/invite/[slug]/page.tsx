import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { InviteClient } from "@/components/invite/InviteClient"
import type { InvitationCardData } from "@/types/invitation"
import { DEFAULT_THEME, DEFAULT_MEDIA, DEFAULT_SCROLL } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const card = await prisma.invitationCard.findUnique({
      where: { slug },
      select: { title: true, description: true },
    })
    if (!card) return { title: "Jemputan" }
    return {
      title: card.title || "Kad Jemputan Digital",
      description: card.description ?? "Anda dijemput! Buka pautan ini untuk melihat jemputan.",
    }
  } catch {
    return { title: "Jemputan" }
  }
}

export default async function InvitePage({ params }: Props) {
  const { slug } = await params

  if (slug === "demo") {
    // Future event date — 60 days from now
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
      effectColor: "#9b4d5e",

      // Cover
      eventType: "Walimatul Urus",
      eventTypeSize: 13,
      displayName: "Ahmad Faris & Nur Aisyah",
      displayNameFont: "GreatVibes",
      displayNameColor: "#7a3645",
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
      googleMapsUrl: "https://maps.google.com",
      wazeUrl: "https://waze.com",
      gpsCoordinates: "3.158360, 101.712160",

      // Program
      additionalInfo1: "Kod Pakaian: Baju Melayu / Kurung / Kebaya",
      eventProgram: "Ketibaan Tetamu\n8:30 pagi\n\nAkad Nikah\n10:00 pagi\n\nMajlis Resepsi\n12:00 tengah hari\n\nMajlis Berakhir\n3:00 petang",
      additionalInfo2: "\"Dan di antara tanda-tanda kekuasaanNya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikanNya di antaramu rasa kasih dan sayang.\"\n\n— Surah Ar-Rum (30:21)",

      // Style
      generalFont: "Cormorant",
      generalColor: "#6b3a47",
      generalSize: 16,
      headingFont: "Cormorant",
      headingSize: 36,
      backgroundColor: "#faf7f4",
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
        { name: "Pak Long Azman", role: "Penyelaras", phone: "60123456789", isWhatsApp: true },
        { name: "Kak Nor", role: "Hos", phone: "60129876543", isWhatsApp: true },
      ],

      // Music & scroll
      youtubeUrl: "",
      musicStartTime: "00:00",
      showMusicPlayer: false,
      autoplayMusic: false,
      scrollDelay: 3.5,

      // Segments — everything on
      segments: {
        venue: true, date: true, time: true, endTime: true,
        saveDateBtn: true, eventProgram: true, countdown: true,
        attendance: true, wishes: true, confirmBtn: true, writeWishBtn: true,
      },
    }

    const demoCard: InvitationCardData = {
      id: "demo",
      slug: "demo",
      templateId: "demo",
      title: "Walimatul Urus",
      groomName: "Ahmad Faris",
      brideName: "Nur Aisyah",
      isPublished: true,
      language: "ms",
      viewCount: 0,
      template: { slug: "wedding-classic", name: "Wedding Classic", category: "WEDDING" },
      theme: {
        primaryColor: "#9b4d5e",
        secondaryColor: "#faf7f4",
        accentColor: "#7a3645",
        bgColor: "#faf7f4",
        titleFont: "Cormorant Garamond",
        bodyFont: "Lato",
        titleSize: 36,
        bodySize: 16,
        titleColor: "#7a3645",
        bodyColor: "#6b3a47",
        textAlign: "center",
        bgOpacity: 0,
      },
      media: { ...DEFAULT_MEDIA, audioEnabled: false },
      scrollConfig: { autoScroll: true, speed: "SLOW", pauseOnHover: true },
      wizardConfig: demoWizardConfig,
      giftItems: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return <InviteClient card={demoCard} />
  }

  let card: InvitationCardData | null = null

  try {
    const raw = await prisma.invitationCard.findUnique({
      where: { slug },
      include: {
        template: { select: { slug: true, name: true, category: true, image1Url: true, image2Url: true } },
        theme: true,
        media: true,
        scrollConfig: true,
        giftItems: { orderBy: { sortOrder: "asc" } },
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
      wizardConfig: (raw.wizardConfig ?? undefined) as import("@/types/config").WizardConfig | undefined,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    }
  } catch {
    return notFound()
  }

  if (!card) return notFound()
  return <InviteClient card={card} />
}
