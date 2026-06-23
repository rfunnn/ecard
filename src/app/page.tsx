import Link from "next/link"
import { ArrowRight, Music, Share2, Sparkles, Heart, Calendar, MapPin, Clock, Check } from "lucide-react"
import UserMenu from "@/components/UserMenu"

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
    headerBg: "#B8956A",
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
    headerBg: "#9CA3AF",
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
    headerBg: "#C9A84C",
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

const ADDONS = [
  {
    title: "Upload Own Design",
    price: "+RM10",
    buttons: ["HALF CUSTOM SAMPLE", "FULL CUSTOM SAMPLE"],
  },
  {
    title: "Upload Video Cover",
    price: "+RM10",
    buttons: ["COVER VIDEO SAMPLE", "MOTION INVITE SAMPLE"],
  },
]

const PERKS = [
  "Tiada langganan diperlukan",
  "Pautan unik untuk setiap kad",
  "Sokongan Bahasa Melayu & Inggeris",
  "Muzik latar dari YouTube",
  "Animasi skrol automatik",
  "Butang RSVP, Peta & WhatsApp",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--pg)] overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-10 py-4 bg-[var(--pg-nav)] backdrop-blur-md border-b border-[var(--bd)]">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-gold fill-gold/30" />
          <span className="font-playfair text-lg text-[var(--tx-1)] tracking-wide">kad.my</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/invite/demo" className="hidden sm:inline-flex text-[var(--tx-2)] hover:text-[var(--tx-1)] text-sm transition-colors px-3 py-2">
            Lihat Contoh
          </Link>
          <UserMenu />
          <Link
            href="/new"
            className="inline-flex items-center gap-2 bg-gold text-ink text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20 active:scale-95"
          >
            Buat Kad
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="min-h-screen flex items-center pt-20 lg:pt-0">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-16 lg:py-0">

          {/* Left — text */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-gold/60 text-xs tracking-[0.3em] uppercase mb-6 border border-gold/20 rounded-full px-4 py-2 bg-gold/5">
              <Sparkles className="w-3 h-3" />
              Kad Jemputan Digital
            </div>

            <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-[var(--tx-1)] leading-[1.08] mb-6">
              Jemput dengan<br />
              <span className="shimmer">Penuh Gaya</span>
            </h1>

            <p className="text-[var(--tx-2)] text-base lg:text-lg leading-relaxed max-w-md mb-10">
              Cipta kad jemputan digital yang memukau dalam minit. Tambah muzik YouTube, animasi skrol, dan kongsi pautan unik kepada tetamu.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
              <Link
                href="/new"
                className="inline-flex items-center gap-2 bg-gold text-ink font-semibold px-8 py-3.5 rounded-full hover:bg-gold-light transition-all hover:shadow-xl hover:shadow-gold/20 active:scale-95 text-base w-full sm:w-auto justify-center"
              >
                Buat Kad Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/invite/demo"
                className="inline-flex items-center gap-2 border border-[var(--bd)] text-[var(--tx-2)] hover:text-[var(--tx-1)] hover:border-[var(--bd)] px-8 py-3.5 rounded-full transition-colors text-base w-full sm:w-auto justify-center dark:border-white/15 dark:hover:border-white/30"
              >
                Lihat Contoh
              </Link>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              {PERKS.map((p) => (
                <div key={p} className="flex items-center gap-2 text-[var(--tx-3)] text-sm">
                  <Check className="w-3.5 h-3.5 text-gold/60 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="flex justify-center lg:justify-end relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full blur-[80px] opacity-20" style={{ background: "#D4AF37" }} />
            </div>

            <div className="relative w-64 sm:w-72 lg:w-80">
              {/* Phone frame */}
              <div className="relative rounded-[44px] border-2 border-black/10 dark:border-white/10 shadow-2xl overflow-hidden bg-[#1a0a00]"
                style={{ aspectRatio: "9/19.5" }}>
                <div className="absolute top-0 left-0 right-0 h-9 flex items-center justify-between px-5 z-10 bg-black/20">
                  <span className="text-[10px] text-white/50">9:41</span>
                  <div className="w-16 h-3.5 bg-black rounded-full" />
                  <span className="text-[10px] text-white/50">●●●</span>
                </div>
                <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-20">
                  <div className="w-24 h-6 bg-black rounded-b-2xl" />
                </div>
                <div className="absolute inset-0 pt-9 flex flex-col">
                  <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
                  <div className="flex-1 flex flex-col items-center justify-start px-4 py-4 overflow-hidden">
                    <div className="flex items-center gap-2 w-full mb-3">
                      <div className="h-px flex-1 opacity-20 bg-gold" />
                      <span className="text-gold/60 text-[8px]">✦</span>
                      <div className="h-px flex-1 opacity-20 bg-gold" />
                    </div>
                    <p className="text-[7px] tracking-[0.25em] uppercase text-cream/50 mb-1">Dengan Hormat Menjemput</p>
                    <p className="text-[7px] tracking-[0.2em] text-cream/30 mb-4">Ke Majlis Walimatul Urus</p>
                    <p className="font-great-vibes text-2xl text-gold mb-1">Ahmad Faris</p>
                    <p className="text-gold/50 text-xs mb-1">&amp;</p>
                    <p className="font-great-vibes text-2xl text-gold mb-4">Nur Aisyah</p>
                    <div className="flex items-center gap-2 w-full mb-4">
                      <div className="h-px flex-1 opacity-10 bg-gold" />
                      <div className="w-1 h-1 rounded-full bg-gold opacity-30" />
                      <div className="h-px flex-1 opacity-10 bg-gold" />
                    </div>
                    <div className="space-y-1.5 text-center mb-4">
                      <div className="flex items-center justify-center gap-1.5 text-cream/50 text-[8px]">
                        <Calendar className="w-2.5 h-2.5 text-gold/50" />
                        Sabtu, 14 Disember 2025
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-cream/50 text-[8px]">
                        <Clock className="w-2.5 h-2.5 text-gold/50" />
                        10:00 Pagi – 1:00 Tengah Hari
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-cream/50 text-[8px]">
                        <MapPin className="w-2.5 h-2.5 text-gold/50" />
                        Dewan Seri Murni, KL
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/80 border-t border-white/10 px-3 py-2 flex items-center justify-around">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-gold/70" />
                      </div>
                      <span className="text-[7px] text-cream/40">Lokasi</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/30">
                        <Heart className="w-4 h-4 text-ink fill-ink" />
                      </div>
                      <span className="text-[7px] text-gold font-semibold">RSVP</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center">
                        <Share2 className="w-3 h-3 text-gold/70" />
                      </div>
                      <span className="text-[7px] text-cream/40">Hubungi</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                  <div className="w-16 h-1 bg-white/15 rounded-full" />
                </div>
              </div>

              {/* Floating labels */}
              <div className="absolute -right-4 lg:-right-8 top-1/4 rounded-xl px-3 py-2 shadow-xl border" style={{ background: "var(--float)", borderColor: "var(--float-bd)" }}>
                <div className="flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 text-gold" />
                  <span className="text-xs text-[var(--tx-2)]">Muzik aktif</span>
                </div>
              </div>
              <div className="absolute -left-4 lg:-left-8 bottom-1/3 rounded-xl px-3 py-2 shadow-xl border border-gold/20" style={{ background: "var(--float)" }}>
                <p className="text-[10px] text-[var(--tx-3)] mb-0.5">Pautan dikongsi</p>
                <p className="text-xs text-gold font-mono">kad.my/ahmadfaris</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-10 border-t border-[var(--bd)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-3">Cara Kerja</p>
            <h2 className="font-playfair text-3xl lg:text-4xl text-[var(--tx-1)]">Siap dalam 3 langkah</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {STEPS.map(({ num, label, desc }) => (
              <div key={num} className="relative flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="font-playfair text-5xl lg:text-6xl text-gold/10 font-bold mb-4 select-none">{num}</div>
                <h3 className="font-playfair text-xl text-[var(--tx-1)] mb-2">{label}</h3>
                <p className="text-[var(--tx-2)] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-10 bg-[var(--pg-alt)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-3">Ciri-ciri</p>
            <h2 className="font-playfair text-3xl lg:text-4xl text-[var(--tx-1)]">Semua yang anda perlukan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="p-6 lg:p-8 rounded-2xl border border-[var(--bd)] bg-[var(--pg)] hover:border-gold/30 transition-all group shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                  <Icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-playfair text-lg text-[var(--tx-1)] mb-3">{title}</h3>
                <p className="text-[var(--tx-2)] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Template previews ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-10 bg-[var(--pg)]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-3">Templat</p>
              <h2 className="font-playfair text-3xl lg:text-4xl text-[var(--tx-1)]">Reka Bentuk Eksklusif</h2>
            </div>
            <Link href="/new" className="inline-flex items-center gap-2 text-gold/70 hover:text-gold text-sm transition-colors">
              Lihat semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Perkahwinan Klasik", bg: "#1a0a00", accent: "#D4AF37", emoji: "💍", font: "font-great-vibes", preview: "Ahmad & Siti" },
              { label: "Hari Jadi Ceria",    bg: "#0a0a1a", accent: "#8B5CF6", emoji: "🎂", font: "font-dancing",    preview: "Selamat Harijadi" },
              { label: "Korporat Pro",       bg: "#0a1a0a", accent: "#10B981", emoji: "🏢", font: "font-montserrat", preview: "Jemputan Rasmi" },
              { label: "Umum Elegan",        bg: "#0d0d0d", accent: "#C0A050", emoji: "✉️", font: "font-cormorant",  preview: "Majlis Istimewa" },
            ].map(({ label, bg, accent, emoji, font, preview }) => (
              <Link key={label} href="/new"
                className="group relative rounded-2xl overflow-hidden border border-[var(--bd)] hover:border-gold/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/10"
                style={{ aspectRatio: "3/4", background: bg }}>
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className={`${font} text-xl mb-1`} style={{ color: accent }}>{preview}</p>
                    <p className="text-xs text-cream/40">{label}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-10 border-t border-[var(--bd)] bg-[var(--pg)]">
        <div className="max-w-5xl mx-auto">

          <h2 className="font-playfair text-4xl lg:text-5xl text-[var(--tx-1)] text-center mb-14">Packages</h2>

          {/* Tier cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {PACKAGES.map(({ name, emoji, headerBg, price, features }) => (
              <div key={name} className="rounded-2xl overflow-hidden border border-[var(--bd)] bg-[var(--pg-alt)] flex flex-col">
                <div className="py-4 text-center" style={{ background: headerBg }}>
                  <span className="text-white font-bold text-xl">{name} {emoji}</span>
                </div>
                <div className="flex-1 pt-8 pb-4 px-6 flex flex-col items-center">
                  <div className="space-y-2.5 text-center text-sm w-full">
                    {features.map(({ label, bold }) => (
                      <p key={label} className={bold ? "font-bold text-[var(--tx-1)]" : "text-[var(--tx-2)]"}>
                        {label}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="pb-8 px-6 pt-6 flex flex-col items-center gap-4 border-t border-[var(--bd)] mt-6">
                  <p className="text-4xl font-light text-[var(--tx-1)]">{price}</p>
                  <Link
                    href="/invite/demo"
                    className="border border-[var(--tx-1)] text-[var(--tx-1)] text-[11px] font-semibold tracking-[0.15em] px-8 py-2.5 rounded-lg hover:bg-[var(--tx-1)] hover:text-[var(--pg)] transition-colors"
                  >
                    VIEW SAMPLE
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Footnote */}
          <p className="text-center text-sm text-[var(--tx-2)] mb-16">
            All features are optional{" "}
            <span className="text-blue-500 dark:text-blue-400">(toggle on/off)</span>.
          </p>

          {/* Add-ons */}
          <h3 className="text-center font-bold text-xs tracking-[0.35em] uppercase text-[var(--tx-1)] mb-8">ADD-ONS</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {ADDONS.map(({ title, price, buttons }) => (
              <div key={title} className="rounded-2xl border border-[var(--bd)] bg-[var(--pg-alt)] p-6 flex flex-col items-center gap-5">
                <div className="text-center">
                  <p className="font-semibold text-[var(--tx-1)] mb-1">{title}</p>
                  <p className="font-bold text-[var(--tx-1)]">{price}</p>
                </div>
                <div className="w-full space-y-2">
                  {buttons.map((label) => (
                    <Link
                      key={label}
                      href="/invite/demo"
                      className="block w-full text-center border border-[var(--tx-1)] text-[var(--tx-1)] text-[10px] font-semibold tracking-[0.12em] py-2.5 rounded-lg hover:bg-[var(--tx-1)] hover:text-[var(--pg)] transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-10 bg-[var(--pg-alt)]">
        <div className="max-w-2xl mx-auto text-center rounded-3xl p-10 lg:p-16 border border-gold/15 relative overflow-hidden bg-[var(--pg)]"
          style={{ boxShadow: "0 0 60px rgba(212,175,55,0.06)" }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
          <h2 className="font-playfair text-3xl lg:text-4xl text-[var(--tx-1)] mb-4">Sedia untuk memulakan?</h2>
          <p className="text-[var(--tx-2)] text-sm lg:text-base mb-8">Buat kad jemputan pertama anda secara percuma hari ini.</p>
          <Link href="/new"
            className="inline-flex items-center gap-2 bg-gold text-ink font-semibold px-8 py-3.5 rounded-full hover:bg-gold-light transition-all hover:shadow-xl hover:shadow-gold/20 text-base">
            Mulakan Sekarang <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--bd)] px-6 lg:px-10 py-8 bg-[var(--pg)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-gold/40 fill-gold/20" />
            <span className="font-playfair text-[var(--tx-3)]">kad.my</span>
          </div>
          <p className="text-[var(--tx-3)] text-xs">Dibuat dengan penuh kasih sayang · 2025</p>
        </div>
      </footer>
    </div>
  )
}
