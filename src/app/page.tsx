import Link from "next/link"
import { ArrowRight, Music, Share2, Sparkles, Heart, Check, Eye, Calendar } from "lucide-react"
import UserMenu from "@/components/UserMenu"
import { HomepagePhoneMockup } from "@/components/HomepagePhoneMockup"

const GCAL_URL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Walimatul+Urus+%E2%80%93+Ahmad+Faris+%26+Nur+Aisyah&dates=20251214T020000Z%2F20251214T070000Z&details=Majlis+Walimatul+Urus+ekadku.com&location=Dewan+Seri+Murni%2C+Jalan+Ampang%2C+50450+Kuala+Lumpur`

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

      {/* ── Calendar Highlight ── */}
      <section className="py-10 lg:py-28 px-5 lg:px-10 border-t border-[var(--bd)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-7 lg:mb-10">
            <p className="text-gold/60 text-[10px] tracking-[0.3em] uppercase mb-2">Ciri Istimewa</p>
            <h2 className="font-playfair text-2xl lg:text-4xl text-[var(--tx-1)]">Simpan ke Kalendar Terus</h2>
            <p className="text-[var(--tx-2)] text-sm mt-3 max-w-sm mx-auto leading-relaxed">
              Tetamu boleh simpan tarikh majlis terus ke Google Calendar atau Apple Calendar hanya dengan satu klik.
            </p>
          </div>

          <div
            className="rounded-2xl border border-gold/20 bg-[var(--pg)] p-6 lg:p-8 max-w-md mx-auto text-center"
            style={{ boxShadow: "0 0 40px rgba(212,175,55,0.06)" }}
          >
            {/* Calendar visual */}
            <div className="flex items-center justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-gold" />
              </div>
            </div>

            <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--tx-3)] mb-1">Walimatul Urus</p>
            <h3 className="font-playfair text-xl text-[var(--tx-1)] mb-1">Ahmad Faris &amp; Nur Aisyah</h3>
            <p className="text-sm text-[var(--tx-2)] mb-0.5">Sabtu, 14 Disember 2025</p>
            <p className="text-xs text-[var(--tx-3)] mb-6">10:00 Pagi – 3:00 Petang · Dewan Seri Murni, KL</p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Google Calendar */}
              <a
                href={GCAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 text-[13px] font-medium px-4 py-2.5 rounded-xl hover:shadow-md hover:border-gray-300 transition-all active:scale-95 dark:bg-white/10 dark:border-white/10 dark:text-[var(--tx-1)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google Calendar
              </a>

              {/* Apple Calendar */}
              <a
                href="/demo-event.ics"
                download
                className="flex-1 flex items-center justify-center gap-2 bg-[var(--pg-alt)] border border-[var(--bd)] text-[var(--tx-1)] text-[13px] font-medium px-4 py-2.5 rounded-xl hover:shadow-md hover:border-gold/30 transition-all active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--tx-2)]" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple Calendar
              </a>
            </div>
          </div>

          <p className="text-center text-[11px] text-[var(--tx-3)] mt-4">
            * Contoh demonstrasi — tetamu kad anda akan melihat butang ini dalam jemputan mereka
          </p>
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
