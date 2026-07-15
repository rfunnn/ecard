import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  name:            z.string().min(2).max(80).optional(),
  currentPassword: z.string().optional(),
  newPassword:     z.string().min(8).max(100).optional(),
}).refine(
  (d) => !d.newPassword || !!d.currentPassword,
  { message: "Kata laluan semasa diperlukan", path: ["currentPassword"] }
)

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    })
    if (!user) return NextResponse.json({ error: "Pengguna tidak dijumpai" }, { status: 404 })

    if (data.newPassword) {
      if (!user.passwordHash) {
        return NextResponse.json({ error: "Akaun ini menggunakan log masuk Google — kata laluan tidak boleh ditetapkan di sini" }, { status: 400 })
      }
      const match = await bcrypt.compare(data.currentPassword!, user.passwordHash)
      if (!match) {
        return NextResponse.json({ error: "Kata laluan semasa tidak betul" }, { status: 400 })
      }
    }

    const updates: { name?: string; passwordHash?: string } = {}
    if (data.name)        updates.name = data.name.trim()
    if (data.newPassword) updates.passwordHash = await bcrypt.hash(data.newPassword, 12)

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Tiada perubahan" })
    }

    await prisma.user.update({ where: { id: user.id }, data: updates })
    return NextResponse.json({ message: "Profil dikemas kini" })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Input tidak sah" }, { status: 400 })
    }
    return NextResponse.json({ error: "Gagal mengemas kini profil" }, { status: 500 })
  }
}
