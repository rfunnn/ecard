import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
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
    return NextResponse.json({ templates })
  } catch (e) {
    console.error("[/api/templates]", e)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}
