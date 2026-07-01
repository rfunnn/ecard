import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const cards = await prisma.invitationCard.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id:           true,
      slug:         true,
      title:        true,
      groomName:    true,
      brideName:    true,
      isPublished:  true,
      language:     true,
      viewCount:    true,
      updatedAt:    true,
      createdAt:    true,
      eventDate:    true,
      wizardConfig: true,
      template:     { select: { name: true, nameMs: true, category: true, image1Url: true } },
      theme:        { select: { primaryColor: true, bgColor: true } },
    },
  })

  return NextResponse.json({ cards })
}
