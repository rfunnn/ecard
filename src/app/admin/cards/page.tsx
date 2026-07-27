import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ChevronLeft, ChevronRight, CreditCard } from "lucide-react"
import { PublishFreeButton } from "@/components/admin/PublishFreeButton"

const PER_PAGE = 30

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>
}

export default async function AdminCardsPage({ searchParams }: Props) {
  const { page: pageParam, status: statusParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const statusFilter = statusParam === "published" ? true : statusParam === "draft" ? false : undefined

  const where = statusFilter !== undefined ? { isPublished: statusFilter } : {}

  const [total, cards] = await Promise.all([
    prisma.invitationCard.count({ where }),
    prisma.invitationCard.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        slug: true,
        title: true,
        groomName: true,
        brideName: true,
        isPublished: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { email: true, name: true } },
        template: { select: { name: true, nameMs: true } },
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  function pageHref(p: number) {
    const q = new URLSearchParams()
    q.set("page", String(p))
    if (statusParam) q.set("status", statusParam)
    return `/admin/cards?${q}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cards</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} kad</p>
        </div>

        <div className="flex items-center gap-1">
          {[
            { label: "All", value: undefined },
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ].map(({ label, value }) => {
            const active = value === statusParam || (value === undefined && !statusParam)
            const href = value ? `/admin/cards?status=${value}` : "/admin/cards"
            return (
              <Link
                key={label}
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

      {cards.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Tiada kad ditemui.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kad
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Pemilik
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Template
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Dikemaskini
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cards.map((card) => {
                const expired = card.expiresAt && new Date(card.expiresAt) < new Date()
                return (
                  <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/kad/${card.slug}`}
                        target="_blank"
                        className="font-mono text-xs text-amber-600 hover:text-amber-700 hover:underline"
                      >
                        {card.slug}
                      </Link>
                      <p className="text-xs text-gray-700 mt-0.5 truncate max-w-[160px]">
                        {card.title}
                        {(card.groomName || card.brideName) && (
                          <span className="text-gray-400"> · {[card.groomName, card.brideName].filter(Boolean).join(" & ")}</span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {card.user ? (
                        <>
                          <p className="text-gray-700 truncate max-w-[180px]">{card.user.email}</p>
                          {card.user.name && (
                            <p className="text-xs text-gray-400 truncate max-w-[180px]">{card.user.name}</p>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Tiada akaun</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-gray-600 truncate max-w-[140px]">
                        {card.template?.nameMs ?? card.template?.name ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {card.isPublished ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${expired ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700"}`}>
                          {expired ? "Expired" : "Live"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <p className="text-xs text-gray-400">
                        {new Date(card.updatedAt).toLocaleDateString("ms-MY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!card.isPublished && <PublishFreeButton slug={card.slug} />}
                    </td>
                  </tr>
                )
              })}
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
