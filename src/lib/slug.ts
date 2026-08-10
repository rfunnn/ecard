import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8)

export function generateSlug(): string {
  return nanoid()
}

export const RESERVED_PARTNER_SLUGS = new Set([
  "www", "api", "admin", "app", "mail", "support", "help",
  "dashboard", "login", "register", "status", "cdn", "static",
  "assets", "partner", "storefront",
])

export function generatePartnerSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "partner"
}
