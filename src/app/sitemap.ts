import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const BASE = "https://ekadku.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/templates`, lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/invite/demo`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ]

  let cardPages: MetadataRoute.Sitemap = []
  try {
    const cards = await prisma.invitationCard.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    })
    cardPages = cards.map((c) => ({
      url: `${BASE}/invite/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  } catch {
    // DB unavailable at build time — skip dynamic pages
  }

  return [...staticPages, ...cardPages]
}
