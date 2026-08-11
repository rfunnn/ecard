"use client"

import Link from "next/link"
import Image from "next/image"
import { useT } from "@/lib/i18n"
import UserMenu from "@/components/UserMenu"
import {
  Globe, CreditCard, FileText, BadgeCheck, LayoutDashboard,
  Users, ChevronRight, MessageCircleQuestion,
} from "lucide-react"

const WA_URL = `https://wa.me/601164981201?text=${encodeURIComponent("Hello, saya ingin bertanya tentang Program Partner ekadku.com")}`

const BENEFIT_ICONS = [
  <Globe key="globe" className="w-5 h-5 text-gold" />,
  <LayoutDashboard key="dash" className="w-5 h-5 text-gold" />,
  <Users key="users" className="w-5 h-5 text-gold" />,
  <BadgeCheck key="badge" className="w-5 h-5 text-gold" />,
]

const BILLING_ICONS = [
  <FileText key="ft1" className="w-4 h-4 text-[var(--tx-3)]" />,
  <CreditCard key="cc" className="w-4 h-4 text-[var(--tx-3)]" />,
  <FileText key="ft2" className="w-4 h-4 text-[var(--tx-3)]" />,
  <BadgeCheck key="bc" className="w-4 h-4 text-[var(--tx-3)]" />,
]

interface Props {
  partnerRate: number | null
  partnerSlug: string | null
  isPartner: boolean
  baseDomain: string
}

export function PanduanClient({ partnerRate, partnerSlug, isPartner, baseDomain }: Props) {
  const t = useT()
  const p = t.panduan

  const rateDisplay = partnerRate !== null
    ? `RM${(partnerRate / 100).toFixed(2)}`
    : p.pricingRateRange

  const subdomainUrl = `https://your-company.${baseDomain}`

  function benefitDesc(desc: string) {
    return desc.replace("{domain}", baseDomain)
  }

  return (
    <div className="min-h-screen bg-[var(--pg)]">
      <header className="sticky top-0 z-40 bg-[var(--pg-nav)] backdrop-blur-md border-b border-[var(--bd)]">
        <div className="flex items-center justify-between px-5 lg:px-10 h-14">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/icon.png" alt="ekadku" width={20} height={20} className="rounded-sm" />
            <span className="font-playfair text-[16px] tracking-wide leading-none select-none">
              <span className="text-[var(--tx-1)]">e</span>
              <span className="text-gold">kad</span>
              <span className="text-[var(--tx-1)]">ku</span>
              <span className="text-gold/50 text-[10px] font-sans tracking-normal align-baseline">.com</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {isPartner && (
              <Link href="/partner/dashboard" className="text-xs text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors hidden sm:block">
                {p.navDashboard}
              </Link>
            )}
            {!isPartner && (
              <Link href="/partner/register" className="text-xs font-semibold text-gold hover:opacity-80 transition-opacity hidden sm:block">
                {p.navRegister}
              </Link>
            )}
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Hero */}
        <div className="text-center space-y-3 py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[11px] font-semibold uppercase tracking-wider">
            {p.badge}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--tx-1)] leading-snug">
            {p.heroTitle}
          </h1>
          <p className="text-sm text-[var(--tx-2)] max-w-lg mx-auto leading-relaxed">
            {p.heroDesc}
          </p>
          {!isPartner && (
            <Link
              href="/partner/register"
              className="inline-flex items-center gap-1.5 mt-2 px-5 py-2.5 rounded-full bg-gold text-black text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {p.heroCta} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Benefits */}
        <section className="space-y-3">
          <SectionHeading>{p.benefitsHeading}</SectionHeading>
          <div className="grid sm:grid-cols-2 gap-3">
            {p.benefits.map((b, i) => (
              <div key={i} className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-xl p-4 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center">
                  {BENEFIT_ICONS[i]}
                </div>
                <p className="text-sm font-semibold text-[var(--tx-1)]">{b.title}</p>
                <p className="text-sm text-[var(--tx-2)] leading-relaxed">{benefitDesc(b.desc)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-3">
          <SectionHeading>{p.howItWorksHeading}</SectionHeading>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl divide-y divide-[var(--bd)]">
            {p.steps.map((s, i) => (
              <div key={i} className="flex gap-4 px-5 py-4">
                <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] font-black text-gold">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--tx-1)]">{s.title}</p>
                  <p className="text-sm text-[var(--tx-2)] mt-0.5 leading-relaxed">
                    {s.body.replace(`nama-anda.${baseDomain}`, partnerSlug ? `${partnerSlug}.${baseDomain}` : `nama-anda.${baseDomain}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-3">
          <SectionHeading>{p.pricingHeading}</SectionHeading>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--tx-1)]">{p.pricingRateLabel}</p>
                <p className="text-xs text-[var(--tx-3)] mt-0.5">
                  {partnerRate !== null ? p.pricingRateDesc : p.pricingRateDescGeneric}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gold">{rateDisplay}</p>
                <p className="text-[11px] text-[var(--tx-3)]">{p.pricingPerCard}</p>
              </div>
            </div>
            <div className="border-t border-[var(--bd)] pt-4 space-y-2 text-sm text-[var(--tx-2)]">
              {p.pricingBullets.map((b, i) => (
                <p key={i}>• {b}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Billing */}
        <section className="space-y-3">
          <SectionHeading>{p.billingHeading}</SectionHeading>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl divide-y divide-[var(--bd)]">
            {p.billingRows.map((row, i) => (
              <div key={i} className="flex gap-3 px-5 py-4">
                <div className="mt-0.5 shrink-0">{BILLING_ICONS[i]}</div>
                <div>
                  <p className="text-xs font-semibold text-[var(--tx-3)] uppercase tracking-wide">{row.label}</p>
                  <p className="text-sm text-[var(--tx-2)] mt-0.5 leading-relaxed">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subdomain */}
        <section className="space-y-3">
          <SectionHeading>{p.subdomainHeading}</SectionHeading>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 bg-[var(--pg)] border border-[var(--bd)] rounded-xl px-4 py-3">
              <Globe className="w-4 h-4 shrink-0 text-[var(--tx-3)]" />
              <span className="font-mono text-sm text-[var(--tx-3)]">{subdomainUrl}</span>
            </div>
            <div className="space-y-2 text-sm text-[var(--tx-2)]">
              {p.subdomainBullets.map((b, i) => (
                <p key={i}>• {b}</p>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-3">
          <SectionHeading>{p.faqHeading}</SectionHeading>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl divide-y divide-[var(--bd)]">
            {p.faqs.map((faq, i) => (
              <div key={i} className="px-5 py-4">
                <p className="text-sm font-semibold text-[var(--tx-1)] flex items-start gap-2">
                  <MessageCircleQuestion className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  {faq.q}
                </p>
                <p className="text-sm text-[var(--tx-2)] mt-1.5 ml-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-6 space-y-3">
          {isPartner ? (
            <>
              <p className="text-sm text-[var(--tx-2)]">{p.ctaQuestion}</p>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#25D366" }}
              >
                <WhatsAppIcon />
                {p.ctaWhatsApp}
              </a>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--tx-2)]">{p.ctaQuestion}</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/partner/register"
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-gold text-black text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  {p.ctaRegister} <ChevronRight className="w-4 h-4" />
                </Link>
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "#25D366" }}
                >
                  <WhatsAppIcon />
                  {p.ctaWhatsApp}
                </a>
              </div>
            </>
          )}
        </div>

      </main>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold text-[var(--tx-3)] uppercase tracking-widest">{children}</h2>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.862L.057 23.428a.75.75 0 0 0 .916.93l5.668-1.485A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.826 9.826 0 0 1-5.025-1.376l-.36-.214-3.733.978.998-3.647-.235-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
    </svg>
  )
}
