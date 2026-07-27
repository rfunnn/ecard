import Link from "next/link"
import { LayoutTemplate, ShoppingBag, ChevronRight } from "lucide-react"

const sections = [
  {
    href: "/admin/templates",
    icon: LayoutTemplate,
    label: "Templates",
    description: "Urus, tambah, dan edit template kad jemputan.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    href: "/admin/orders",
    icon: ShoppingBag,
    label: "Orders",
    description: "Semak semua pesanan dan tandakan sebagai dibayar.",
    color: "text-green-600 bg-green-50",
  },
]

export default function AdminPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-1">Pilih bahagian untuk diurus.</p>
      </div>

      <div className="grid gap-4">
        {sections.map(({ href, icon: Icon, label, description, color }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all group"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-400 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
