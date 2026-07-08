import Link from "next/link"
import { ArrowRight, Music, Share2, Sparkles, Heart, Check, Eye } from "lucide-react"
import UserMenu from "@/components/UserMenu"
import { HomepagePhoneMockup } from "@/components/HomepagePhoneMockup"

const FEATURES = [
  {
    icon: Sparkles,
    title: "Templat Premium",
    desc: "Pelbagai reka bentuk eksklusif untuk majlis perkahwinan, hari jadi, dan korporat.",
  },
  {
    icon: Music,
    title: "Muzik Latar",
    desc: "Sematkan muzik dari YouTube terus dalam kad jemputan anda.",
  },
  {
    icon: Share2,
    title: "Kongsi Mudah",
    desc: "Jana pautan unik dan kod QR. Hantar kepada sesiapa sahaja dalam saat.",
  },
]

const STEPS = [
  { num: "01", label: "Pilih Templat", desc: "Pelbagai reka bentuk untuk majlis anda" },
  { num: "02", label: "Sesuaikan", desc: "Ubah warna, fon, muzik dan animasi" },
  { num: "03", label: "Kongsi", desc: "Jana pautan & QR code untuk dikongsi" },
]

const PACKAGES = [
  {
    name: "Bronze", emoji: "🥉",
    headerBg: "linear-gradient(135deg, #c8945a, #a06b3a)",
    price: "RM30",
    features: [
      { label: "Calendar",   bold: false },
      { label: "Contacts",   bold: false },
      { label: "Countdown",  bold: false },
      { label: "Navigation", bold: false },
      { label: "Song",       bold: false },
    ],
  },
  {
    name: "Silver", emoji: "🥈",
    headerBg: "linear-gradient(135deg, #9CA3AF, #6B7280)",
    price: "RM40",
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
    name: "Gold", emoji: "🥇",
    headerBg: "linear-gradient(135deg, #D4AF37, #a07820)",
    price: "RM60",
    features: [
      { label: "Calendar",         bold: false },
      { label: "Contacts",         bold: false },
      { label: "Countdown",        bold: false },
      { label: "Navigation",       bold: false },
      { label: "Song",             bold: false },
      { label: "Effects",          bold: false },
      { label: "Attendance",       bold: false },
      { label: "RSVP/Wish",        bold: false },
      { label: "+ Photo Gallery",  bold: true  },
      { label: "+ Money Gift",     bold: true  },
      { label: "+ Wishlist",       bold: true  },
      { label: "+ Custom Link",    bold: true  },
    ],
  },
]

const PERKS = [
  "Tiada langganan",
  "Pautan unik",
  "BM & Inggeris",
  "Muzik YouTube",
  "Animasi skrol",
  "RSVP & Peta",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--pg)] overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 lg:px-10 py-3.5 bg-[var(--pg-nav)] backdrop-blur-md border-b border-[var(--bd)]">
        <div className="flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-gold fill-gold/30" />
          <span className="font-playfair text-[17px] tracking-wide leading-none">
            <span className="text-[var(--tx-1)]">e</span>
            <span style={{ color: "#D4AF37" }}>kad</span>
            <span className="text-[var(--tx-1)]">ku</span>
            <span className="text-gold/50 text-[10px] font-sans tracking-normal align-baseline">.com</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/invite/demo"
            className="hidden sm:inline-flex items-center gap-1.5 text-[var(--tx-2)] hover:text-[var(--tx-1)] text-[13px] transition-all px-3 py-1.5 rounded-full border border-[var(--bd)] hover:border-gold/30 hover:bg-[var(--sf)]"
          >
            <Eye className="w-3.5 h-3.5" />
            Lihat Contoh
          </Link>
          <UserMenu />
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 bg-gold text-ink text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20 active:scale-95"
          >
            Buat Kad
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="min-h-[100svh] flex items-center pt-14 pb-10 lg:pt-0 lg:pb-0">
        <div className="w-full max-w-3xl mx-auto px-5 lg:px-10 flex flex-col items-center text-center gap-8 py-8 lg:py-0">

          {/* Text block */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 text-gold/60 text-[10px] tracking-[0.3em] uppercase mb-5 border border-gold/20 rounded-full px-3.5 py-1.5 bg-gold/5">
              <Sparkles className="w-2.5 h-2.5" />
              Kad Jemputan Digital
            </div>

            <h1 className="font-playfair text-[2rem] leading-[1.1] sm:text-5xl lg:text-7xl xl:text-8xl text-[var(--tx-1)] mb-3 lg:mb-6">
              Jemput dengan<br />
              <span className="shimmer">Penuh Gaya</span>
            </h1>

            <p className="text-[var(--tx-2)] text-[13px] lg:text-lg leading-relaxed max-w-sm lg:max-w-md mb-5 lg:mb-10">
              Cipta kad jemputan digital dengan mudah. Tambah muzik, animasi skrol, dan kongsi pautan unik kepada tetamu.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mb-5 lg:mb-10">
              <Link
                href="/templates"
                className="inline-flex items-center justify-center gap-2 bg-gold text-ink font-semibold px-5 py-2.5 rounded-full hover:bg-gold-light transition-all hover:shadow-xl hover:shadow-gold/20 active:scale-95 text-[13px] sm:text-[15px]"
              >
                Buat Kad Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/invite/demo"
                className="inline-flex items-center justify-center gap-2 border border-gold/30 hover:border-gold/60 text-[var(--tx-1)] hover:bg-gold/5 px-5 py-2.5 rounded-full transition-all text-[13px] sm:text-[15px] active:scale-95"
              >
                <Eye className="w-4 h-4 text-gold/70" />
                Lihat Contoh
              </Link>
            </div>

            {/* Perks — 3-col compact */}
            <div className="grid grid-cols-3 gap-x-3 gap-y-2 w-full max-w-xs mx-auto">
              {PERKS.map((p) => (
                <div key={p} className="flex items-center gap-1.5 text-[var(--tx-3)] text-[12px] sm:text-[13px]">
                  <Check className="w-2.5 h-2.5 text-gold/50 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center relative">
            {/* Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 sm:w-72 sm:h-72 rounded-full blur-[80px] opacity-20 dark:opacity-15"
                style={{ background: "#D4AF37" }} />
            </div>
            <HomepagePhoneMockup />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-10 lg:py-28 px-5 lg:px-10 border-t border-[var(--bd)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-7 lg:mb-14">
            <p className="text-gold/60 text-[10px] tracking-[0.3em] uppercase mb-2">Cara Kerja</p>
            <h2 className="font-playfair text-2xl lg:text-4xl text-[var(--tx-1)]">Siap dalam 3 langkah</h2>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-3 gap-5 lg:gap-10">
            {STEPS.map(({ num, label, desc }) => (
              <div key={num} className="flex flex-col items-center text-center gap-3">
                <div className="font-playfair text-[52px] leading-none text-gold/12 font-bold">{num}</div>
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
            <p className="text-gold/60 text-[10px] tracking-[0.3em] uppercase mb-2">Ciri-ciri</p>
            <h2 className="font-playfair text-2xl lg:text-4xl text-[var(--tx-1)]">Semua yang anda perlukan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center gap-3 p-3.5 lg:p-7 rounded-xl lg:rounded-2xl border border-[var(--bd)] bg-[var(--pg)] hover:border-gold/30 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors mb-1">
                  <Icon className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-playfair text-[13px] lg:text-base text-[var(--tx-1)] mb-0.5 lg:mb-1.5">{title}</h3>
                  <p className="text-[var(--tx-2)] text-[11px] lg:text-[13px] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section className="py-16 lg:py-28 border-t border-[var(--bd)] bg-[var(--pg)]">
        <div className="max-w-5xl mx-auto">
          <div className="px-5 lg:px-10">
            <h2 className="font-playfair text-3xl lg:text-5xl text-[var(--tx-1)] text-center mb-7 lg:mb-14">Pakej</h2>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="-mx-0 lg:mx-0 px-5 lg:px-10">
            <div className="flex justify-center lg:grid lg:grid-cols-3 gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x snap-mandatory lg:snap-none scrollbar-hide mb-6 lg:mb-8">
              {PACKAGES.map(({ name, emoji, headerBg, price, features }) => (
                <div
                  key={name}
                  className="rounded-2xl overflow-hidden border border-[var(--bd)] bg-[var(--pg-alt)] flex flex-col shrink-0 snap-center"
                  style={{ width: "clamp(100px, 28vw, 180px)" }}
                >
                  <div className="py-2.5 text-center" style={{ background: headerBg }}>
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
                      className="w-full flex items-center justify-center gap-1.5 text-white text-[10px] font-bold tracking-[0.1em] px-4 py-2 rounded-lg transition-all hover:opacity-90 hover:shadow-md active:scale-95"
                      style={{ background: headerBg }}
                    >
                      <Eye className="w-3 h-3 opacity-90" />
                      LIHAT CONTOH
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 lg:px-10">
            <p className="text-center text-[13px] text-[var(--tx-2)] mb-12 lg:mb-16">
              Semua ciri adalah pilihan —{" "}
              <span className="text-blue-500 dark:text-blue-400">boleh dihidupkan atau dimatikan</span>.
            </p>

            {/* Add-ons — hidden until ready */}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-10 lg:py-28 px-5 lg:px-10 bg-[var(--pg-alt)]">
        <div
          className="max-w-2xl mx-auto text-center rounded-3xl p-6 lg:p-16 border border-gold/15 relative overflow-hidden bg-[var(--pg)]"
          style={{ boxShadow: "0 0 60px rgba(212,175,55,0.05)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
          <h2 className="font-playfair text-2xl lg:text-4xl text-[var(--tx-1)] mb-2 lg:mb-4">Sedia untuk memulakan?</h2>
          <p className="text-[var(--tx-2)] text-[14px] lg:text-base mb-7 lg:mb-8 leading-relaxed">
            Buat kad jemputan pertama anda secara percuma hari ini.
          </p>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 bg-gold text-ink font-semibold px-8 py-3.5 rounded-full hover:bg-gold-light transition-all hover:shadow-xl hover:shadow-gold/20 active:scale-95 text-[15px]"
          >
            Mulakan Sekarang <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--bd)] bg-[var(--pg-alt)]">
        <div className="max-w-5xl mx-auto px-5 py-4 text-center">
          <p className="text-[var(--tx-3)] text-[11px]">
            © {new Date().getFullYear()} ekadku.com
          </p>
        </div>
      </footer>
    </div>
  )
}
