"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { User, ShoppingBag, Sun, Moon, LogOut, MessageCircle } from "lucide-react"

const WA_URL = `https://wa.me/601164981201?text=${encodeURIComponent("Hello, saya ingin bertanya tentang ekadku.com")}`
import { useTheme } from "@/components/ThemeProvider"

export default function UserMenu() {
  const { data: session, status } = useSession()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [cardCount, setCardCount] = useState(0)
  const ref = useRef<HTMLDivElement | undefined>(undefined)

  useEffect(() => {
    if (!session) { setCardCount(0); return }
    fetch("/api/user/cards")
      .then(r => r.json())
      .then(d => setCardCount(d.cards?.length ?? 0))
      .catch(() => {})
  }, [session])

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onOutsideClick)
    return () => document.removeEventListener("mousedown", onOutsideClick)
  }, [])

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (session?.user?.email?.[0] ?? "U").toUpperCase()

  const isLoading = status === "loading"

  return (
    <>
      <div
        className="relative"
        ref={(el) => { if (el) ref.current = el }}
      >
        {/* ── Trigger button ── */}
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={isLoading}
          className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors focus:outline-none ${
            session
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-200"
              : "border border-[var(--bd)] text-[var(--tx-2)] hover:text-[var(--tx-1)] hover:bg-[var(--sf)]"
          } ${isLoading ? "opacity-40 pointer-events-none" : ""}`}
          aria-label="Menu pengguna"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : session ? (
            initials
          ) : (
            <User className="w-4 h-4" />
          )}

        </button>

        {/* ── Dropdown ── */}
        {open && (
          <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[var(--bd)] bg-[var(--pg)] shadow-xl z-50 overflow-hidden">

            {/* User section */}
            {session ? (
              <div className="px-4 py-3 border-b border-[var(--bd)]">
                <p className="text-sm font-semibold text-[var(--tx-1)] truncate leading-tight">
                  {session.user.name ?? "—"}
                </p>
                <p className="text-xs text-[var(--tx-3)] truncate mt-0.5">{session.user.email}</p>
              </div>
            ) : (
              <div className="px-4 py-3 border-b border-[var(--bd)] space-y-2">
                <p className="text-[11px] text-[var(--tx-3)]">Belum log masuk</p>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block text-center text-xs py-1.5 rounded-lg bg-gold/10 border border-gold/25 text-gold hover:bg-gold/20 transition-colors font-medium"
                >
                  Log Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="block text-center text-xs py-1.5 rounded-lg border border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--sf)] transition-colors"
                >
                  Daftar Akaun
                </Link>
              </div>
            )}


            {/* Kad Saya */}
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--tx-2)] hover:text-[var(--tx-1)] hover:bg-[var(--sf)] transition-colors w-full"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                Kad Saya
                {cardCount > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] text-[10px] bg-gold text-ink rounded-full flex items-center justify-center px-1 font-bold leading-none">
                    {cardCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Hubungi Kami */}
            <div className="border-t border-[var(--bd)] py-1">
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--tx-2)] hover:text-[var(--tx-1)] hover:bg-[var(--sf)] transition-colors w-full"
              >
                <MessageCircle className="w-4 h-4 shrink-0 text-[#25D366]" />
                Hubungi Kami
              </a>
            </div>

            {/* Theme row */}
            <div className="border-t border-[var(--bd)] py-1">
              <button
                onClick={toggle}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--tx-2)] hover:text-[var(--tx-1)] hover:bg-[var(--sf)] transition-colors w-full"
              >
                {theme === "dark"
                  ? <Sun className="w-4 h-4 shrink-0" />
                  : <Moon className="w-4 h-4 shrink-0" />
                }
                Theme
                <span className="ml-auto text-[11px] text-[var(--tx-3)]">
                  {theme === "dark" ? "Gelap" : "Cerah"}
                </span>
              </button>
            </div>

            {/* Sign out */}
            {session && (
              <div className="border-t border-[var(--bd)] py-1">
                <button
                  onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }) }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Log Keluar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </>
  )
}
