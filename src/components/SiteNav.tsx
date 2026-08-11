"use client"

import Link from "next/link"
import Image from "next/image"
import UserMenu from "@/components/UserMenu"
import { NavLikesButton } from "@/components/NavLikesButton"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import type { ReactNode } from "react"

interface SiteNavProps {
  /** Extra actions placed between the logo and the right controls */
  actions?: ReactNode
}

export function SiteNav({ actions }: SiteNavProps) {
  return (
    <nav className="sticky top-0 z-40 bg-[var(--pg-nav)] backdrop-blur-md border-b border-[var(--bd)]">
      <div className="flex items-center justify-between px-5 lg:px-10 h-14">
        {/* Logo → home */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/icon.png" alt="ekadku" width={20} height={20} className="rounded-sm" />
          <span className="font-playfair text-[16px] tracking-wide leading-none select-none">
            <span className="text-[var(--tx-1)]">e</span>
            <span className="text-gold">kad</span>
            <span className="text-[var(--tx-1)]">ku</span>
            <span className="text-gold/50 text-[10px] font-sans tracking-normal align-baseline">.com</span>
          </span>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          {actions}
          <LanguageSwitcher />
          <NavLikesButton />
          <UserMenu />
        </div>
      </div>
    </nav>
  )
}
