import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { AtSign, Globe, MapPin, ArrowRight, Sparkles, Link2, Gift, Star, Zap } from "lucide-react"

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  BUSINESS_CARD:  "Business Card",
  EVENT_SPACE:    "Event Space",
  EVENT_PLANNER:  "Event Planner",
  VENDOR:         "Vendor",
  OTHERS:         "Others",
}

const PACKAGES = [
  {
    name: "Basic",
    price: "RM30",
    icon: Star,
    features: ["Kad digital interaktif", "RSVP online", "Peta lokasi", "Sah 6 bulan"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "RM40",
    icon: Zap,
    features: ["Semua ciri Basic", "Galeri foto", "Senarai hadiah", "Muzik latar"],
    highlight: false,
  },
  {
    name: "Premium",
    price: "Percuma*",
    icon: Gift,
    features: ["Semua ciri Pro", "Video penutup", "Rekabentuk eksklusif", "Analitik pelawat"],
    highlight: true,
  },
]

interface Props {
  params: Promise<{ slug: string }>
}

export default async function StorefrontPage({ params }: Props) {
  const { slug } = await params

  const partner = await prisma.partner.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      companyName: true,
      contactPerson: true,
      businessType: true,
      logo: true,
      address: true,
      website: true,
      instagram: true,
      facebook: true,
      status: true,
    },
  })

  if (!partner) notFound()

  if (partner.status === "PENDING") {
    return (
      <div className="min-h-screen bg-[var(--pg)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--tx-1)] mb-2">Menunggu Kelulusan</h1>
          <p className="text-sm text-[var(--tx-2)] leading-relaxed">
            Akaun partner ini sedang disemak. Sila semak semula sebentar lagi.
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 mt-6 text-sm text-gold hover:underline" prefetch={false}>
            Pergi ke ekadku.com
          </Link>
        </div>
      </div>
    )
  }

  if (partner.status === "SUSPENDED" || partner.status === "REJECTED") {
    notFound()
  }

  const businessTypeLabel = BUSINESS_TYPE_LABELS[partner.businessType] ?? partner.businessType

  return (
    <div className="min-h-screen bg-[var(--pg)]">
      {/* Header */}
      <header className="bg-[var(--pg-alt)] border-b border-[var(--bd)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            {partner.logo && (
              <img src={partner.logo} alt={partner.companyName} className="w-7 h-7 rounded-lg object-cover border border-[var(--bd)]" />
            )}
            <span className="font-bold text-sm text-[var(--tx-1)]">{partner.companyName}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#packages" className="text-xs text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors hidden sm:block">
              Pakej
            </a>
            <Link href="/login" className="text-xs text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors hidden sm:block">
              Log Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          {partner.logo ? (
            <img
              src={partner.logo}
              alt={partner.companyName}
              className="w-24 h-24 rounded-2xl object-cover border border-[var(--bd)] mx-auto mb-6 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold text-gold">{partner.companyName[0]?.toUpperCase()}</span>
            </div>
          )}

          <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-[var(--tx-3)] mb-2">
            {businessTypeLabel}
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--tx-1)] mb-3">{partner.companyName}</h1>
          <p className="text-base text-[var(--tx-2)] mb-4 leading-relaxed">
            Kad Jemputan Digital — buat, kongsi dan pantau jemputan anda dengan mudah.
          </p>

          {/* Free card callout */}
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-2 mb-8">
            <Gift className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs font-semibold text-gold">1 kad Premium PERCUMA untuk pelanggan baru</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-[15px] transition-all active:scale-95"
              style={{ background: "#FFCC00", color: "#141414" }}
            >
              <Sparkles className="w-4 h-4" />
              Buat Jemputan Anda
            </Link>
            <a
              href="#packages"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold border border-[var(--bd)] hover:border-gold/40 text-[var(--tx-1)] transition-all"
            >
              Lihat Pakej <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-12 px-4 border-t border-[var(--bd)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-[var(--tx-3)] text-center mb-2">Pakej</p>
          <h2 className="text-2xl font-bold text-[var(--tx-1)] text-center mb-8">Pilih Pakej Anda</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PACKAGES.map((pkg) => {
              const Icon = pkg.icon
              return (
                <div
                  key={pkg.name}
                  className={`rounded-2xl p-6 border ${
                    pkg.highlight
                      ? "border-gold bg-gold/5 relative overflow-hidden"
                      : "border-[var(--bd)] bg-[var(--pg-alt)]"
                  }`}
                >
                  {pkg.highlight && (
                    <div className="absolute top-3 right-3 bg-gold text-[#141414] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      PERCUMA
                    </div>
                  )}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${pkg.highlight ? "bg-gold/20" : "bg-[var(--sf)]"}`}>
                    <Icon className={`w-4.5 h-4.5 ${pkg.highlight ? "text-gold" : "text-[var(--tx-2)]"}`} />
                  </div>
                  <p className="font-bold text-[var(--tx-1)] mb-1">{pkg.name}</p>
                  <p className={`text-xl font-black mb-4 ${pkg.highlight ? "text-gold" : "text-[var(--tx-1)]"}`}>{pkg.price}</p>
                  <ul className="space-y-2">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-[var(--tx-2)]">
                        <span className={`mt-0.5 shrink-0 ${pkg.highlight ? "text-gold" : "text-[var(--tx-3)]"}`}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <p className="text-[11px] text-[var(--tx-3)] text-center mt-4">
            * 1 kad Premium percuma untuk setiap pelanggan baru melalui {partner.companyName}
          </p>

          <div className="mt-8 text-center">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-[15px] transition-all active:scale-95"
              style={{ background: "#FFCC00", color: "#141414" }}
            >
              <Sparkles className="w-4 h-4" />
              Mula Buat Kad
            </Link>
          </div>
        </div>
      </section>

      {/* Info */}
      {(partner.address || partner.website || partner.instagram || partner.facebook) && (
        <section className="py-8 px-4 border-t border-[var(--bd)]">
          <div className="max-w-xl mx-auto space-y-3">
            {partner.address && (
              <div className="flex items-start gap-3 text-sm text-[var(--tx-2)]">
                <MapPin className="w-4 h-4 mt-0.5 text-[var(--tx-3)] shrink-0" />
                <span>{partner.address}</span>
              </div>
            )}
            {partner.website && (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-[var(--tx-3)] shrink-0" />
                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                  {partner.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {partner.instagram && (
              <div className="flex items-center gap-3 text-sm">
                <AtSign className="w-4 h-4 text-[var(--tx-3)] shrink-0" />
                <a href={`https://instagram.com/${partner.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {partner.instagram.startsWith("@") ? partner.instagram : `@${partner.instagram}`}
                </a>
              </div>
            )}
            {partner.facebook && (
              <div className="flex items-center gap-3 text-sm">
                <Link2 className="w-4 h-4 text-[var(--tx-3)] shrink-0" />
                <a href={partner.facebook.startsWith("http") ? partner.facebook : `https://${partner.facebook}`}
                  target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                  {partner.facebook.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--bd)] py-4 px-4 text-center">
        <p className="text-[11px] text-[var(--tx-3)]">
          Dikuasakan oleh{" "}
          <Link href="/" className="text-gold hover:underline">ekadku.com</Link>
          {" "}— Kad Jemputan Digital
        </p>
      </footer>
    </div>
  )
}
