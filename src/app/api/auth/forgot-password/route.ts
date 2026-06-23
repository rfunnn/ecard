import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json())
    const normalised = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({ where: { email: normalised } })

    // Always respond 200 — don't reveal whether email is registered
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    // Invalidate any previous unused tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email: normalised, used: false },
      data: { used: true },
    })

    const token     = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: { email: normalised, token, expiresAt },
    })

    await sendPasswordResetEmail(normalised, token)

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Gagal menghantar e-mel" }, { status: 500 })
  }
}
