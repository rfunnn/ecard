import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react"
import { MarkPaidButton } from "@/components/admin/MarkPaidButton"
import type { OrderStatus } from "@prisma/client"

const PER_PAGE = 25

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:   "Pending",
  PAID:      "Paid",
  FAILED:    "Failed",
  CANCELLED: "Cancelled",
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:   "bg-yellow-50 text-yellow-700",
  PAID:      "bg-green-50 text-green-700",
  FAILED:    "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
}

const VALID_STATUSES = ["PENDING", "PAID", "FAILED", "CANCELLED"] as const

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { page: pageParam, status: statusParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const statusFilter = VALID_STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined

  const where = statusFilter ? { status: statusFilter } : {}

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        user: { select: { email: true, name: true } },
        items: {
          select: {
            package: true,
            amount: true,
            card: { select: { slug: true, title: true } },
          },
        },
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  function pageHref(p: number) {
    const q = new URLSearchParams()
    q.set("page", String(p))
    if (statusFilter) q.set("status", statusFilter)
    return `/admin/orders?${q}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} order{total !== 1 ? "s" : ""}</p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          {([undefined, ...VALID_STATUSES] as (OrderStatus | undefined)[]).map((s) => {
            const label = s ? STATUS_LABELS[s] : "All"
            const active = s === statusFilter
            const href = s
              ? `/admin/orders?status=${s}`
              : "/admin/orders"
            return (
              <Link
                key={s ?? "all"}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-amber-500 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cards
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-gray-500">{order.id.slice(0, 8)}…</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("ms-MY", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-gray-700 truncate max-w-[180px]">{order.user.email}</p>
                    {order.user.name && (
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">{order.user.name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {order.items.map((item) => (
                        <div key={item.card.slug} className="flex items-center gap-1.5">
                          <Link
                            href={`/kad/${item.card.slug}`}
                            target="_blank"
                            className="font-mono text-xs text-amber-600 hover:text-amber-700 hover:underline"
                          >
                            {item.card.slug}
                          </Link>
                          <span className="text-xs text-gray-400">({item.package})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-gray-800">
                      RM{(order.totalAmount / 100).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(order.status === "PENDING" || order.status === "FAILED") && (
                      <MarkPaidButton orderId={order.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} daripada {total}
              </p>
              <div className="flex items-center gap-1">
                <Link
                  href={pageHref(page - 1)}
                  aria-disabled={page <= 1}
                  className={`p-1.5 rounded-lg border border-gray-200 text-gray-500 transition-colors ${
                    page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…")
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    item === "…" ? (
                      <span key={`gap-${idx}`} className="px-1 text-xs text-gray-400">…</span>
                    ) : (
                      <Link
                        key={item}
                        href={pageHref(item as number)}
                        className={`min-w-[2rem] h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                          item === page
                            ? "bg-amber-500 text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </Link>
                    )
                  )}

                <Link
                  href={pageHref(page + 1)}
                  aria-disabled={page >= totalPages}
                  className={`p-1.5 rounded-lg border border-gray-200 text-gray-500 transition-colors ${
                    page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
