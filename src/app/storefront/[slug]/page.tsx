import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { AtSign, Globe, MapPin, ArrowRight, Sparkles, Link2 } from "lucide-react"

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  BUSINESS_CARD:  "Business Card",
  EVENT_SPACE:    "Event Space",
  EVENT_PLANNER:  "Event Planner",
  VENDOR:         "Vendor",
  OTHERS:         "Others",
}

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
          <Link href="/" className="text-xs text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors">
            ekadku.com
          </Link>
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
          <p className="text-base text-[var(--tx-2)] mb-10 leading-relaxed">
            Kad Jemputan Digital — buat, kongsi dan pantau jemputan anda dengan mudah.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-[15px] transition-all active:scale-95"
              style={{ background: "#FFCC00", color: "#141414" }}
            >
              <Sparkles className="w-4 h-4" />
              Buat Jemputan Anda
            </Link>
            <Link
              href="/#packages"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold border border-[var(--bd)] hover:border-gold/40 text-[var(--tx-1)] transition-all"
            >
              Lihat Pakej <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Info */}
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
              <a href={`https://instagram.com/${partner.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer"
                className="text-blue-500 hover:underline">
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
