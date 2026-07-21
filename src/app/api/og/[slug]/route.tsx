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

  // Render at 0.7× (840×441). Keeps the same 1.91:1 OG aspect ratio while
  // cutting the PNG byte size roughly in half, so photographic covers stay
  // under WhatsApp's ~300 KB link-preview thumbnail limit.
  const OG_SCALE = 0.7
  const image = new ImageResponse(buildOgImage(card, OG_SCALE), {
    width: Math.round(1200 * OG_SCALE),
    height: Math.round(630 * OG_SCALE),
  })

  // Buffer the stream so we can send an explicit Content-Length. WhatsApp's
  // link-preview crawler often refuses images served with chunked transfer
  // encoding (no Content-Length), which silently kills the whole rich preview.
  const png = Buffer.from(await image.arrayBuffer())
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.byteLength),
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  })
}
