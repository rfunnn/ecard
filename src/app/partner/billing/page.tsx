import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import Image from "next/image"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import UserMenu from "@/components/UserMenu"

export const dynamic = "force-dynamic"

const INVOICE_STATUS_LABEL: Record<string, string> = {
  DRAFT:    "Draf",
  ISSUED:   "Dikeluarkan",
  PAID:     "Dibayar",
  OVERDUE:  "Tertunggak",
  VOID:     "Dibatal",
}

const INVOICE_STATUS_STYLE: Record<string, string> = {
  DRAFT:   "bg-gray-100 text-gray-600",
  ISSUED:  "bg-blue-50 text-blue-700",
  PAID:    "bg-green-50 text-green-700",
  OVERDUE: "bg-red-50 text-red-700",
  VOID:    "bg-gray-100 text-gray-400",
}

const USAGE_STATUS_STYLE: Record<string, string> = {
  UNBILLED:  "bg-amber-50 text-amber-700",
  INVOICED:  "bg-blue-50 text-blue-600",
  PAID:      "bg-green-50 text-green-700",
  VOID:      "bg-gray-100 text-gray-400",
}

export default async function PartnerBillingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/partner/billing")
  }

  const partner = await prisma.partner.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, status: true, partnerRate: true },
  })

  if (!partner) redirect("/partner/register")
  if (partner.status !== "ACTIVE") redirect("/partner/dashboard")

  const [usages, invoices] = await Promise.all([
    prisma.partnerUsage.findMany({
      where: { partnerId: partner.id },
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
      where: { partnerId: partner.id },
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
  ])

  const toRM = (sen: number) => `RM${(sen / 100).toFixed(2)}`
  const unbilledUsages = usages.filter((u) => u.status === "UNBILLED")
  const unbilledTotal  = unbilledUsages.reduce((s, u) => s + u.amount, 0)

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
            <Link href="/partner/guidline" className="text-xs text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors hidden sm:block">
              Panduan
            </Link>
            <Link href="/partner/dashboard" className="text-xs text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors hidden sm:block">
              Dashboard
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-xl p-4">
            <p className="text-[11px] text-[var(--tx-3)] uppercase tracking-wide font-semibold mb-1">Jumlah Kad</p>
            <p className="text-xl font-bold text-[var(--tx-1)]">{usages.length}</p>
          </div>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-xl p-4">
            <p className="text-[11px] text-[var(--tx-3)] uppercase tracking-wide font-semibold mb-1">Belum Dibil</p>
            <p className="text-xl font-bold text-amber-600">{toRM(unbilledTotal)}</p>
          </div>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-xl p-4">
            <p className="text-[11px] text-[var(--tx-3)] uppercase tracking-wide font-semibold mb-1">Kadar / Kad</p>
            <p className="text-xl font-bold text-[var(--tx-1)]">{toRM(partner.partnerRate)}</p>
          </div>
        </div>

        {/* Invoices */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--tx-1)] mb-3">Invois</h2>
          {invoices.length === 0 ? (
            <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-xl px-5 py-8 text-center text-sm text-[var(--tx-3)]">
              Tiada invois lagi. Invois dijana oleh pihak Ekadku setiap bulan.
            </div>
          ) : (
            <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[var(--bd)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--tx-3)] uppercase tracking-wide">No. Invois</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--tx-3)] uppercase tracking-wide">Tempoh</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--tx-3)] uppercase tracking-wide">Kad</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--tx-3)] uppercase tracking-wide">Jumlah</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--tx-3)] uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--tx-3)] uppercase tracking-wide">Tarikh Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--bd)]">
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="px-4 py-3 font-mono text-xs text-[var(--tx-1)]">{inv.invoiceNumber}</td>
                        <td className="px-4 py-3 text-xs text-[var(--tx-2)]">
                          {inv.billingPeriodStart.toLocaleDateString("ms-MY", { month: "long", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--tx-2)]">{inv._count.items}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-[var(--tx-1)]">{toRM(inv.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${INVOICE_STATUS_STYLE[inv.status] ?? "bg-gray-100 text-gray-500"}`}>
                            {INVOICE_STATUS_LABEL[inv.status] ?? inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--tx-2)]">
                          {inv.dueDate ? inv.dueDate.toLocaleDateString("ms-MY") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Usage history */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--tx-1)] mb-3">Sejarah Penggunaan</h2>
          {usages.length === 0 ? (
            <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-xl px-5 py-8 text-center text-sm text-[var(--tx-3)]">
              Tiada rekod penggunaan lagi.
            </div>
          ) : (
            <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[var(--bd)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--tx-3)] uppercase tracking-wide">Kad</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--tx-3)] uppercase tracking-wide">Pakej</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--tx-3)] uppercase tracking-wide">Tempoh Bil</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--tx-3)] uppercase tracking-wide">Amaun</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--tx-3)] uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--bd)]">
                    {usages.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-[var(--tx-1)] truncate max-w-[160px]">{u.card.title || "—"}</p>
                          <p className="text-[11px] text-[var(--tx-3)] font-mono">{u.card.slug}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--tx-2)] capitalize">{u.packageName}</td>
                        <td className="px-4 py-3 text-xs font-mono text-[var(--tx-2)]">{u.billingPeriod}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-[var(--tx-1)]">{toRM(u.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${USAGE_STATUS_STYLE[u.status] ?? "bg-gray-100 text-gray-500"}`}>
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <p className="text-xs text-[var(--tx-3)] text-center">
          Untuk pertanyaan bil, hubungi <span className="text-[var(--tx-2)]">support@ekadku.com</span>
        </p>
      </main>
    </div>
  )
}
