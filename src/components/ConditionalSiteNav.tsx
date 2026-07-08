"use client"

import { usePathname } from "next/navigation"
import { SiteNav } from "@/components/SiteNav"

// Pages that manage their own navigation (invite viewer, builder, admin, homepage)
const EXCLUDED = ["/", "/invite", "/builder", "/admin", "/login", "/register"]

export function ConditionalSiteNav() {
  const path = usePathname()
  const excluded = EXCLUDED.some((p) =>
    p === "/" ? path === "/" : path.startsWith(p)
  )
  if (excluded) return null
  return <SiteNav />
}
