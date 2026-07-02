import type { WizardConfig } from "@/types/config"
import { DEFAULT_WIZARD_CONFIG } from "@/types/config"

export const DEMO_YOUTUBE_URL      = "https://www.youtube.com/watch?v=Tf_zS_ES_7k"
export const DEMO_YOUTUBE_VIDEO_ID = "Tf_zS_ES_7k"

export const DEMO_GIFT_ITEMS = [
  { label: "Set Makan Porselin 32pcs", imageUrl: "https://picsum.photos/seed/ceramicset/400/400",  link: "https://www.lazada.com.my/", sortOrder: 0 },
  { label: "Set Cadar Queen Premium",  imageUrl: "https://picsum.photos/seed/beddingset/400/400", link: "https://shopee.com.my/",      sortOrder: 1 },
  { label: "Blender Dapur Elektrik",   imageUrl: "https://picsum.photos/seed/kitchenblend/400/400", link: "https://www.lazada.com.my/", sortOrder: 2 },
] as const

export function buildDemoWizardConfig(
  primaryColor: string,
  bgColor: string,
  _titleFont = "Cormorant",
  templateSlug = "",
): WizardConfig {
  const eventStart = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  eventStart.setHours(10, 0, 0, 0)
  const eventEnd = new Date(eventStart.getTime() + 3 * 60 * 60 * 1000)

  const dayLabel  = eventStart.toLocaleDateString("ms-MY", { weekday: "long" })
  const dateLabel = eventStart.toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" })

  return {
    ...DEFAULT_WIZARD_CONFIG,
    language: "ms",
    designCode: templateSlug,
    openingStyle: "Tingkap A",
    openingStyleColor: "#f2f2f2",
    effectAnimation: "Bunga #1",
    effectColor: primaryColor,
    effectSize: 100,

    eventType: "Walimatul Urus",
    eventTypeSize: 13,
    displayName: "Ahmad Faris & Nur Aisyah",
    displayNameFont: "GreatVibes",
    displayNameColor: primaryColor,
    displayNameSize: 52,
    startDateTime: eventStart.toISOString().slice(0, 16),
    endDateTime: eventEnd.toISOString().slice(0, 16),
    dayAndDate: `${dayLabel}\n${dateLabel}`,
    dayAndDateSize: 18,
    venueLine: "Dewan Seri Murni, Kuala Lumpur",
    venueLineSize: 13,

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

    hijriDate: "15 Jamadil Akhir 1446H",
    venueAddress: "Dewan Seri Murni\nJalan Ampang, 50450\nKuala Lumpur",
    googleMapsUrl: "https://maps.google.com/?q=3.158360,101.712160",
    wazeUrl: "https://waze.com/ul?ll=3.158360,101.712160&navigate=yes",
    gpsCoordinates: "3.158360, 101.712160",
    deliveryAddress: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankQrUrl: "",

    additionalInfo1: "Kod Pakaian: Baju Melayu / Kurung / Kebaya",
    eventProgram: "Ketibaan Tetamu\n8:30 pagi\n\nAkad Nikah\n10:00 pagi\n\nMajlis Resepsi\n12:00 tengah hari\n\nMajlis Berakhir\n3:00 petang",
    additionalInfo2: "\"Dan di antara tanda-tanda kekuasaanNya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikanNya di antaramu rasa kasih dan sayang.\"\n\n— Surah Ar-Rum (30:21)",

    generalFont: "Cormorant",
    generalColor: primaryColor,
    generalSize: 16,
    headingFont: "Cormorant",
    headingSize: 36,
    backgroundColor: bgColor,
    sideMargin: 1.25,

    rsvp: {
      ...DEFAULT_WIZARD_CONFIG.rsvp,
      mode: "RSVP_WISHES",
      note: "Sila sahkan kehadiran anda",
      closeDate: "",
      showFields: {
        name: true,
        phone: true,
        email: false,
        address: false,
        company: false,
        jobTitle: false,
        vehiclePlate: false,
        notes: false,
        wishes: true,
      },
      separateChildren: false,
      guestLimitPerRSVP: 5,
      totalGuestLimit: 500,
      hasSlots: false,
    },

    contacts: [
      { name: "Ali", role: "", phone: "60123456789", isWhatsApp: true },
      { name: "", role: "", phone: "", isWhatsApp: true },
    ],

    youtubeUrl: "https://www.youtube.com/watch?v=Tf_zS_ES_7k",
    musicStartTime: "00:00",
    showMusicPlayer: true,
    autoplayMusic: true,
    scrollDelay: 3.5,

    segments: {
      venue: true,
      date: true,
      time: true,
      endTime: true,
      saveDateBtn: true,
      eventProgram: true,
      countdown: true,
      attendance: true,
      wishes: true,
      confirmBtn: true,
      writeWishBtn: true,
      photoGallery: true,
    },
  }
}
