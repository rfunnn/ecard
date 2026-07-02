import type { WizardConfig } from "@/types/config"

export type TemplateCategory = "WEDDING" | "BIRTHDAY" | "CORPORATE" | "GENERIC"
export type AttendanceStatus = "ATTENDING" | "NOT_ATTENDING" | "MAYBE"
export type ScrollSpeed = "SLOW" | "MEDIUM" | "FAST"
export type AnalyticEvent =
  | "VIEW"
  | "RSVP_OPEN"
  | "RSVP_SUBMIT"
  | "MAP_CLICK"
  | "WHATSAPP_CLICK"
  | "MUSIC_PLAY"
  | "GIFT_CLICK"

export interface GiftItem {
  id: string
  imageUrl: string
  link: string
  label?: string
  sortOrder: number
}

export interface PhotoItem {
  id: string
  imageUrl: string
  caption?: string
  sortOrder: number
}

export interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  bgColor: string
  titleFont: string
  bodyFont: string
  titleSize: number
  bodySize: number
  titleColor: string
  bodyColor: string
  textAlign: "left" | "center" | "right"
  bgImageUrl?: string
  bgOpacity: number
}

export interface MediaConfig {
  youtubeUrl?: string
  youtubeVideoId?: string
  audioEnabled: boolean
  autoplay: boolean
  volume: number
  loopAudio: boolean
}

export interface ScrollConfig {
  autoScroll: boolean
  speed: ScrollSpeed
  pauseOnHover: boolean
}

export interface InvitationCardData {
  id: string
  slug: string
  templateId: string
  title: string
  groomName?: string
  brideName?: string
  subtitle?: string
  eventDate?: string
  eventTime?: string
  venueName?: string
  venueAddress?: string
  venueMapUrl?: string
  description?: string
  footerNote?: string
  whatsappNumber?: string
  contactName?: string
  isPublished: boolean
  language: string
  viewCount: number
  theme: ThemeSettings
  media: MediaConfig
  scrollConfig: ScrollConfig
  template: {
    slug: string
    name: string
    category: TemplateCategory
    image1Url?: string | null
    image2Url?: string | null
  }
  giftItems: GiftItem[]
  photoItems: PhotoItem[]
  wizardConfig?: WizardConfig
  createdAt: string
  updatedAt: string
}

export interface RSVPFormData {
  guestName: string
  attendance: AttendanceStatus
  guestCount: number
  message?: string
  phone?: string
}

export const DEFAULT_THEME: ThemeSettings = {
  primaryColor: "#D4AF37",
  secondaryColor: "#FFF8E7",
  accentColor: "#8B6914",
  bgColor: "#1a0a00",
  titleFont: "Playfair Display",
  bodyFont: "Lato",
  titleSize: 32,
  bodySize: 16,
  titleColor: "#D4AF37",
  bodyColor: "#F5E6C8",
  textAlign: "center",
  bgOpacity: 0.85,
}

export const DEFAULT_MEDIA: MediaConfig = {
  audioEnabled: true,
  autoplay: false,
  volume: 0.5,
  loopAudio: true,
}

export const DEFAULT_SCROLL: ScrollConfig = {
  autoScroll: false,
  speed: "MEDIUM",
  pauseOnHover: true,
}

export const GOOGLE_FONTS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Great Vibes",
  "Dancing Script",
  "Cinzel",
  "EB Garamond",
  "Lato",
  "Montserrat",
  "Open Sans",
  "Raleway",
]

export const SCROLL_SPEED_MS: Record<ScrollSpeed, number> = {
  SLOW: 80,
  MEDIUM: 40,
  FAST: 20,
}
