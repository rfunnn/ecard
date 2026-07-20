import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildOgImage } from "@/lib/og-card"
import { rewriteStorageUrl } from "@/lib/storage"

export const runtime = "nodejs"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Accept both numeric cardNum and slug
  const num = parseInt(slug, 10)
  const where = !isNaN(num) && String(num) === slug ? { cardNum: num } : { slug }

  const raw = await prisma.invitationCard.findUnique({
    where,
    select: {
      title: true,
      groomName: true,
      brideName: true,
      wizardConfig: true,
      template: { select: { category: true, image1Url: true, thumbnail: true } },
      theme: { select: { primaryColor: true, bgColor: true, bgImageUrl: true } },
    },
  })

  const card = raw ? {
    ...raw,
    template: raw.template ? {
      ...raw.template,
      image1Url: rewriteStorageUrl(raw.template.image1Url) || null,
      thumbnail: rewriteStorageUrl(raw.template.thumbnail) || null,
    } : null,
    theme: raw.theme ? {
      ...raw.theme,
      bgImageUrl: rewriteStorageUrl(raw.theme.bgImageUrl) || null,
    } : null,
  } : null

  return new ImageResponse(buildOgImage(card), {
    width: 1200,
    height: 630,
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  })
}
