export interface OrganizerConfig {
  name: string
  relationship: string
}

export interface ContactConfig {
  name: string
  role: string
  phone: string
  isWhatsApp: boolean
}

export interface RSVPWizardConfig {
  mode: "RSVP_WISHES" | "WISHES_ONLY" | "THIRD_PARTY" | "NONE"
  note: string
  closeDate: string
  showFields: {
    name: boolean
    phone: boolean
    email: boolean
    address: boolean
    company: boolean
    jobTitle: boolean
    vehiclePlate: boolean
    notes: boolean
    wishes: boolean
  }
  separateChildren: boolean
  guestLimitPerRSVP: number
  totalGuestLimit: number
  hasSlots: boolean
}

export interface SegmentConfig {
  venue: boolean
  date: boolean
  time: boolean
  endTime: boolean
  saveDateBtn: boolean
  eventProgram: boolean
  countdown: boolean
  attendance: boolean
  wishes: boolean
  confirmBtn: boolean
  writeWishBtn: boolean
}

export interface WizardConfig {
  // Page 1 — Utama & Pembukaan
  language: "ms" | "en"
  packageType: string
  addOnCustomDesign: boolean
  addOnCoverVideo: boolean
  designCode: string
  openingStyle: string
  openingStyleColor: string
  effectAnimation: string
  effectColor: string
  effectSize: number

  // Page 2 — Muka Depan
  eventType: string
  eventTypeSize: number
  displayName: string
  displayNameFont: string
  displayNameColor: string
  displayNameSize: number
  startDateTime: string
  endDateTime: string
  dayAndDate: string
  dayAndDateSize: number
  venueLine: string
  venueLineSize: number

  // Page 3 — Ayat Undangan
  openingSpeech: string
  organizerCount: 1 | 2
  organizer1: OrganizerConfig
  organizer2: OrganizerConfig
  organizerFont: string
  organizerSize: number
  invitationSpeech: string
  fullNames: string
  fullNamesFont: string
  fullNamesSize: number

  // Page 4 — Tempat & Navigasi
  hijriDate: string
  venueAddress: string
  googleMapsUrl: string
  wazeUrl: string
  gpsCoordinates: string
  deliveryAddress: string
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  bankQrUrl: string

  // Page 5 — Atur Cara & Lain-lain
  additionalInfo1: string
  eventProgram: string
  additionalInfo2: string

  // Page 6 — Antara Muka
  generalFont: string
  generalColor: string
  generalSize: number
  headingFont: string
  headingSize: number
  backgroundColor: string
  sideMargin: number

  // Page 7 — RSVP / Ucapan
  rsvp: RSVPWizardConfig

  // Page 8 — Hubungi
  contacts: ContactConfig[]

  // Page 9 — Lagu & Auto Skrol
  youtubeUrl: string
  musicStartTime: string
  showMusicPlayer: boolean
  autoplayMusic: boolean
  scrollDelay: number

  // Page 10 — Segmen & Tamat
  segments: SegmentConfig
}

export const DEFAULT_WIZARD_CONFIG: WizardConfig = {
  language: "ms",
  packageType: "Gold (RM60)",
  addOnCustomDesign: false,
  addOnCoverVideo: false,
  designCode: "",
  openingStyle: "Tingkap A",
  openingStyleColor: "#f2f2f2",
  effectAnimation: "Tiada",
  effectColor: "#8999ab",
  effectSize: 100,

  eventType: "Walimatul Urus",
  eventTypeSize: 14,
  displayName: "",
  displayNameFont: "PlayfairScript",
  displayNameColor: "#24104f",
  displayNameSize: 50,
  startDateTime: "",
  endDateTime: "",
  dayAndDate: "",
  dayAndDateSize: 21,
  venueLine: "",
  venueLineSize: 13,

  openingSpeech: "Walimatul Urus",
  organizerCount: 2,
  organizer1: { name: "", relationship: "" },
  organizer2: { name: "", relationship: "" },
  organizerFont: "Cormorant",
  organizerSize: 22,
  invitationSpeech: "Dengan penuh kesyukuran, kami mempersilakan\nDato\' | Datin | Tuan | Puan | Encik | Cik\nseisi keluarga hadir ke majlis perkahwinan anakanda kami",
  fullNames: "",
  fullNamesFont: "Cormorant",
  fullNamesSize: 22,

  hijriDate: "",
  venueAddress: "",
  googleMapsUrl: "",
  wazeUrl: "",
  gpsCoordinates: "",
  deliveryAddress: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankQrUrl: "",

  additionalInfo1: "",
  eventProgram: "",
  additionalInfo2: "",

  generalFont: "Spartan",
  generalColor: "#a25d66",
  generalSize: 19,
  headingFont: "Spartan",
  headingSize: 39,
  backgroundColor: "#f1f1f1",
  sideMargin: 1.25,

  rsvp: {
    mode: "RSVP_WISHES",
    note: "",
    closeDate: "",
    showFields: {
      name: false,
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
    guestLimitPerRSVP: 10,
    totalGuestLimit: 10000,
    hasSlots: false,
  },

  contacts: [
    { name: "", role: "", phone: "", isWhatsApp: true },
    { name: "", role: "", phone: "", isWhatsApp: true },
  ],

  youtubeUrl: "",
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
  },
}

// ── Package capabilities ──────────────────────────────────────────────────────

export type PackageTier = "bronze" | "silver" | "gold"

export function getPackageTier(packageType: string): PackageTier {
  const p = packageType.toLowerCase()
  if (p.startsWith("bronze")) return "bronze"
  if (p.startsWith("silver")) return "silver"
  return "gold"
}

export interface PackageCapabilities {
  effects: boolean    // particle animation — Silver+
  rsvp: boolean       // RSVP / Wishes — Silver+
  moneyGift: boolean  // bank payment details — Gold only
  wishlist: boolean   // gift registry items — Gold only
}

export function getPackageCapabilities(packageType: string): PackageCapabilities {
  const tier = getPackageTier(packageType)
  return {
    effects:   tier !== "bronze",
    rsvp:      tier !== "bronze",
    moneyGift: tier === "gold",
    wishlist:  tier === "gold",
  }
}

export const OPENING_STYLES = [
  "Tingkap A", "Tingkap B", "Tingkap C",
  "Sampul A", "Menaik",
  "Tiada",
]

export const EFFECT_ANIMATIONS = [
  "Tiada", "Salji #1", "Salji #2", "Bunga #1", "Bunga #2", "Confetti",
]

export const DESIGN_CODES = [
  "FLOO85", "FLOO86", "FLOO87", "FLOO88", "FLOO89",
]

export const WIZARD_FONTS = [
  "Default", "PlayfairScript", "Cormorant", "Spartan",
  "Cinzel", "GreatVibes", "DancingScript", "Montserrat", "Lato",
]
