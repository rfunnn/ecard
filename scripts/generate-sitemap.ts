#!/usr/bin/env ts-node
/**
 * Sitemap generator — writes public/sitemap.xml (or a sitemap index when > 50 000 URLs).
 *
 * Usage:
 *   npm run sitemap:build
 *
 * If public/sitemap.xml exists, Next.js serves it as a static file instead of
 * the dynamic src/app/sitemap.ts route. Delete the file to revert to dynamic mode.
 */

import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { writeFileSync } from "fs"
import { join } from "path"

const BASE = "https://ekadku.com"
const MAX_PER_FILE = 50_000
const OUT = join(process.cwd(), "public")

// ── Types ─────────────────────────────────────────────────────────────────────

interface SitemapImage {
  url: string
  title?: string
}

interface SitemapEntry {
  url: string
  lastmod?: Date | string
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: number
  images?: SitemapImage[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function fmtDate(d?: Date | string): string {
  const dt = d ? (typeof d === "string" ? new Date(d) : d) : new Date()
  return dt.toISOString().split("T")[0]
}

function buildSitemapXml(entries: SitemapEntry[]): string {
  const needsImageNs = entries.some((e) => e.images && e.images.length > 0)
  const imageNs = needsImageNs
    ? ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`
    : ""

  const urlBlocks = entries.map((e) => {
    const imageBlocks = (e.images ?? [])
      .filter((img) => img.url)
      .map((img) => {
        const title = img.title ? `\n      <image:title>${escXml(img.title)}</image:title>` : ""
        return `    <image:image>\n      <image:loc>${escXml(img.url)}</image:loc>${title}\n    </image:image>`
      })
      .join("\n")

    const lines = [
      "  <url>",
      `    <loc>${escXml(e.url)}</loc>`,
      `    <lastmod>${fmtDate(e.lastmod)}</lastmod>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : "",
      e.priority != null ? `    <priority>${e.priority.toFixed(1)}</priority>` : "",
      imageBlocks,
      "  </url>",
    ].filter(Boolean)

    return lines.join("\n")
  })

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNs}>`,
    ...urlBlocks,
    `</urlset>`,
  ].join("\n")
}

function buildIndexXml(fileNames: string[]): string {
  const today = fmtDate()
  const sitemapBlocks = fileNames.map(
    (name) =>
      `  <sitemap>\n    <loc>${BASE}/${name}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`
  )

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...sitemapBlocks,
    `</sitemapindex>`,
  ].join("\n")
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Run: $env:DATABASE_URL='mysql://...' ; npm run sitemap:build")
    process.exit(1)
  }

  const adapter = new PrismaMariaDb(process.env.DATABASE_URL)
  const prisma = new PrismaClient({ adapter })

  // ── Fetch data ─────────────────────────────────────────────────────────────

  console.log("→ Fetching templates…")
  const templates = await prisma.template.findMany({
    where: { isActive: true },
    select: { name: true, image1Url: true, image2Url: true, updatedAt: true },
    orderBy: { sortOrder: "asc" },
  })

  console.log("→ Fetching published cards…")
  const cards = await prisma.invitationCard.findMany({
    where: {
      isPublished: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 100_000,
  })

  await prisma.$disconnect()

  console.log(`  templates: ${templates.length}  |  published cards: ${cards.length}`)

  // ── Build entries ──────────────────────────────────────────────────────────

  // Collect template preview images for the /templates page image sitemap
  const templateImages: SitemapImage[] = templates.flatMap((t) => {
    const imgs: SitemapImage[] = []
    if (t.image1Url) imgs.push({ url: t.image1Url, title: t.name })
    if (t.image2Url) imgs.push({ url: t.image2Url, title: `${t.name} — halaman 2` })
    return imgs
  })

  const latestTemplateUpdate =
    templates.length > 0
      ? templates.reduce((max, t) => (t.updatedAt > max ? t.updatedAt : max), templates[0].updatedAt)
      : new Date()

  const staticEntries: SitemapEntry[] = [
    {
      url: BASE,
      changefreq: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/templates`,
      lastmod: latestTemplateUpdate,
      changefreq: "daily",
      priority: 0.9,
      images: templateImages,
    },
    {
      url: `${BASE}/invite/demo`,
      changefreq: "monthly",
      priority: 0.7,
    },
  ]

  const cardEntries: SitemapEntry[] = cards.map((c) => ({
    url: `${BASE}/invite/${c.slug}`,
    lastmod: c.updatedAt,
    changefreq: "monthly",
    priority: 0.6,
  }))

  const allEntries = [...staticEntries, ...cardEntries]

  // ── Write files ────────────────────────────────────────────────────────────

  if (allEntries.length <= MAX_PER_FILE) {
    const xml = buildSitemapXml(allEntries)
    writeFileSync(join(OUT, "sitemap.xml"), xml, "utf-8")
    console.log(`✓ public/sitemap.xml — ${allEntries.length} URLs`)
  } else {
    // Split into numbered sitemap files and write an index
    const chunks: SitemapEntry[][] = []
    for (let i = 0; i < allEntries.length; i += MAX_PER_FILE) {
      chunks.push(allEntries.slice(i, i + MAX_PER_FILE))
    }

    const fileNames: string[] = []
    chunks.forEach((chunk, i) => {
      const name = `sitemap-${i + 1}.xml`
      fileNames.push(name)
      writeFileSync(join(OUT, name), buildSitemapXml(chunk), "utf-8")
      console.log(`✓ public/${name} — ${chunk.length} URLs`)
    })

    writeFileSync(join(OUT, "sitemap-index.xml"), buildIndexXml(fileNames), "utf-8")
    console.log(`✓ public/sitemap-index.xml — ${fileNames.length} sub-sitemaps`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
