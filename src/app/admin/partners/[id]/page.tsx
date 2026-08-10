import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
  ChevronLeft, Globe, AtSign, MapPin, Building2,
  ExternalLink, FileText,
} from "lucide-react"
import type { PartnerStatus, InvoiceStatus } from "@prisma/client"
import { PartnerStatusActions, GenerateInvoiceButton, InvoiceActions, PartnerEditButton, DeletePartnerButton } from "./PartnerDetailClient"

export const dynamic = "force-dynamic"

const STATUS_STYLES: Record<PartnerStatus, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  ACTIVE:    "bg-green-100 text-green-700",
  SUSPENDED: "bg-orange-100 text-orange-700",
  REJECTED:  "bg-red-100 text-red-700",
}

const STATUS_LABELS: Record<PartnerStatus, string> = {
  PENDING:   "Pending",
  ACTIVE:    "Aktif",
  SUSPENDED: "Digantung",
  REJECTED:  "Ditolak",
}

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  DRAFT:   "bg-gray-100 text-gray-600",
  ISSUED:  "bg-blue-50 text-blue-700",
  PAID:    "bg-green-50 text-green-700",
  OVERDUE: "bg-red-50 text-red-700",
  VOID:    "bg-gray-100 text-gray-400",
}

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT:   "Draf",
  ISSUED:  "Dikeluarkan",
  PAID:    "Dibayar",
  OVERDUE: "Tertunggak",
  VOID:    "Dibatal",
}

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  BUSINESS_CARD:  "Business Card",
  EVENT_SPACE:    "Event Space",
  EVENT_PLANNER:  "Event Planner",
  VENDOR:         "Vendor",
  OTHERS:         "Others",
}

const USAGE_STATUS_STYLES: Record<string, string> = {
  UNBILLED: "bg-amber-50 text-amber-700",
  INVOICED: "bg-blue-50 text-blue-600",
  PAID:     "bg-green-50 text-green-700",
  VOID:     "bg-gray-100 text-gray-400",
}

type Context = { params: Promise<{ id: string }> }

export default async function PartnerDetailPage({ params }: Context) {
  const { id } = await params

  const partner = await prisma.partner.findUnique({
    where: { id },
    select: {
      id: true, slug: true, companyName: true, contactPerson: true,
      email: true, phone: true, businessType: true, logo: true,
      address: true, registrationNumber: true, website: true,
      instagram: true, facebook: true, status: true, partnerRate: true,
      createdAt: true, updatedAt: true,
    },
  })

  if (!partner) notFound()

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "ekadku.com"
  const partnerUrl = `${partner.slug}.${baseDomain}`

  const now = new Date()
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const [usages, invoices, uniqueCustomers] = await Promise.all([
    prisma.partnerUsage.findMany({
      where: { partnerId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        packageName: true,
        partnerRateAtUsage: true,
        amount: true,
        billingPeriod: true,
        status: true,
        createdAt: true,
        card: { select: { slug: true, title: true } },
      },
    }),
    prisma.partnerInvoice.findMany({
      where: { partnerId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        invoiceNumber: true,
        billingPeriodStart: true,
        billingPeriodEnd: true,
        subtotal: true,
        total: true,
        status: true,
        dueDate: true,
        issuedAt: true,
        paidAt: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.invitationCard.findMany({
      where: { partnerId: id },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ])

  const unbilledUsage = usages.filter((u) => u.status === "UNBILLED")
  const unbilledTotal = unbilledUsage.reduce((s, u) => s + u.amount, 0)
  const paidTotal     = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0)

  const toRM = (sen: number) => `RM${(sen / 100).toFixed(2)}`

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/partners" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Partners
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">{partner.companyName}</span>
      </div>

      {/* Partner header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          {partner.logo ? (
            <img src={partner.logo} alt={partner.companyName} className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-indigo-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">{partner.companyName}</h1>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[partner.status]}`}>
                    {STATUS_LABELS[partner.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{BUSINESS_TYPE_LABELS[partner.businessType] ?? partner.businessType}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <PartnerStatusActions
                  partnerId={partner.id}
                  currentStatus={partner.status}
                  currentRate={partner.partnerRate}
                />
                <PartnerEditButton partner={partner} />
                <DeletePartnerButton partnerId={partner.id} companyName={partner.companyName} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium text-gray-400 w-28 shrink-0">Pegawai Hubungi</span>
                {partner.contactPerson}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium text-gray-400 w-28 shrink-0">E-mel</span>
                <a href={`mailto:${partner.email}`} className="text-indigo-600 hover:underline">{partner.email}</a>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium text-gray-400 w-28 shrink-0">Telefon</span>
                {partner.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium text-gray-400 w-28 shrink-0">Subdomain</span>
                <a href={`https://${partnerUrl}`} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-indigo-600 hover:underline inline-flex items-center gap-1">
                  {partnerUrl} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium text-gray-400 w-28 shrink-0">Kadar / Kad</span>
                <strong>{toRM(partner.partnerRate)}</strong>
              </div>
              {partner.registrationNumber && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium text-gray-400 w-28 shrink-0">No. Pendaftaran</span>
                  {partner.registrationNumber}
                </div>
              )}
              {partner.address && (
                <div className="flex items-start gap-2 text-gray-600 sm:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  {partner.address}
                </div>
              )}
              {(partner.website || partner.instagram || partner.facebook) && (
                <div className="flex items-center gap-3 sm:col-span-2">
                  {partner.website && (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                      <Globe className="w-3 h-3" /> Laman Web
                    </a>
                  )}
                  {partner.instagram && (
                    <a href={`https://instagram.com/${partner.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                      <AtSign className="w-3 h-3" /> {partner.instagram}
                    </a>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Didaftarkan: {partner.createdAt.toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Jumlah Kad",      value: String(usages.length) },
          { label: "Jumlah Pelanggan", value: String(uniqueCustomers.length) },
          { label: "Belum Dibil",     value: toRM(unbilledTotal), highlight: unbilledTotal > 0 },
          { label: "Jumlah Dibayar",  value: toRM(paidTotal) },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`p-4 rounded-xl border ${highlight ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={`text-xl font-bold mt-1 ${highlight ? "text-amber-700" : "text-gray-900"}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Invois</h2>
          <GenerateInvoiceButton partnerId={partner.id} defaultPeriod={defaultPeriod} />
        </div>

        {invoices.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            <FileText className="w-6 h-6 mx-auto mb-2 opacity-40" />
            Tiada invois lagi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">No. Invois</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tempoh Bil</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Jumlah</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tarikh Akhir</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {inv.billingPeriodStart.toLocaleDateString("ms-MY", { month: "long", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{inv._count.items} kad</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">{toRM(inv.total)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {inv.dueDate ? inv.dueDate.toLocaleDateString("ms-MY") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${INVOICE_STATUS_STYLES[inv.status]}`}>
                        {INVOICE_STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <InvoiceActions invoiceId={inv.id} currentStatus={inv.status} />
                        <Link
                          href={`/admin/partners/${partner.id}/invoice/${inv.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                        >
                          <FileText className="w-3 h-3" /> Cetak
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usage history */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Sejarah Penggunaan <span className="text-sm font-normal text-gray-400">({usages.length} rekod)</span></h2>
        </div>

        {usages.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">Tiada rekod penggunaan lagi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pakej</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tempoh Bil</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kadar Semasa</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Amaun</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tarikh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usages.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-xs truncate max-w-[160px]">{u.card.title || "—"}</p>
                      <p className="text-[11px] font-mono text-gray-400">{u.card.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 capitalize">{u.packageName}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{u.billingPeriod}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{toRM(u.partnerRateAtUsage)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">{toRM(u.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${USAGE_STATUS_STYLES[u.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {u.createdAt.toLocaleDateString("ms-MY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
