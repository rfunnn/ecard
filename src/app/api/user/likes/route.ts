import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"

async function getSession() {
  return getServerSession(authOptions)
}

// GET — list all liked template IDs for current user
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const likes = await prisma.userLike.findMany({
    where: { userId: session.user.id },
    include: {
      template: {
        select: {
          id: true, slug: true, name: true, nameMs: true,
          category: true, thumbnail: true, previewUrl: true,
          image1Url: true,
          defaultConfig: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ likes: likes.map((l) => l.template) })
}

// POST — like a template
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 60 likes per user per hour
  if (!rateLimit(`likes:${session.user.id}`, 60, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Terlalu banyak percubaan. Cuba lagi selepas 1 jam." }, { status: 429 })
  }

  const { templateId } = z.object({ templateId: z.string() }).parse(await req.json())

  await prisma.userLike.upsert({
    where: { userId_templateId: { userId: session.user.id, templateId } },
    create: { userId: session.user.id, templateId },
    update: {},
  })

  return NextResponse.json({ ok: true })
}

// DELETE — unlike (templateId in body)
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { templateId } = z.object({ templateId: z.string() }).parse(await req.json())

  await prisma.userLike.deleteMany({
    where: { userId: session.user.id, templateId },
  })

  return NextResponse.json({ ok: true })
}
