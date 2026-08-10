import Link from "next/link"
import { CheckCircle2, Clock } from "lucide-react"

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  BUSINESS_CARD:  "Business Card",
  EVENT_SPACE:    "Event Space",
  EVENT_PLANNER:  "Event Planner",
  VENDOR:         "Vendor",
  OTHERS:         "Others",
}

interface Props {
  searchParams: Promise<{ slug?: string; name?: string; type?: string }>
}

export default async function PartnerSuccessPage({ searchParams }: Props) {
  const { slug, name, type } = await searchParams

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "ekadku.com"
  const partnerUrl = slug ? `${slug}.${baseDomain}` : null
  const companyName = name ? decodeURIComponent(name) : "Syarikat Anda"
  const businessType = type ? BUSINESS_TYPE_LABELS[type] ?? type : "—"

  return (
    <div className="min-h-screen bg-[var(--pg)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--tx-1)] mb-2">Pendaftaran Berjaya!</h1>
        <p className="text-sm text-[var(--tx-2)] mb-8 leading-relaxed">
          Terima kasih kerana mendaftar sebagai Partner Ekadku.
        </p>

        <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl p-6 text-left space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-[var(--bd)]">
            <span className="text-xs font-semibold text-[var(--tx-3)] uppercase tracking-wide">Syarikat</span>
            <span className="text-sm font-medium text-[var(--tx-1)]">{companyName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[var(--bd)]">
            <span className="text-xs font-semibold text-[var(--tx-3)] uppercase tracking-wide">Jenis Perniagaan</span>
            <span className="text-sm font-medium text-[var(--tx-1)]">{businessType}</span>
          </div>
          {partnerUrl && (
            <div className="flex justify-between items-center py-2 border-b border-[var(--bd)]">
              <span className="text-xs font-semibold text-[var(--tx-3)] uppercase tracking-wide">URL Partner</span>
              <span className="text-sm font-mono text-[var(--tx-1)]">{partnerUrl}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2">
            <span className="text-xs font-semibold text-[var(--tx-3)] uppercase tracking-wide">Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              <Clock className="w-3 h-3" /> Menunggu Kelulusan
            </span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-8 text-left">
          <p className="text-sm text-amber-800 leading-relaxed">
            Permohonan anda sedang disemak oleh pihak Ekadku. Anda akan dihubungi melalui e-mel setelah akaun partner anda diluluskan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/partner/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
            style={{ background: "#FFCC00", color: "#141414" }}
          >
            Semak Status Partner
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border border-[var(--bd)] hover:border-gold/40 text-[var(--tx-1)] transition-all"
          >
            Kembali ke Laman Utama
          </Link>
        </div>

        {partnerUrl && (
          <p className="mt-6 text-xs text-[var(--tx-3)]">
            URL partner anda (aktif selepas kelulusan):{" "}
            <span className="font-mono text-[var(--tx-2)]">{partnerUrl}</span>
          </p>
        )}
      </div>
    </div>
  )
}
