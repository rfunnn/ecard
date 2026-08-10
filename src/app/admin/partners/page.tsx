import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Building2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import type { PartnerStatus, BusinessType } from "@prisma/client"

export const dynamic = "force-dynamic"

const PER_PAGE = 25

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  BUSINESS_CARD:  "Business Card",
  EVENT_SPACE:    "Event Space",
  EVENT_PLANNER:  "Event Planner",
  VENDOR:         "Vendor",
  OTHERS:         "Others",
}

const STATUS_STYLES: Record<PartnerStatus, string> = {
  PENDING:   "bg-amber-50 text-amber-700",
  ACTIVE:    "bg-green-50 text-green-700",
  SUSPENDED: "bg-orange-50 text-orange-700",
  REJECTED:  "bg-red-50 text-red-700",
}

const STATUS_LABELS: Record<PartnerStatus, string> = {
  PENDING:   "Pending",
  ACTIVE:    "Aktif",
  SUSPENDED: "Digantung",
  REJECTED:  "Ditolak",
}

const VALID_STATUSES: PartnerStatus[] = ["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>
}

export default async function AdminPartnersPage({ searchParams }: Props) {
  const { page: pageParam, status: statusParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const statusFilter = VALID_STATUSES.includes(statusParam as PartnerStatus)
    ? (statusParam as PartnerStatus)
    : undefined

  const where = statusFilter ? { status: statusFilter } : {}

  const [total, partners, statusCounts, unbilledByPartner] = await Promise.all([
    prisma.partner.count({ where }),
    prisma.partner.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        slug: true,
        companyName: true,
        contactPerson: true,
        email: true,
        phone: true,
        businessType: true,
        status: true,
        partnerRate: true,
        createdAt: true,
        _count: { select: { cards: true, usages: true } },
      },
    }),
    prisma.partner.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.partnerUsage.groupBy({
      by: ["partnerId"],
      where: { status: "UNBILLED" },
      _count: { id: true },
      _sum: { amount: true },
    }),
  ])

  const statusCountMap = new Map(statusCounts.map((s) => [s.status, s._count.id]))
  const unbilledMap = new Map(
    unbilledByPartner.map((u) => [u.partnerId, { count: u._count.id, amount: u._sum.amount ?? 0 }]),
  )

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "ekadku.com"

  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (p > 1) params.set("page", String(p))
    if (statusFilter) params.set("status", statusFilter)
    const q = params.toString()
    return `/admin/partners${q ? `?${q}` : ""}`
  }

  function statusHref(s: string) {
    const params = new URLSearchParams()
    if (s) params.set("status", s)
    return `/admin/partners${params.toString() ? `?${params.toString()}` : ""}`
  }

  const pendingCount = statusCountMap.get("PENDING") ?? 0
  const toRM = (sen: number) => `RM${(sen / 100).toFixed(2)}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Partner Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} partner berdaftar</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {VALID_STATUSES.map((s) => (
          <Link
            key={s}
            href={statusHref(s)}
            className={`p-4 rounded-xl border transition-all ${
              statusFilter === s
                ? "border-indigo-300 bg-indigo-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{STATUS_LABELS[s]}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{statusCountMap.get(s) ?? 0}</p>
          </Link>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span><strong>{pendingCount}</strong> permohonan menunggu kelulusan.</span>
          <Link href={statusHref("PENDING")} className="ml-auto font-semibold underline underline-offset-2 shrink-0">Semak</Link>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {[{ label: "Semua", value: "" }, ...VALID_STATUSES.map((s) => ({ label: STATUS_LABELS[s], value: s }))].map(({ label, value }) => (
          <Link
            key={value}
            href={statusHref(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (statusFilter ?? "") === value
                ? "bg-indigo-100 text-indigo-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Syarikat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Jenis</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Subdomain</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kad</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Belum Dibil</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partners.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <Building2 className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    Tiada partner ditemui
                  </td>
                </tr>
              )}
              {partners.map((p) => {
                const unbilled = unbilledMap.get(p.id)
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.companyName}</div>
                      <div className="text-xs text-gray-400">{p.contactPerson} · {p.email}</div>
                      <div className="text-xs text-gray-400">{p.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{BUSINESS_TYPE_LABELS[p.businessType]}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-600">{p.slug}.{baseDomain}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {p._count.cards}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {unbilled && unbilled.count > 0 ? (
                        <span className="text-amber-700 font-semibold">{toRM(unbilled.amount)} <span className="font-normal text-gray-400">({unbilled.count} kad)</span></span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[p.status]}`}>
                        {STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/partners/${p.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Urus →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">Halaman {page} daripada {totalPages}</p>
            <div className="flex items-center gap-1">
              <Link
                href={pageHref(page - 1)}
                className={`p-1.5 rounded-lg transition-colors ${page <= 1 ? "text-gray-300 pointer-events-none" : "text-gray-600 hover:bg-gray-100"}`}
                aria-disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={pageHref(page + 1)}
                className={`p-1.5 rounded-lg transition-colors ${page >= totalPages ? "text-gray-300 pointer-events-none" : "text-gray-600 hover:bg-gray-100"}`}
                aria-disabled={page >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
