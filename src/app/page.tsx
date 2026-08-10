"use client"

import Link from "next/link"
import { ArrowRight, Music, Share2, Sparkles, Check, Eye, Clock } from "lucide-react"
import Image from "next/image"
import UserMenu from "@/components/UserMenu"
import { HomepagePhoneMockup } from "@/components/HomepagePhoneMockup"
import { AnimatedWord } from "@/components/AnimatedWord"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { useT } from "@/lib/i18n"
import { PartnerLogosMarquee } from "@/components/PartnerLogosMarquee"

const FEATURE_ICONS = [Sparkles, Music, Share2, Clock]

const FEATURE_ACCENTS = [
  { topBorder: "#FFCC00", iconBg: "rgba(255,204,0,0.14)",  iconColor: "#9a7a00", hoverGlow: "rgba(255,204,0,0.10)" },
  { topBorder: "#7c3aed", iconBg: "rgba(124,58,237,0.12)", iconColor: "#7c3aed", hoverGlow: "rgba(124,58,237,0.09)" },
  { topBorder: "#0284c7", iconBg: "rgba(2,132,199,0.12)",  iconColor: "#0284c7", hoverGlow: "rgba(2,132,199,0.09)"  },
  { topBorder: "#10b981", iconBg: "rgba(16,185,129,0.12)", iconColor: "#059669", hoverGlow: "rgba(16,185,129,0.09)" },
]

const PACKAGES = [
  {
    name: "Basic", emoji: "⭐",
    headerBg: "linear-gradient(135deg, #c8945a, #a06b3a)",
    price: "RM30",
    popular: false,
    features: [
      { label: "Calendar",   bold: false },
      { label: "Contacts",   bold: false },
      { label: "Countdown",  bold: false },
      { label: "Navigation", bold: false },
      { label: "Song",       bold: false },
    ],
  },
  {
    name: "Pro", emoji: "🚀",
    headerBg: "linear-gradient(135deg, #9CA3AF, #6B7280)",
    price: "RM40",
    popular: true,
    features: [
      { label: "Calendar",       bold: false },
      { label: "Contacts",       bold: false },
      { label: "Countdown",      bold: false },
      { label: "Navigation",     bold: false },
      { label: "Song",           bold: false },
      { label: "+ Effects",      bold: true  },
      { label: "+ Attendance",   bold: true  },
      { label: "+ RSVP/Wish",    bold: true  },
    ],
  },
  {
    name: "Premium", emoji: "💎",
    headerBg: "linear-gradient(135deg, #D4AF37, #a07820)",
    price: "RM40",
    popular: false,
    features: [
      { label: "Calendar",            bold: false },
      { label: "Contacts",            bold: false },
      { label: "Countdown",           bold: false },
      { label: "Navigation",          bold: false },
      { label: "Song",                bold: false },
      { label: "Effects",             bold: false },
      { label: "Attendance",          bold: false },
      { label: "RSVP/Wish",           bold: false },
      { label: "+ Weather Forecast",  bold: true  },
      { label: "+ Photo Gallery",     bold: true  },
      { label: "+ Money Gift",        bold: true  },
      { label: "+ Wishlist",          bold: true  },
      { label: "+ Custom Link",       bold: true  },
    ],
  },
]

/* Fresh yellow used as a non-gold accent specifically on this page */
const Y = "#FFCC00"
const Y_DARK = "#141414"

export default function HomePage() {
  const t = useT()
  const h = t.home

  return (
    <div className="min-h-screen bg-[var(--pg)] overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 lg:px-10 py-3.5 bg-[var(--pg-nav)] backdrop-blur-md border-b border-[var(--bd)]">
        <div className="flex items-center gap-2">
          <Image src="/icon.png" alt="ekadku" width={20} height={20} className="rounded-sm" />
          <span className="font-playfair text-[17px] tracking-wide leading-none">
            <span className="text-[var(--tx-1)]">e</span>
            <span style={{ color: Y }}>kad</span>
            <span className="text-[var(--tx-1)]">ku</span>
            <span style={{ color: Y, opacity: 0.5 }} className="text-[10px] font-sans tracking-normal align-baseline">.com</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[100svh] flex flex-col pt-14 overflow-x-hidden">

        {/* Subtle non-yellow atmosphere — violet top-right, teal bottom-left */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-[130px]"
            style={{ background: "#7c3aed", opacity: 0.06 }}
          />
          <div
            className="absolute bottom-0 -left-16 w-[360px] h-[360px] rounded-full blur-[120px]"
            style={{ background: "#0891b2", opacity: 0.05 }}
          />
        </div>

        {/* Text content */}
        <div className="w-full max-w-3xl mx-auto px-5 lg:px-10 flex flex-col items-center text-center gap-8 py-8 relative z-10">
          <div className="flex flex-col items-center text-center">

            {/* Badge — solid bright yellow */}
            <div
              className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase mb-3 rounded-full px-3.5 py-1.5 font-bold"
              style={{ background: Y, color: Y_DARK }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              {h.badge}
            </div>

            <AnimatedWord />

            <p className="text-[var(--tx-2)] text-[13px] lg:text-lg leading-relaxed max-w-sm lg:max-w-md mb-5 lg:mb-10">
              {h.heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mb-5 lg:mb-10">
              <Link
                href="/templates"
                className="inline-flex items-center justify-center gap-2 font-bold px-6 py-2.5 rounded-full transition-all active:scale-95 text-[13px] sm:text-[15px]"
                style={{
                  background: Y,
                  color: Y_DARK,
                  boxShadow: `0 6px 24px ${Y}70`,
                }}
              >
                {h.heroCta}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/invite/demo"
                className="inline-flex items-center justify-center gap-2 border border-[var(--bd)] hover:border-[var(--tx-3)] text-[var(--tx-1)] hover:bg-[var(--sf)] px-6 py-2.5 rounded-full transition-all text-[13px] sm:text-[15px] active:scale-95"
              >
                <Eye className="w-4 h-4 text-[var(--tx-3)]" />
                {h.heroDemo}
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-x-3 gap-y-2 w-full max-w-xs mx-auto">
              {h.perks.map((p) => (
                <div key={p} className="flex items-center gap-1.5 text-[var(--tx-3)] text-[12px] sm:text-[13px]">
                  <Check className="w-2.5 h-2.5 shrink-0" style={{ color: Y }} />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full-width yellow phone row */}
        <div
          className="w-full flex justify-center items-end relative z-10 overflow-hidden"
          style={{
            background: `linear-gradient(150deg, #FFFDE0 0%, #FFF5A0 35%, #FFE033 65%, ${Y} 100%)`,
            paddingTop: "3.5rem",
            paddingBottom: "3.5rem",
          }}
        >
          {/* Wave mask — blends section top into page background */}
          <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 72 }}>
            <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,0 C360,72 1080,0 1440,72 L1440,0 L0,0 Z" fill="var(--pg)" />
            </svg>
          </div>
          {/* Soft white spotlight bloom behind phone */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "50%",
              height: "80%",
              background: "radial-gradient(ellipse at center bottom, rgba(255,255,255,0.60) 0%, transparent 65%)",
            }}
          />
          <HomepagePhoneMockup />
          {/* Curved bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 56 }}>
            <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,56 Q720,0 1440,56 L1440,56 L0,56 Z" fill="var(--pg)" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-10 lg:py-28 px-5 lg:px-10 border-t border-[var(--bd)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-7 lg:mb-14">
            <p className="text-[10px] tracking-[0.3em] uppercase mb-2 font-bold" style={{ color: Y_DARK }}>
              {h.howItWorksLabel}
            </p>
            <h2 className="font-playfair text-2xl lg:text-4xl text-[var(--tx-1)]">{h.howItWorksTitle}</h2>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-3 gap-5 lg:gap-10">
            {h.steps.map(({ num, label, desc }) => (
              <div key={num} className="flex flex-col items-center text-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: Y,
                    boxShadow: `0 4px 18px ${Y}60`,
                  }}
                >
                  <span className="font-playfair text-lg font-bold leading-none" style={{ color: Y_DARK }}>{num}</span>
                </div>
                <div>
                  <h3 className="font-playfair text-lg text-[var(--tx-1)] mb-1.5">{label}</h3>
                  <p className="text-[var(--tx-2)] text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-10 lg:py-28 px-5 lg:px-10 bg-[var(--pg-alt)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-7 lg:mb-14">
            <p className="text-[10px] tracking-[0.3em] uppercase mb-2 font-bold" style={{ color: Y_DARK }}>
              {h.featuresLabel}
            </p>
            <h2 className="font-playfair text-2xl lg:text-4xl text-[var(--tx-1)]">{h.featuresTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {h.features.map(({ title, desc }, idx) => {
              const Icon = FEATURE_ICONS[idx]
              const accent = FEATURE_ACCENTS[idx]
              return (
                <div
                  key={title}
                  className="relative flex flex-col items-center text-center gap-3 p-3.5 lg:p-7 rounded-xl lg:rounded-2xl bg-[var(--pg)] transition-all group overflow-hidden"
                  style={{
                    borderLeft: "1px solid var(--bd)",
                    borderRight: "1px solid var(--bd)",
                    borderBottom: "1px solid var(--bd)",
                    borderTop: `3px solid ${accent.topBorder}`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top, ${accent.hoverGlow} 0%, transparent 65%)` }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: accent.iconBg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: accent.iconColor }} />
                  </div>
                  <div>
                    <h3 className="font-playfair text-[13px] lg:text-base text-[var(--tx-1)] mb-0.5 lg:mb-1.5">{title}</h3>
                    <p className="text-[var(--tx-2)] text-[11px] lg:text-[13px] leading-relaxed">{desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section className="py-16 lg:py-28 border-t border-[var(--bd)] bg-[var(--pg)]">
        <div className="max-w-5xl mx-auto">
          <div className="px-5 lg:px-10">
            <h2 className="font-playfair text-3xl lg:text-5xl text-[var(--tx-1)] text-center mb-7 lg:mb-14">{h.packagesTitle}</h2>
          </div>

          <div className="-mx-0 lg:mx-0 px-5 lg:px-10">
            <div className="flex justify-center lg:grid lg:grid-cols-3 gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x snap-mandatory lg:snap-none scrollbar-hide mb-6 lg:mb-8">
              {PACKAGES.map(({ name, emoji, headerBg, price, features }) => (
                <div
                  key={name}
                  className="rounded-2xl overflow-hidden border border-[var(--bd)] bg-[var(--pg-alt)] flex flex-col shrink-0 snap-center relative"
                  style={{ width: "clamp(100px, 28vw, 180px)" }}
                >
                  <div
                    className="py-2.5 text-center"
                    style={{ background: headerBg }}
                  >
                    <span className="text-white font-bold text-xs tracking-wide">{name} {emoji}</span>
                  </div>
                  <div className="flex-1 pt-3 pb-2 px-3 flex flex-col items-center">
                    <div className="space-y-1 text-center text-[11px] w-full">
                      {features.map(({ label, bold }) => (
                        <p key={label} className={bold ? "font-bold text-[var(--tx-1)]" : "text-[var(--tx-2)]"}>
                          {label}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="px-3 pt-3 pb-3 flex flex-col items-center gap-2.5 border-t border-[var(--bd)] mt-2">
                    <p className="text-2xl font-light text-[var(--tx-1)] leading-none">{price}</p>
                    <Link
                      href={`/invite/demo?package=${name.toLowerCase()}`}
                      className="w-full flex items-center justify-center gap-1.5 text-white text-[10px] font-bold tracking-[0.1em] px-4 py-2 rounded-lg transition-all hover:opacity-90 active:scale-95"
                      style={{ background: headerBg }}
                    >
                      <Eye className="w-3 h-3 opacity-90" />
                      {h.packagesViewDemo}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 lg:px-10">
            <p className="text-center text-[13px] text-[var(--tx-2)] mb-12 lg:mb-16">
              {h.packagesNote}{" "}
              <span className="text-blue-500 dark:text-blue-400">{h.packagesNoteHighlight}</span>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Partner Logos Marquee ── */}
      <PartnerLogosMarquee />

      {/* ── Partner Section ── */}
      <section className="py-14 lg:py-24 px-5 lg:px-10 border-t border-[var(--bd)]">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-[var(--bd)] bg-[var(--pg-alt)] overflow-hidden">
            <div className="px-6 py-8 lg:px-12 lg:py-10 flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
              <div className="flex-1 text-center lg:text-left">
                <p className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2" style={{ color: Y }}>
                  {h.partnerLabel}
                </p>
                <h2 className="font-playfair text-2xl lg:text-3xl text-[var(--tx-1)] mb-3">
                  {h.partnerTitle}
                </h2>
                <p className="text-[14px] text-[var(--tx-2)] leading-relaxed mb-2">
                  {h.partnerDesc1}
                </p>
                <p className="text-[14px] text-[var(--tx-2)] leading-relaxed mb-6">
                  {h.partnerDesc2}
                </p>
                <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                  <Link
                    href="/partner/register"
                    className="inline-flex items-center gap-2 font-bold px-7 py-3 rounded-full transition-all active:scale-95 text-[14px]"
                    style={{ background: Y, color: Y_DARK }}
                  >
                    {h.partnerCta} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/partner/panduan"
                    className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full border border-[var(--bd)] text-[14px] text-[var(--tx-2)] hover:border-[var(--tx-3)] transition-all active:scale-95"
                  >
                    {h.partnerLearnMore}
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 shrink-0 w-full lg:w-auto lg:max-w-xs">
                {h.partnerTypes.map(({ label, emoji }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--bd)] bg-[var(--pg)]">
                    <span className="text-base">{emoji}</span>
                    <span className="text-[12px] font-medium text-[var(--tx-2)]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-10 lg:py-28 px-5 lg:px-10 border-t border-[var(--bd)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: h.faqs.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            }),
          }}
        />
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-7 lg:mb-14">
            <p className="text-[10px] tracking-[0.3em] uppercase mb-2 font-bold" style={{ color: Y_DARK }}>
              {h.faqLabel}
            </p>
            <h2 className="font-playfair text-2xl lg:text-4xl text-[var(--tx-1)]">{h.faqTitle}</h2>
          </div>
          <div className="flex flex-col gap-2">
            {h.faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group border border-[var(--bd)] rounded-xl bg-[var(--pg-alt)] transition-all"
                style={{ ["--open-color" as string]: Y }}
              >
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none select-none">
                  <span className="font-medium text-[13px] lg:text-[15px] text-[var(--tx-1)]">{q}</span>
                  <span
                    className="text-lg shrink-0 group-open:rotate-45 transition-transform duration-200"
                    style={{ color: Y }}
                  >
                    +
                  </span>
                </summary>
                <p className="px-5 pb-4 text-[13px] lg:text-[14px] text-[var(--tx-2)] leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — bright yellow block ── */}
      <section className="py-14 lg:py-28 px-5 lg:px-10 relative overflow-hidden" style={{ background: Y }}>
        {/* Subtle inner shadow rings for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.25) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <Sparkles className="w-5 h-5 mx-auto mb-4" style={{ color: Y_DARK, opacity: 0.4 }} />
          <h2 className="font-playfair text-2xl lg:text-4xl mb-3 lg:mb-4" style={{ color: Y_DARK }}>
            {h.ctaTitle}
          </h2>
          <p className="text-[14px] lg:text-base mb-8 lg:mb-10 leading-relaxed max-w-md mx-auto" style={{ color: `${Y_DARK}99` }}>
            {h.ctaDesc}
          </p>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full transition-all active:scale-95 text-[15px]"
            style={{
              background: Y_DARK,
              color: Y,
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            }}
          >
            {h.ctaBtn} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[var(--pg-alt)] border-t border-[var(--bd)]">
        <div className="max-w-5xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--tx-3)]">
          <p>© {new Date().getFullYear()} ekadku.com</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[var(--tx-1)] transition-colors">{h.footerPrivacy}</Link>
            <Link href="/terms" className="hover:text-[var(--tx-1)] transition-colors">{h.footerTerms}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
