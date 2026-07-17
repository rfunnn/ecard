import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildOgImage } from "@/lib/og-card"

export const runtime = "nodejs"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Accept both numeric cardNum and slug
  const num = parseInt(slug, 10)
  const where = !isNaN(num) && String(num) === slug ? { cardNum: num } : { slug }

  const card = await prisma.invitationCard.findUnique({
    where,
    select: {
      title: true,
      groomName: true,
      brideName: true,
      wizardConfig: true,
      template: { select: { category: true, image1Url: true } },
      theme: { select: { primaryColor: true, bgColor: true } },
    },
  })

  return new ImageResponse(buildOgImage(card), {
    width: 1200,
    height: 630,
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  })
}
