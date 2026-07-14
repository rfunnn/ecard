/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Save, Eye, X, ShoppingBag, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { useWizardStore, TOTAL_PAGES } from "@/store/wizardStore"
import type { TemplateInfo } from "@/store/wizardStore"
import type { WizardConfig } from "@/types/config"
import { TemplateRenderer } from "@/components/templates/TemplateRenderer"
import type { InvitationCardData, GiftItem, PhotoItem } from "@/types/invitation"
import { addToCart } from "@/lib/cart"
import { CartDrawer } from "@/components/CartDrawer"
import { InviteClient } from "@/components/invite/InviteClient"
import { EffectAnimation } from "@/components/invite/EffectAnimation"
import { OpeningGate } from "@/components/invite/OpeningGate"
import { ActionBar } from "@/components/invite/ActionBar"
import { Page1_Main } from "./pages/Page1_Main"
import { Page2_FrontPage } from "./pages/Page2_FrontPage"
import { Page3_InvitationText } from "./pages/Page3_InvitationText"
import { Page4_Venue } from "./pages/Page4_Venue"
import { Page5_Program } from "./pages/Page5_Program"
import { Page6_Interface } from "./pages/Page6_Interface"
import { Page7_RSVP } from "./pages/Page7_RSVP"
import { Page8_Contact } from "./pages/Page8_Contact"
import { Page9_Music } from "./pages/Page9_Music"
import { Page10_Gift } from "./pages/Page10_Gift"
import { Page11_Photos } from "./pages/Page11_Photos"
import { Page12_Segments } from "./pages/Page12_Segments"

interface Props {
  initialCard: InvitationCardData
  // Guest mode: the card is ephemeral (not in the DB). Saving is disabled and
  // instead sends the visitor to register so their work can be persisted.
  guest?: boolean
}

const PAGE_NAMES_MS = [
  "Utama & Pembukaan",
  "Muka Depan",
  "Ayat Undangan",
  "Tempat & Navigasi",
  "Atur Cara & Lain-lain",
  "Antara Muka",
  "RSVP / Ucapan",
  "Hubungi",
  "Lagu & Auto Skrol",
  "Hadiah",
  "Galeri Foto",
  "Segmen & Tamat",
]

const PAGE_NAMES_EN = [
  "Main & Opening",
  "Front Page",
  "Invitation Text",
  "Venue & Navigation",
  "Programme & Others",
  "Interface",
  "RSVP / Wishes",
  "Contacts",
  "Music & Scroll",
  "Gifts",
  "Photo Gallery",
  "Segments & Done",
]

const PAGE_COMPONENTS = [
  Page1_Main,
  Page2_FrontPage,
  Page3_InvitationText,
  Page4_Venue,
  Page5_Program,
  Page6_Interface,
  Page7_RSVP,
  Page8_Contact,
  Page9_Music,
  Page10_Gift,
  Page11_Photos,
  Page12_Segments,
]

const WARNING_PAGES = new Set([1, 4, 6, 7, 8, 9, 10, 11, 12])

// When a card has no saved wizardConfig (new card or failed save), bootstrap wizard fields
// from the card's existing DB fields so the user sees their data instead of empty defaults.
function buildInitialConfig(card: InvitationCardData): Partial<WizardConfig> {
  const saved = card.wizardConfig as Partial<WizardConfig> | undefined | null
  if (saved && typeof saved === "object" && Object.keys(saved).length > 0) {
    return saved as Partial<WizardConfig>
  }

  const names = [card.groomName, card.brideName].filter(Boolean)
  const patch: Partial<WizardConfig> = {}

  if (names.length) patch.displayName = names.join(" & ")
  else if (card.title) patch.displayName = card.title

  if (card.subtitle)      patch.eventType = card.subtitle
  if (card.venueName)     patch.venueLine = card.venueName
  if (card.venueAddress)  patch.venueAddress = card.venueAddress
  if (card.venueMapUrl)   patch.googleMapsUrl = card.venueMapUrl
  if (card.description)   patch.invitationSpeech = card.description
  if (card.language)      patch.language = card.language as "ms" | "en"
  if (card.theme?.bgColor)   patch.backgroundColor = card.theme.bgColor
  if (card.template?.slug)   patch.designCode = card.template.slug
  if (card.media?.youtubeUrl) { patch.youtubeUrl = card.media.youtubeUrl; patch.showMusicPlayer = true }
  if (card.scrollConfig?.autoScroll) {
    patch.scrollDelay = card.scrollConfig.speed === "SLOW" ? 8 : card.scrollConfig.speed === "FAST" ? 2 : 3.5
  }
  if (card.whatsappNumber) {
    patch.contacts = [
      { name: card.contactName || "", role: "", phone: card.whatsappNumber, isWhatsApp: true },
      { name: "", role: "", phone: "", isWhatsApp: true },
    ]
  }
  if (card.eventDate) {
    try {
      const d = new Date(card.eventDate)
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      patch.startDateTime = local.toISOString().slice(0, 16)
    } catch { /* skip */ }
  }

  return patch
}

function buildCardPreview(
  initialCard: InvitationCardData,
  config: WizardConfig,
  templateOverride?: TemplateInfo | null,
  giftItems?: GiftItem[],
  photoItems?: PhotoItem[]
): InvitationCardData {
  const [groomName, brideName] = config.displayName.includes("&")
    ? config.displayName.split("&").map((s) => s.trim())
    : [config.displayName, ""]

  const startDT = config.startDateTime ? new Date(config.startDateTime) : undefined

  return {
    ...initialCard,
    giftItems:  giftItems  ?? initialCard.giftItems,
    photoItems: photoItems ?? initialCard.photoItems,
    wizardConfig: config,
    template: templateOverride
      ? {
          slug: templateOverride.slug,
          name: templateOverride.nameMs || templateOverride.name,
          category: templateOverride.category,
          image1Url: templateOverride.image1Url ?? null,
          image2Url: templateOverride.image2Url ?? null,
        }
      : initialCard.template,
    language: config.language,
    groomName: groomName || initialCard.groomName,
    brideName: brideName || initialCard.brideName,
    title: config.displayName || initialCard.title,
    subtitle: config.eventType,
    eventDate: startDT?.toISOString() ?? initialCard.eventDate,
    eventTime: startDT
      ? startDT.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })
      : initialCard.eventTime,
    venueName: config.venueLine || initialCard.venueName,
    venueAddress: config.venueAddress || initialCard.venueAddress,
    venueMapUrl: config.googleMapsUrl || initialCard.venueMapUrl,
    description: config.invitationSpeech || initialCard.description,
    whatsappNumber: config.contacts[0]?.isWhatsApp ? config.contacts[0].phone : initialCard.whatsappNumber,
    contactName: config.contacts[0]?.name || initialCard.contactName,
    theme: {
      ...initialCard.theme,
      bgColor: config.backgroundColor,
      bodyFont: config.generalFont,
      titleFont: config.headingFont,
      bodySize: config.generalSize,
      titleSize: config.headingSize,
      bodyColor: config.generalColor,
    },
    media: {
      ...initialCard.media,
      youtubeUrl: config.youtubeUrl || undefined,
      youtubeVideoId: config.youtubeUrl
        ? (config.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/\s]{11})/)?.[1] ?? undefined)
        : undefined,
      autoplay: config.autoplayMusic,
      audioEnabled: config.showMusicPlayer,
    },
    scrollConfig: {
      ...initialCard.scrollConfig,
      autoScroll: config.scrollDelay > 0,
      speed: config.scrollDelay <= 2 ? "FAST" : config.scrollDelay <= 5 ? "MEDIUM" : "SLOW",
    },
  }
}

export function WizardShell({ initialCard, guest = false }: Props) {
  const router = useRouter()
  const {
    config,
    cardSlug,
    currentPage,
    isDirty,
    isSaving,
    templateOverride,
    giftItems,
    photoItems,
    setPage,
    nextPage,
    prevPage,
    setCardSlug,
    setIsPublished,
    setIsSaving,
    markClean,
    loadConfig,
    setGiftItems,
    setPhotoItems,
  } = useWizardStore()

  const isMs = config.language === "ms"
  const pageNames = isMs ? PAGE_NAMES_MS : PAGE_NAMES_EN

  const [cartOpen, setCartOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [previewGateOpen, setPreviewGateOpen] = useState(
    () => (config.openingStyle ?? "Tiada") !== "Tiada"
  )
  const [modalGateOpen, setModalGateOpen] = useState(false)

  const searchParams = useSearchParams()
  const desktopScrollRef = useRef<HTMLDivElement | undefined>(undefined)

  // Jump to a specific wizard page when ?page=N is in the URL (e.g. from dashboard quick-links)
  useEffect(() => {
    const p = Number(searchParams.get("page"))
    if (p >= 1 && p <= TOTAL_PAGES) setPage(p)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load config when opening a card for the first time or switching cards.
  // Keeps in-memory edits intact when navigating within the same card.
  useEffect(() => {
    if (cardSlug !== initialCard.slug) {
      loadConfig(buildInitialConfig(initialCard))
      setCardSlug(initialCard.slug)
      setIsPublished(initialCard.isPublished)
      setGiftItems(initialCard.giftItems)
      setPhotoItems(initialCard.photoItems)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCard.slug])

  // Reset scroll to top whenever the user switches config pages.
  // Each page now renders only its own sections so there is nothing above to scroll into.
  useEffect(() => {
    if (desktopScrollRef.current) desktopScrollRef.current.scrollTop = 0
  }, [currentPage])

  const cardPreview = useMemo(
    () => buildCardPreview(initialCard, config, templateOverride, giftItems, photoItems),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, templateOverride, giftItems, photoItems],
  )

  const showToast = useCallback((type: "success" | "error", msg: string) => {
    clearTimeout(toastTimerRef.current)
    setToast({ type, msg })
    toastTimerRef.current = setTimeout(() => setToast(null), 3500)
  }, [])

  const save = useCallback(async () => {
    // Guests have no card to save to — send them to register. Their in-memory
    // edits are intentionally discarded (a fresh account starts clean).
    if (guest) {
      router.push(`/register?callbackUrl=${encodeURIComponent("/templates")}`)
      return
    }
    setIsSaving(true)
    try {
      const { theme, media, scrollConfig, ...rest } = cardPreview
      const payload: Record<string, unknown> = { ...rest, theme, media, scrollConfig, wizardConfig: config }
      if (templateOverride) payload.templateId = templateOverride.id
      const res = await fetch(`/api/cards/${initialCard.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        showToast("error", isMs ? "Gagal menyimpan. Cuba semula." : "Failed to save. Please try again.")
        return
      }
      if (!initialCard.isPublished) addToCart(initialCard.slug)
      markClean()
      showToast("success", isMs ? "Berjaya disimpan!" : "Saved successfully!")
    } catch {
      showToast("error", isMs ? "Tiada sambungan. Cuba semula." : "No connection. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }, [guest, router, cardPreview, config, isMs, initialCard.isPublished, initialCard.slug, markClean, setIsSaving, templateOverride, showToast])

  const handlePreviewOpen = useCallback(() => {
    setPreviewOpen(true)
  }, [])


  const previewEffect      = config.effectAnimation ?? "Tiada"
  const previewEffectColor = config.effectColor ?? "#ffffff"
  const previewEffectScale = (config.effectSize ?? 100) / 100
  const previewOpenStyle   = config.openingStyle ?? "Tiada"
  const previewOpenColor   = config.openingStyleColor ?? "#1a1a1a"

  // Reset gate whenever the user picks a new opening style
  useEffect(() => {
    setPreviewGateOpen(previewOpenStyle !== "Tiada")
  }, [previewOpenStyle])

  // Reset modal gate when modal opens
  useEffect(() => {
    if (previewOpen) setModalGateOpen(previewOpenStyle !== "Tiada")
  }, [previewOpen, previewOpenStyle])

  const isLastPage = currentPage === TOTAL_PAGES
  const CurrentPage = PAGE_COMPONENTS[currentPage - 1]
  const pageName = pageNames[currentPage - 1]
  const showWarning = WARNING_PAGES.has(currentPage)

  return (
    <div className="flex h-screen bg-white overflow-hidden">

      {/* ── Toast notification (top-right) ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.msg + toast.type}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{    opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed top-4 right-4 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-xs"
            style={toast.type === "success"
              ? { background: "#f0fdf4", borderColor: "#bbf7d0", color: "#15803d" }
              : { background: "#fef2f2", borderColor: "#fecaca", color: "#b91c1c" }
            }
          >
            {toast.type === "success"
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle  className="w-4 h-4 shrink-0" />
            }
            <span>{toast.msg}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Left: Form ── */}
      <div className="flex flex-col w-full lg:max-w-lg xl:max-w-xl bg-white border-r border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="shrink-0 border-b border-gray-100 px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <Link href={guest ? "/templates" : "/dashboard"} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              {guest ? (isMs ? "Templat" : "Templates") : "Dashboard"}
            </Link>
            <div className="flex items-center gap-1">
              {guest && (
                <span className="text-[10px] font-bold tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  {isMs ? "CUBAAN" : "TRIAL"}
                </span>
              )}
              {initialCard.isPublished && (
                <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              )}
              <button
                type="button"
                onClick={handlePreviewOpen}
                className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors px-2 py-1 rounded-md hover:bg-amber-50"
              >
                <Eye className="w-3.5 h-3.5" />
                {isMs ? "Lihat Kad" : "View Card"}
              </button>
              {!guest && !initialCard.isPublished && (
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {isMs ? "Kad Saya" : "My Cards"}
                </button>
              )}
            </div>
          </div>
          <div className="text-center pb-1">
            <h1 className="text-base font-bold tracking-wide text-gray-900">EDIT CARD</h1>
            <p className="text-sm text-amber-600 underline decoration-amber-600/50 mt-0.5">{pageName}</p>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <CurrentPage />
        </div>

        {/* Bottom nav */}
        <div className="shrink-0 border-t border-gray-200 bg-white">
          {/* Nav bar */}
          <div className="flex items-center gap-2 px-3 py-2.5">
            {/* Back arrow */}
            <button
              type="button"
              onClick={prevPage}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:opacity-30 hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page selector */}
            <select
              value={currentPage}
              onChange={(e) => setPage(Number(e.target.value))}
              className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-700 bg-white outline-none text-center"
            >
              {pageNames.map((name, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}. {name}
                </option>
              ))}
            </select>

            {/* Next / Save */}
            {isLastPage ? (
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md disabled:opacity-60 transition-colors"
              >
                {isSaving ? "..." : guest ? (isMs ? "DAFTAR" : "SIGN UP") : "SAVE"}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextPage}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Save icon (always visible) */}
            <button
              type="button"
              onClick={save}
              disabled={isSaving}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              title={isMs ? "Simpan" : "Save"}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </button>

            {/* Mobile preview toggle (hidden on desktop which already shows preview) */}
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-amber-300 text-amber-600 hover:bg-amber-50 lg:hidden"
              title={isMs ? "Pratonton" : "Preview"}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Warning */}
          {showWarning && (
            <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100 text-center">
              <p className="text-[11px] text-yellow-700">{isMs ? "Pastikan browser anda bukan dalam dark mode" : "Make sure your browser is not in dark mode"}</p>
              <p className="text-[11px] text-yellow-600">{isMs ? "Preview ini tidak sepenuhnya tepat seperti produk sebenar" : "This preview may not exactly match the final card"}</p>
            </div>
          )}

          {/* Unsaved indicator */}
          {isDirty && !isSaving && (
            <div className="px-4 py-1.5 bg-blue-50 border-t border-blue-100 text-center">
              <p className="text-[11px] text-blue-600">{isMs ? "Terdapat perubahan yang belum disimpan" : "You have unsaved changes"}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Live Preview (desktop only) ── */}
      <div className="hidden lg:flex flex-1 bg-gray-100 items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {/* Phone frame */}
          <div className="relative h-full max-h-[780px]" style={{ aspectRatio: "9/19.5" }}>
            <div className="absolute inset-0 rounded-[44px] border-[8px] border-gray-800 shadow-2xl overflow-hidden z-10 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: cardPreview.theme?.bgColor ?? "#0a0a0a",
                  backgroundImage: cardPreview.template?.image2Url
                    ? `url(${cardPreview.template.image2Url})`
                    : cardPreview.theme?.bgImageUrl
                    ? `linear-gradient(rgba(0,0,0,${cardPreview.theme.bgOpacity}),rgba(0,0,0,${cardPreview.theme.bgOpacity})),url(${cardPreview.theme.bgImageUrl})`
                    : "none",
                  backgroundSize: cardPreview.template?.image2Url ? "cover" : "100% auto",
                  backgroundPosition: cardPreview.template?.image2Url ? "center" : "top center",
                  backgroundRepeat: cardPreview.template?.image2Url ? undefined : "no-repeat",
                }}
              />
              {/* Particle effect — contained inside phone frame */}
              <EffectAnimation effect={previewEffect} color={previewEffectColor} sizeScale={previewEffectScale} contained />

              {/* Opening gate — only shown on config page 1 */}
              {previewOpenStyle !== "Tiada" && previewGateOpen && currentPage === 1 && (
                <div style={{ pointerEvents: "auto" }}>
                  <OpeningGate
                    key={previewOpenStyle}
                    style={previewOpenStyle}
                    color={previewOpenColor}
                    onOpen={() => setPreviewGateOpen(false)}
                    displayName={config.displayName}
                    eventType={config.eventType}
                    eventDate={config.dayAndDate}
                  />
                </div>
              )}

              <div
                ref={(el) => { if (el) desktopScrollRef.current = el }}
                className="absolute inset-0 overflow-y-auto overflow-x-hidden z-10"
                style={{ scrollbarWidth: "none", pointerEvents: "auto" }}
              >
                {cardPreview.template?.image1Url && (
                  <div className="absolute top-0 left-0 right-0 pointer-events-none z-0" style={{ height: "100svh" }}>
                    <img src={cardPreview.template.image1Url} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                  </div>
                )}
                <div className="relative z-10">
                  <TemplateRenderer card={cardPreview} previewPage={currentPage} />
                </div>
              </div>

              {/* Action bar — contained inside phone screen */}
              <div style={{ pointerEvents: "auto" }}>
                <ActionBar card={cardPreview} contained />
              </div>
            </div>
            {/* Notch */}
            <div className="absolute top-1.5 left-0 right-0 flex justify-center z-20 pointer-events-none">
              <div className="w-24 h-5 bg-gray-800 rounded-b-xl" />
            </div>
            {/* Home indicator */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center z-20 pointer-events-none">
              <div className="w-16 h-1 bg-gray-600 rounded-full opacity-60" />
            </div>
          </div>
        </div>

        {/* Page indicator */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {Array.from({ length: TOTAL_PAGES }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`rounded-full transition-all ${
                currentPage === i + 1
                  ? "w-6 h-2 bg-amber-500"
                  : "w-2 h-2 bg-gray-400 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>

        {/* Quick nav label */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">{isMs ? "Pratonton Langsung" : "Live Preview"}</p>
          <p className="text-sm font-semibold text-gray-800">{pageName}</p>
        </div>

        {/* Full preview button */}
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={handlePreviewOpen}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {isMs ? "Lihat Kad Penuh" : "View Full Card"}
          </button>
        </div>
      </div>

      {/* ── Preview Modal (pratonton) ── */}
      <AnimatePresence>
        {previewOpen && (
          <>
            <motion.div
              key="preview-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-sm"
              onClick={() => setPreviewOpen(false)}
            />
            <motion.div
              key="preview-modal"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="fixed inset-0 z-[151] flex flex-col items-center justify-center p-4 pointer-events-none"
            >
              {/* Close button row */}
              <div className="w-full max-w-xs flex justify-end mb-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                  {isMs ? "Tutup" : "Close"}
                </button>
              </div>

              {/* Phone frame */}
              <div
                className="relative pointer-events-auto"
                style={{ height: "calc(100dvh - 80px)", maxHeight: "780px", aspectRatio: "9/19.5" }}
              >
                <div className="absolute inset-0 rounded-[44px] border-[8px] border-gray-800 shadow-2xl overflow-hidden z-10">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: cardPreview.theme?.bgColor ?? "#0a0a0a",
                      backgroundImage: cardPreview.template?.image2Url
                        ? `url(${cardPreview.template.image2Url})`
                        : cardPreview.theme?.bgImageUrl
                        ? `linear-gradient(rgba(0,0,0,${cardPreview.theme.bgOpacity}),rgba(0,0,0,${cardPreview.theme.bgOpacity})),url(${cardPreview.theme.bgImageUrl})`
                        : "none",
                      backgroundSize: cardPreview.template?.image2Url ? "cover" : "100% auto",
                      backgroundPosition: cardPreview.template?.image2Url ? "center" : "top center",
                      backgroundRepeat: cardPreview.template?.image2Url ? undefined : "no-repeat",
                    }}
                  />
                  <EffectAnimation effect={previewEffect} color={previewEffectColor} sizeScale={previewEffectScale} contained />

                  {previewOpenStyle !== "Tiada" && modalGateOpen && (
                    <div style={{ pointerEvents: "auto" }}>
                      <OpeningGate
                        key={previewOpenStyle}
                        style={previewOpenStyle}
                        color={previewOpenColor}
                        onOpen={() => setModalGateOpen(false)}
                        displayName={config.displayName}
                        eventType={config.eventType}
                        eventDate={config.dayAndDate}
                      />
                    </div>
                  )}

                  <div
                    className="absolute inset-0 overflow-y-auto overflow-x-hidden z-10"
                    style={{ scrollbarWidth: "none", pointerEvents: "auto" }}
                  >
                    {cardPreview.template?.image1Url && (
                      <div className="absolute top-0 left-0 right-0 pointer-events-none z-0" style={{ height: "100svh" }}>
                        <img src={cardPreview.template.image1Url} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                      </div>
                    )}
                    <div className="relative z-10">
                      <TemplateRenderer card={cardPreview} />
                    </div>
                  </div>

                  <div style={{ pointerEvents: "auto" }}>
                    <ActionBar card={cardPreview} contained />
                  </div>
                </div>
                {/* Notch */}
                <div className="absolute top-1.5 left-0 right-0 flex justify-center z-20 pointer-events-none">
                  <div className="w-24 h-5 bg-gray-800 rounded-b-xl" />
                </div>
                {/* Home indicator */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center z-20 pointer-events-none">
                  <div className="w-16 h-1 bg-gray-600 rounded-full opacity-60" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
