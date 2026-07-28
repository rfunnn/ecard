import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)

async function assertAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return null
  }
  return session
}

export async function GET() {
  if (!await assertAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [config, templates] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: "default" } }),
    prisma.template.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, name: true, nameMs: true, category: true, thumbnail: true, image1Url: true, image2Url: true, defaultConfig: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ])

  return NextResponse.json({
    config: config ?? { id: "default", demoSlug1: "wedding-classic", demoSlug2: "wedding-classic" },
    templates,
  })
}

export async function PUT(req: Request) {
  if (!await assertAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const demoSlug1 = String(body.demoSlug1 ?? "").trim()
  const demoSlug2 = String(body.demoSlug2 ?? "").trim()

  if (!demoSlug1 || !demoSlug2) {
    return NextResponse.json({ error: "Both template slugs are required" }, { status: 400 })
  }

  const config = await prisma.siteConfig.upsert({
    where: { id: "default" },
    create: { id: "default", demoSlug1, demoSlug2 },
    update: { demoSlug1, demoSlug2 },
  })

  return NextResponse.json({ config })
}
