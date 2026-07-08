"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import UserMenu from "@/components/UserMenu"
import { NavLikesButton } from "@/components/NavLikesButton"
import { NavCartButton } from "@/components/NavCartButton"
import type { ReactNode } from "react"

interface SiteNavProps {
  /** Extra actions placed between the logo and the right controls */
  actions?: ReactNode
}

export function SiteNav({ actions }: SiteNavProps) {
  return (
    <nav className="sticky top-0 z-40 bg-[var(--pg-nav)] backdrop-blur-md border-b border-[var(--bd)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
        {/* Logo → home */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Heart className="w-3.5 h-3.5 text-gold fill-gold/30" />
          <span className="font-playfair text-[16px] tracking-wide leading-none select-none">
            <span className="text-[var(--tx-1)]">e</span>
            <span style={{ color: "#D4AF37" }}>kad</span>
            <span className="text-[var(--tx-1)]">ku</span>
            <span className="text-gold/50 text-[10px] font-sans tracking-normal align-baseline">.com</span>
          </span>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          {actions}
          <NavLikesButton />
          <NavCartButton />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </nav>
  )
}
