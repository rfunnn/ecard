import Link from "next/link"
import { Heart, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--pg)] flex flex-col items-center justify-center px-5 text-center">
      <div className="relative mb-8">
        <p className="font-playfair text-[96px] lg:text-[144px] leading-none text-[var(--bd)] select-none font-bold">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="w-10 h-10 text-gold/40 fill-gold/10" />
        </div>
      </div>

      <h1 className="font-playfair text-2xl lg:text-3xl text-[var(--tx-1)] mb-3">
        Halaman Tidak Dijumpai
      </h1>
      <p className="text-[var(--tx-2)] text-sm lg:text-base max-w-sm mb-8 leading-relaxed">
        Mungkin pautan telah tamat tempoh, atau halaman ini sudah tidak wujud.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gold text-ink font-semibold px-6 py-2.5 rounded-full hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20 active:scale-95 text-sm"
        >
          Laman Utama
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 border border-[var(--bd)] hover:border-gold/40 text-[var(--tx-1)] px-6 py-2.5 rounded-full transition-all text-sm hover:bg-[var(--sf)] active:scale-95"
        >
          Lihat Templat
        </Link>
      </div>

      <p className="mt-10 text-[11px] text-[var(--tx-3)]">ekadku.com</p>
    </div>
  )
}
