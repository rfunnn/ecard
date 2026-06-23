import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function uniqueSlug(base: string): Promise<string> {
  const existing = await prisma.template.findUnique({ where: { slug: base }, select: { id: true } })
  if (!existing) return base
  const suffix = randomBytes(3).toString("hex")
  return `${base}-${suffix}`
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  nameMs: z.string().default(""),
  slug: z.string().optional(),
  category: z.enum(["WEDDING", "BIRTHDAY", "CORPORATE", "GENERIC"]).default("WEDDING"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  image1Url: z.string().optional(),
  image2Url: z.string().optional(),
  displayConfig: z.record(z.string(), z.unknown()).optional().nullable(),
})

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    })
    return NextResponse.json({ templates })
  } catch {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const slugBase = data.slug ? data.slug : nameToSlug(data.name) || "template"
    const slug = await uniqueSlug(slugBase)

    const nameCheck = await prisma.template.findFirst({
      where: { name: data.name },
      select: { id: true },
    })
    if (nameCheck) {
      return NextResponse.json({ error: "Template name already exists" }, { status: 409 })
    }

    const template = await prisma.template.create({
      data: {
        name: data.name,
        nameMs: data.nameMs || data.name,
        slug,
        category: data.category as never,
        thumbnail: data.image1Url ?? "",
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        defaultConfig: {} as Prisma.InputJsonValue,
        image1Url: data.image1Url,
        image2Url: data.image2Url,
        displayConfig: data.displayConfig ? (data.displayConfig as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
