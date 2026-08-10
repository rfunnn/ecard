import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PrintButton, FloatingPrintButton } from "./PrintButton"

export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string; invoiceId: string }> }

const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT:   "DRAF",
  ISSUED:  "DIKELUARKAN",
  PAID:    "DIBAYAR",
  OVERDUE: "TERTUNGGAK",
  VOID:    "DIBATAL",
}

const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT:   "#6b7280",
  ISSUED:  "#2563eb",
  PAID:    "#16a34a",
  OVERDUE: "#dc2626",
  VOID:    "#9ca3af",
}

export default async function PrintInvoicePage({ params }: Context) {
  const { id, invoiceId } = await params

  const invoice = await prisma.partnerInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      partner: {
        select: {
          companyName: true, contactPerson: true, email: true,
          phone: true, address: true,
        },
      },
      items: {
        include: {
          usage: {
            select: {
              packageName: true, billingPeriod: true,
              partnerRateAtUsage: true, amount: true,
              card: { select: { slug: true, title: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!invoice || invoice.partnerId !== id) notFound()

  const toRM = (sen: number) => `RM${(sen / 100).toFixed(2)}`
  const statusColor = INVOICE_STATUS_COLORS[invoice.status] ?? "#6b7280"
  const statusLabel = INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status

  return (
    <>
      {/* Hide admin chrome on print */}
      <style>{`
        @media print {
          header, nav, .no-print { display: none !important; }
          main { padding: 0 !important; max-width: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto">
        {/* Print button — hidden on print */}
        <div className="no-print flex items-center justify-between mb-6">
          <a href={`/admin/partners/${id}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Kembali
          </a>
          <PrintButton />
        </div>

        {/* Invoice document */}
        <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="text-xl font-black tracking-tight">
                ekad<span className="text-yellow-400">ku</span>.com
              </p>
              <p className="text-xs text-gray-400 mt-1">Kad Digital Premium</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-gray-900 tracking-tight">INVOIS</p>
              <p className="font-mono text-sm text-gray-500 mt-1">{invoice.invoiceNumber}</p>
              <span
                className="inline-block mt-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider border-2"
                style={{ color: statusColor, borderColor: statusColor }}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <hr className="border-gray-200 mb-8" />

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Daripada</p>
              <p className="font-semibold text-gray-900">Ekadku Sdn Bhd</p>
              <p className="text-sm text-gray-600 mt-1">ekadku.com</p>
              <p className="text-sm text-gray-600">support@ekadku.com</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Kepada</p>
              <p className="font-semibold text-gray-900">{invoice.partner.companyName}</p>
              <p className="text-sm text-gray-600 mt-1">{invoice.partner.contactPerson}</p>
              <p className="text-sm text-gray-600">{invoice.partner.email}</p>
              <p className="text-sm text-gray-600">{invoice.partner.phone}</p>
              {invoice.partner.address && (
                <p className="text-sm text-gray-600 mt-1">{invoice.partner.address}</p>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex gap-8 flex-wrap mb-8 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Tempoh Bil</p>
              <p className="text-sm font-semibold text-gray-900">
                {invoice.billingPeriodStart.toLocaleDateString("ms-MY", { month: "long", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Tarikh Dikeluarkan</p>
              <p className="text-sm font-semibold text-gray-900">
                {(invoice.issuedAt ?? invoice.createdAt).toLocaleDateString("ms-MY")}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Tarikh Akhir Bayaran</p>
              <p className="text-sm font-semibold" style={{ color: invoice.status === "OVERDUE" ? "#dc2626" : "#111827" }}>
                {invoice.dueDate ? invoice.dueDate.toLocaleDateString("ms-MY") : "—"}
              </p>
            </div>
            {invoice.paidAt && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Tarikh Dibayar</p>
                <p className="text-sm font-semibold text-green-700">
                  {invoice.paidAt.toLocaleDateString("ms-MY")}
                </p>
              </div>
            )}
          </div>

          {/* Line items table */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 pb-3 pr-4" style={{ width: "38%" }}>Kad Digital</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 pb-3 pr-4">Pakej</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 pb-3 pr-4">Tempoh</th>
                <th className="text-right text-[10px] font-bold uppercase tracking-widest text-gray-400 pb-3">Amaun</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={item.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-900">{item.usage.card.title || "(Tiada tajuk)"}</p>
                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">{item.usage.card.slug}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 capitalize">{item.usage.packageName}</td>
                  <td className="py-3 pr-4 font-mono text-gray-500 text-xs">{item.usage.billingPeriod}</td>
                  <td className="py-3 text-right font-semibold text-gray-900">{toRM(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="min-w-[220px] space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({invoice.items.length} kad)</span>
                <span>{toRM(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Cukai (0%)</span>
                <span>RM0.00</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t-2 border-gray-900">
                <span>Jumlah Keseluruhan</span>
                <span>{toRM(invoice.total)}</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Footer note */}
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            Sila buat pembayaran sebelum tarikh akhir yang dinyatakan di atas. &nbsp;|&nbsp;
            Pertanyaan: <strong className="text-gray-600">support@ekadku.com</strong> &nbsp;|&nbsp;
            Terima kasih atas kerjasama anda sebagai rakan ekadku.com.
          </p>
        </div>
      </div>

      <FloatingPrintButton />
    </>
  )
}
