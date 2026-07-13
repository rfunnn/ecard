import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rewriteStorageUrl } from "@/lib/storage"

export const revalidate = 3600 // re-fetch templates from DB at most once per hour

export async function GET() {
  try {
    const rows = await prisma.template.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        nameMs: true,
        category: true,
        thumbnail: true,
        previewUrl: true,
        image1Url: true,
        image2Url: true,
        defaultConfig: true,
      },
    })

    const templates = rows.map((t) => {
      const img1 = rewriteStorageUrl(t.image1Url)
      const img2 = rewriteStorageUrl(t.image2Url)
      return {
        ...t,
        // image1Url is the authoritative uploaded image; fall back to legacy thumbnail
        thumbnail: img1 || rewriteStorageUrl(t.thumbnail) || "",
        image1Url: img1,
        image2Url: img2,
      }
    })

    return NextResponse.json({ templates })
  } catch (e) {
    console.error("[/api/templates]", e)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}
