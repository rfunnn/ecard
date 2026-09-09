"use client"

import { usePathname } from "next/navigation"
import { SiteNav } from "@/components/SiteNav"

// Only these named app routes show the site nav — card view routes (/1, /2, /some-slug) are excluded
const WITH_NAV = [
  "/templates", "/dashboard", "/checkout", "/likes",
  "/storefront", "/privacy", "/terms", "/mock-payment",
  "/forgot-password", "/reset-password",
  "/partner/register", "/partner/success",
]

export function ConditionalSiteNav() {
  const path = usePathname()
  if (WITH_NAV.some((r) => path.startsWith(r))) return <SiteNav />
  return null
}
