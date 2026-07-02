import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import type { WizardConfig } from "@/types/config"
import { ReportClient } from "@/components/report/ReportClient"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard")

  const card = await prisma.invitationCard.findUnique({
    where: { slug, userId: session.user.id },
    select: {
      id: true, slug: true, title: true, isPublished: true,
      groomName: true, brideName: true, language: true,
      viewCount: true, wizardConfig: true,
      eventDate: true,
      theme: { select: { primaryColor: true, bgColor: true } },
    },
  })

  if (!card) return notFound()
  if (!card.isPublished) redirect("/dashboard")

  const [rsvps, analyticRows] = await Promise.all([
    prisma.rSVP.findMany({
      where: { cardId: card.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.cardAnalytic.groupBy({
      by: ["event"],
      where: { cardId: card.id },
      _count: true,
    }),
  ])

  const wCfg = card.wizardConfig as WizardConfig | null
  const displayName =
    card.groomName && card.brideName
      ? `${card.groomName} & ${card.brideName}`
      : wCfg?.displayName || card.title

  const eventDate = wCfg?.startDateTime
    ? new Date(wCfg.startDateTime).toLocaleDateString("en-MY", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : card.eventDate
    ? new Date(card.eventDate).toLocaleDateString("en-MY", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : null

  const attending    = rsvps.filter(r => r.attendance === "ATTENDING")
  const maybe        = rsvps.filter(r => r.attendance === "MAYBE")
  const notAttending = rsvps.filter(r => r.attendance === "NOT_ATTENDING")
  const totalGuests  = attending.reduce((s, r) => s + r.guestCount, 0)
                     + maybe.reduce((s, r) => s + r.guestCount, 0)

  const analytics: Record<string, number> = {}
  for (const row of analyticRows) analytics[row.event] = row._count

  const serialised = rsvps.map(r => ({
    id:         r.id,
    guestName:  r.guestName,
    attendance: r.attendance,
    guestCount: r.guestCount,
    message:    r.message ?? null,
    phone:      r.phone   ?? null,
    createdAt:  r.createdAt.toISOString(),
  }))

  return (
    <ReportClient
      slug={slug}
      displayName={displayName}
      eventDate={eventDate}
      primaryColor={card.theme?.primaryColor ?? "#D4AF37"}
      bgColor={card.theme?.bgColor ?? "#1a0a00"}
      language={card.language}
      viewCount={card.viewCount}
      rsvps={serialised}
      counts={{ attending: attending.length, maybe: maybe.length, notAttending: notAttending.length, totalGuests }}
      analytics={analytics}
    />
  )
}
