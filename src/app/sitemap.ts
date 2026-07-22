import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const BASE = "https://ekadku.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/templates`,   lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/invite/demo`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/privacy`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,       lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ]

  let cardPages: MetadataRoute.Sitemap = []
  try {
    const cards = await prisma.invitationCard.findMany({
      where: {
        isPublished: true,
        // Exclude expired cards — their content is inaccessible
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { slug: true, cardNum: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    })
    cardPages = cards.map((c) => ({
      // Prefer the short /{cardNum} URL when available — matches what users share
      url: c.cardNum ? `${BASE}/${c.cardNum}` : `${BASE}/invite/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  } catch {
    // DB unavailable at build time — skip dynamic pages
  }

  return [...staticPages, ...cardPages]
}
