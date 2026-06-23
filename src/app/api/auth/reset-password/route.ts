import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json())

    const record = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!record || record.used || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Pautan ini tidak sah atau telah tamat tempoh." },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.email },
        data:  { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data:  { used: true },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Gagal menetapkan semula kata laluan" }, { status: 500 })
  }
}
