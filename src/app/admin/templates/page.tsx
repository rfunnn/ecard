/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { rewriteStorageUrl } from "@/lib/storage"
import { PlusCircle, Pencil, CheckCircle2, XCircle, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"

const CATEGORY_LABELS: Record<string, string> = {
  WEDDING: "Perkahwinan",
  BIRTHDAY: "Hari Lahir",
  CORPORATE: "Korporat",
  GENERIC: "Umum",
}

const PER_PAGE = 20

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminTemplatesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const [total, templates] = await Promise.all([
    prisma.template.count(),
    prisma.template.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { cards: true } } },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} template{total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/templates/new"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No templates yet.</p>
          <Link
            href="/admin/templates/new"
            className="mt-4 inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Create your first template
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">

            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Images
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Cards
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {t.image1Url ? (
                        <img
                          src={rewriteStorageUrl(t.image1Url)}
                          alt={t.name}
                          className="w-8 h-14 object-cover rounded shrink-0 bg-gray-100"
                        />
                      ) : (
                        <div className="w-8 h-14 bg-gray-100 rounded shrink-0 flex items-center justify-center">
                          <ImageIcon className="w-3 h-3 text-gray-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{t.name}</p>
                        <p className="text-xs text-gray-400 font-mono truncate">{t.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {CATEGORY_LABELS[t.category] ?? t.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {t.image1Url ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                      {t.image2Url ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-gray-600">{t._count.cards}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {t.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Tidak Aktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/templates/${t.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs font-medium transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Link>
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
                  href={`/admin/templates?page=${page - 1}`}
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
                        href={`/admin/templates?page=${item}`}
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
                  href={`/admin/templates?page=${page + 1}`}
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
