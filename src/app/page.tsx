import Link from "next/link"
import { ArrowRight, Music, Share2, Sparkles, Heart, Check, Eye, Clock } from "lucide-react"
import UserMenu from "@/components/UserMenu"
import { HomepagePhoneMockup } from "@/components/HomepagePhoneMockup"
import { AnimatedWord } from "@/components/AnimatedWord"


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
  {
    icon: Clock,
    title: "Pautan Aktif 6 Bulan",
    desc: "Kemaskini maklumat kad & pantau laporan RSVP bila-bila masa.",
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

const FAQS = [
  {
    q: "Berapa harga kad jemputan digital ekadku.com?",
    a: "ekadku.com menawarkan tiga pakej: Bronze (RM30), Silver (RM40), dan Gold (RM60). Semua pakej adalah bayaran sekali sahaja — tiada langganan bulanan.",
  },
  {
    q: "Berapa lama pautan kad jemputan saya aktif?",
    a: "Pautan kad jemputan digital anda aktif selama 6 bulan dari tarikh pembelian. Selepas tempoh tersebut, anda boleh memperbaharui pautan.",
  },
  {
    q: "Bolehkah saya tambah muzik latar dalam kad jemputan?",
    a: "Ya! Anda boleh tambah muzik latar dari YouTube terus ke dalam kad jemputan digital anda. Muzik akan dimainkan secara automatik apabila tetamu membuka kad.",
  },
  {
    q: "Adakah tetamu boleh hantar RSVP melalui kad digital?",
    a: "Ya. Pakej Silver dan Gold menyokong RSVP dan ucapan. Tetamu boleh sahkan kehadiran, bilangan tetamu, dan tinggalkan ucapan terus dari pautan kad anda.",
  },
  {
    q: "Bolehkah saya edit kad selepas bayar?",
    a: "Ya, anda boleh edit kad bila-bila masa dalam tempoh aktif pautan — ubah teks, gambar, muzik, dan tetapan lain tanpa kos tambahan.",
  },
  {
    q: "Apakah kaedah pembayaran yang diterima?",
    a: "Kami menerima pembayaran melalui FPX (perbankan dalam talian)",
  },
]

const PERKS = [
  "RSVP & Hadiah",
  "Google/Apple Calendar",
  "Muzik YouTube",
  "Animasi skrol",
  "Peta (Maps/Waze)",
  "Laporan RSVP"
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
          <UserMenu />
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[100svh] flex items-center pt-14 pb-10 overflow-x-hidden">
        {/* ambient glow */}
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full blur-[140px] opacity-[0.07] pointer-events-none" style={{ background: "#D4AF37" }} />
        <div className="w-full max-w-3xl mx-auto px-5 lg:px-10 flex flex-col items-center text-center gap-8 py-8">

          {/* Text block */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 text-gold text-[10px] tracking-[0.3em] uppercase mb-3 border border-gold/50 rounded-full px-3.5 py-1.5 bg-gold/10">
              <Sparkles className="w-2.5 h-2.5" />
              Kad Jemputan Digital
            </div>
            <AnimatedWord />

            <p className="text-[var(--tx-2)] text-[13px] lg:text-lg leading-relaxed max-w-sm lg:max-w-md mb-5 lg:mb-10">
              Cipta kad jemputan digital dengan mudah. Tambah muzik, animasi, RSVP dan kongsi pautan unik kepada tetamu.
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
              <div key={num} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full border border-gold/25 bg-gold/5 flex items-center justify-center shrink-0">
                  <span className="font-playfair text-lg text-gold/70 font-bold leading-none">{num}</span>
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
            <p className="text-gold/60 text-[10px] tracking-[0.3em] uppercase mb-2">Ciri-ciri</p>
            <h2 className="font-playfair text-2xl lg:text-4xl text-[var(--tx-1)]">Semua yang anda perlukan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="relative flex flex-col items-center text-center gap-3 p-3.5 lg:p-7 rounded-xl lg:rounded-2xl border border-[var(--bd)] bg-[var(--pg)] hover:border-gold/30 transition-all group overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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

      {/* ── FAQ ── */}
      <section className="py-10 lg:py-28 px-5 lg:px-10 border-t border-[var(--bd)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQS.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            }),
          }}
        />
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-7 lg:mb-14">
            <p className="text-gold/60 text-[10px] tracking-[0.3em] uppercase mb-2">Soalan Lazim</p>
            <h2 className="font-playfair text-2xl lg:text-4xl text-[var(--tx-1)]">Ada soalan?</h2>
          </div>
          <div className="flex flex-col gap-2">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group border border-[var(--bd)] rounded-xl bg-[var(--pg-alt)] open:border-gold/25 transition-all">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none select-none">
                  <span className="font-medium text-[13px] lg:text-[15px] text-[var(--tx-1)]">{q}</span>
                  <span className="text-gold/50 text-lg shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="px-5 pb-4 text-[13px] lg:text-[14px] text-[var(--tx-2)] leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-10 lg:py-28 px-5 lg:px-10 bg-[var(--pg-alt)]">
        <div
          className="max-w-2xl mx-auto text-center rounded-3xl p-6 lg:p-16 border border-gold/15 relative overflow-hidden bg-[var(--pg)]"
          style={{ boxShadow: "0 0 80px rgba(212,175,55,0.07)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
          <Sparkles className="absolute top-5 left-5 w-3 h-3 text-gold/15" />
          <Sparkles className="absolute top-5 right-5 w-3 h-3 text-gold/15" />
          <Sparkles className="absolute bottom-5 left-5 w-2.5 h-2.5 text-gold/10" />
          <Sparkles className="absolute bottom-5 right-5 w-2.5 h-2.5 text-gold/10" />
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
        <div className="max-w-5xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--tx-3)]">
          <p>© {new Date().getFullYear()} ekadku.com</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gold transition-colors">Dasar Privasi</Link>
            <Link href="/terms" className="hover:text-gold transition-colors">Terma Perkhidmatan</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
