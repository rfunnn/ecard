import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { generatePartnerSlug, RESERVED_PARTNER_SLUGS } from "@/lib/slug"
import { sendPartnerRegistrationEmail } from "@/lib/email"
import { rateLimit, rateLimitKey } from "@/lib/rate-limit"

const BUSINESS_TYPES = ["BUSINESS_CARD", "EVENT_SPACE", "EVENT_PLANNER", "VENDOR", "OTHERS"] as const

const schema = z.object({
  companyName:        z.string().min(2).max(120),
  contactPerson:      z.string().min(2).max(80),
  phone:              z.string().min(7).max(20).regex(/^[+\d\s()-]+$/, "Nombor telefon tidak sah"),
  email:              z.string().email(),
  businessType:       z.enum(BUSINESS_TYPES),
  registrationNumber: z.string().max(40).optional(),
  address:            z.string().max(300).optional(),
  website:            z.string().url().optional().or(z.literal("")),
  instagram:          z.string().max(60).optional(),
  facebook:           z.string().max(80).optional(),
  logo:               z.string().url().optional().or(z.literal("")),
})

async function findUniqueSlug(base: string): Promise<string> {
  const candidate = RESERVED_PARTNER_SLUGS.has(base) ? `${base}-partner` : base
  const existing = await prisma.partner.findUnique({ where: { slug: candidate }, select: { id: true } })
  if (!existing) return candidate

  for (let i = 2; i <= 99; i++) {
    const numbered = `${candidate}-${i}`
    const conflict = await prisma.partner.findUnique({ where: { slug: numbered }, select: { id: true } })
    if (!conflict) return numbered
  }
  return `${candidate}-${Date.now()}`
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development" && !rateLimit(rateLimitKey(req, "partner-register"), 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Terlalu banyak percubaan. Cuba lagi selepas 1 jam." }, { status: 429 })
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const emailLower = data.email.toLowerCase().trim()

    const existingPartner = await prisma.partner.findUnique({ where: { email: emailLower } })
    if (existingPartner) {
      return NextResponse.json({ error: "E-mel ini telah didaftarkan sebagai Partner." }, { status: 409 })
    }

    const baseSlug = generatePartnerSlug(data.companyName)
    const slug = await findUniqueSlug(baseSlug)

    const partner = await prisma.partner.create({
      data: {
        slug,
        companyName:        data.companyName.trim(),
        contactPerson:      data.contactPerson.trim(),
        email:              emailLower,
        phone:              data.phone.trim(),
        businessType:       data.businessType,
        registrationNumber: data.registrationNumber?.trim() || null,
        address:            data.address?.trim() || null,
        website:            data.website?.trim() || null,
        instagram:          data.instagram?.trim() || null,
        facebook:           data.facebook?.trim() || null,
        logo:               data.logo?.trim() || null,
      },
      select: {
        id: true,
        slug: true,
        companyName: true,
        businessType: true,
        status: true,
      },
    })

    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "ekadku.com"
    sendPartnerRegistrationEmail({
      companyName:   partner.companyName,
      contactPerson: data.contactPerson.trim(),
      email:         emailLower,
      businessType:  partner.businessType,
      slug:          partner.slug,
      baseDomain,
    }).catch((err) => console.error("[email] Partner registration email failed:", err))

    return NextResponse.json({ partner }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Input tidak sah" }, { status: 400 })
    }
    console.error("[partner/register] Failed:", err)
    return NextResponse.json({ error: "Pendaftaran gagal. Sila cuba lagi." }, { status: 500 })
  }
}
