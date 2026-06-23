import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email(),
  password: z.string().min(8).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })
    if (existing) {
      return NextResponse.json({ error: "E-mel ini sudah didaftarkan" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name:  data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
      },
      select: { id: true, email: true, name: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Input tidak sah" }, { status: 400 })
    }
    return NextResponse.json({ error: "Pendaftaran gagal" }, { status: 500 })
  }
}
