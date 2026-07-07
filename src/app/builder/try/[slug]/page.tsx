import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

import { WizardShell } from "@/components/wizard/WizardShell"
import type { InvitationCardData } from "@/types/invitation"
import { DEFAULT_THEME, DEFAULT_MEDIA, DEFAULT_SCROLL } from "@/types/invitation"
import {
  buildDemoWizardConfig,
  DEMO_GIFT_ITEMS,
  DEMO_YOUTUBE_URL,
  DEMO_YOUTUBE_VIDEO_ID,
} from "@/lib/demo-wizard-config"

interface Props {
  params: Promise<{ slug: string }>
}

// Guest "try before you sign up" builder. Requires no auth and writes nothing
// to the database — the card is rebuilt from the template on every request, so
// a full page refresh discards any edits the guest made. They must register to
// persist a card (handled by WizardShell's `guest` mode).
export default async function TryBuilderRoute({ params }: Props) {
  const { slug } = await params

  const template = await prisma.template.findFirst({
    where: { slug, isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      image1Url: true,
      image2Url: true,
      defaultConfig: true,
    },
  })
  if (!template) return notFound()

  const tmplCfg = (template.defaultConfig ?? {}) as {
    primaryColor?: string
    bgColor?: string
    titleFont?: string
  }
  const primary = tmplCfg.primaryColor ?? "#9b4d5e"
  const bg = tmplCfg.bgColor ?? "#faf7f4"

  const wizardConfig = buildDemoWizardConfig(primary, bg, tmplCfg.titleFont, template.slug)

  const card: InvitationCardData = {
    id: "guest",
    // Synthetic per-template slug — never hits the API (guest save is disabled).
    slug: `try-${template.slug}`,
    templateId: template.id,
    title: wizardConfig.displayName,
    isPublished: false,
    language: "ms",
    viewCount: 0,
    template: {
      slug: template.slug,
      name: template.name,
      category: template.category as InvitationCardData["template"]["category"],
      image1Url: template.image1Url ?? null,
      image2Url: template.image2Url ?? null,
    },
    theme: {
      ...DEFAULT_THEME,
      primaryColor: primary,
      accentColor: primary,
      titleColor: primary,
      bodyColor: primary,
      bgColor: bg,
      titleFont: tmplCfg.titleFont ?? DEFAULT_THEME.titleFont,
      bgOpacity: 0,
    },
    media: {
      ...DEFAULT_MEDIA,
      youtubeUrl: DEMO_YOUTUBE_URL,
      youtubeVideoId: DEMO_YOUTUBE_VIDEO_ID,
    },
    scrollConfig: { ...DEFAULT_SCROLL, autoScroll: true },
    wizardConfig,
    giftItems: DEMO_GIFT_ITEMS.map((g, i) => ({ id: `demo-gift-${i}`, ...g })),
    photoItems: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return <WizardShell initialCard={card} guest />
}
