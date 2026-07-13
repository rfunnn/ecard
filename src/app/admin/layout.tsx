import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
              ekadku.com
            </Link>
            <span className="text-gray-300 text-sm">·</span>
            <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Admin
            </Link>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/admin/templates"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Templates
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  )
}
