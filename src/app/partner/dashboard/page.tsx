import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import Image from "next/image"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { PartnerDashboardClient } from "./PartnerDashboardClient"
import UserMenu from "@/components/UserMenu"

export const dynamic = "force-dynamic"

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  BUSINESS_CARD:  "Business Card",
  EVENT_SPACE:    "Event Space",
  EVENT_PLANNER:  "Event Planner",
  VENDOR:         "Vendor",
  OTHERS:         "Others",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING:   "Menunggu Kelulusan",
  ACTIVE:    "Aktif",
  SUSPENDED: "Digantung",
  REJECTED:  "Ditolak",
}

export default async function PartnerDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/partner/dashboard")
  }

  const partner = await prisma.partner.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: {
      id: true,
      slug: true,
      companyName: true,
      contactPerson: true,
      businessType: true,
      logo: true,
      status: true,
      partnerRate: true,
      createdAt: true,
    },
  })

  if (!partner) {
    redirect("/partner/register")
  }

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "ekadku.com"
  const partnerUrl = `${partner.slug}.${baseDomain}`

  let stats = {
    totalCards: 0,
    totalCustomers: 0,
    totalUsageAmount: 0,
    unbilledAmount: 0,
    unbilledCount: 0,
    invoiceCount: 0,
  }

  if (partner.status === "ACTIVE") {
    const [totalCards, uniqueCustomers, usages, invoiceCount] = await Promise.all([
      prisma.invitationCard.count({ where: { partnerId: partner.id } }),
      prisma.invitationCard.findMany({
        where: { partnerId: partner.id },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.partnerUsage.findMany({
        where: { partnerId: partner.id },
        select: { amount: true, status: true },
      }),
      prisma.partnerInvoice.count({ where: { partnerId: partner.id } }),
    ])

    stats = {
      totalCards,
      totalCustomers: uniqueCustomers.length,
      totalUsageAmount: usages.reduce((s, u) => s + u.amount, 0),
      unbilledAmount:   usages.filter((u) => u.status === "UNBILLED").reduce((s, u) => s + u.amount, 0),
      unbilledCount:    usages.filter((u) => u.status === "UNBILLED").length,
      invoiceCount,
    }
  }

  const toRM = (sen: number) => `RM${(sen / 100).toFixed(2)}`

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
            {partner.status === "ACTIVE" && (
              <Link href="/partner/billing" className="text-xs text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors hidden sm:block">
                Bil & Invois
              </Link>
            )}
            <Link href="/partner/panduan" className="text-xs text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors hidden sm:block">
              Panduan
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Partner info card */}
        <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            {partner.logo ? (
              <img src={partner.logo} alt={partner.companyName} className="w-16 h-16 rounded-xl object-cover border border-[var(--bd)] shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-gold">{partner.companyName[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-[var(--tx-1)]">{partner.companyName}</h1>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  partner.status === "ACTIVE"    ? "bg-green-100 text-green-700" :
                  partner.status === "PENDING"   ? "bg-amber-100 text-amber-700" :
                  partner.status === "REJECTED"  ? "bg-red-100 text-red-700" :
                                                   "bg-gray-100 text-gray-500"
                }`}>
                  {STATUS_LABELS[partner.status] ?? partner.status}
                </span>
              </div>
              <p className="text-sm text-[var(--tx-2)] mt-0.5">{BUSINESS_TYPE_LABELS[partner.businessType] ?? partner.businessType}</p>
              <p className="text-sm font-mono text-[var(--tx-3)] mt-1">{partnerUrl}</p>
            </div>
          </div>
        </div>

        {partner.status === "PENDING" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
            <p className="text-sm text-amber-800 font-medium mb-1">Akaun anda sedang disemak</p>
            <p className="text-sm text-amber-700 leading-relaxed">
              Permohonan anda sedang disemak oleh pihak Ekadku. Anda akan dihubungi melalui e-mel apabila akaun diluluskan.
            </p>
          </div>
        )}

        {partner.status === "SUSPENDED" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-sm text-red-800 font-medium">Akaun partner anda telah digantung.</p>
            <p className="text-sm text-red-700 mt-1">Sila hubungi support@ekadku.com untuk maklumat lanjut.</p>
          </div>
        )}

        {partner.status === "REJECTED" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-sm text-red-800 font-medium">Permohonan anda telah ditolak.</p>
            <p className="text-sm text-red-700 mt-1">Sila hubungi support@ekadku.com untuk maklumat lanjut atau mendaftar semula.</p>
          </div>
        )}

        {partner.status === "ACTIVE" && (
          <>
            {/* Billing notice if unbilled usages exist */}
            {stats.unbilledCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {stats.unbilledCount} kad belum dibilkan ({toRM(stats.unbilledAmount)})
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">Invois bulanan akan dijana oleh pihak Ekadku.</p>
                </div>
                <Link
                  href="/partner/billing"
                  className="shrink-0 text-xs font-semibold text-amber-800 underline underline-offset-2"
                >
                  Lihat Bil
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Jumlah Kad",        value: stats.totalCards.toString() },
                { label: "Jumlah Pelanggan",  value: stats.totalCustomers.toString() },
                { label: "Jumlah Invois",     value: stats.invoiceCount.toString() },
                { label: "Jumlah Penggunaan", value: toRM(stats.totalUsageAmount) },
                { label: "Belum Dibil",       value: toRM(stats.unbilledAmount) },
                { label: "Kadar / Kad",       value: toRM(partner.partnerRate) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-xl p-4">
                  <p className="text-[11px] text-[var(--tx-3)] uppercase tracking-wide font-semibold mb-1">{label}</p>
                  <p className="text-xl font-bold text-[var(--tx-1)]">{value}</p>
                </div>
              ))}
            </div>

            {/* Partner URL actions */}
            <PartnerDashboardClient
              partnerUrl={partnerUrl}
              partnerRate={partner.partnerRate}
            />
          </>
        )}
      </main>
    </div>
  )
}
