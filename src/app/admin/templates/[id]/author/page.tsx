import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { rewriteStorageUrl } from "@/lib/storage"
import { WizardShell } from "@/components/wizard/WizardShell"
import type { InvitationCardData } from "@/types/invitation"
import { DEFAULT_THEME, DEFAULT_MEDIA, DEFAULT_SCROLL } from "@/types/invitation"
import type { AuthoredInvite } from "@/types/template-admin"
import {
  buildDemoWizardConfig,
  DEMO_GIFT_ITEMS,
  DEMO_YOUTUBE_URL,
  DEMO_YOUTUBE_VIDEO_ID,
} from "@/lib/demo-wizard-config"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

// Admin invite authoring. Renders the real builder (WizardShell) in authoring
// mode against the template's stored `defaultConfig.authored` payload (or the
// demo invite as a starting point for a fresh template). Saving writes back to
// the template; new user cards are seeded from it (see POST /api/cards).
export default async function AuthorTemplatePage({ params }: Props) {
  const { id } = await params
  const template = await prisma.template.findUnique({ where: { id } })
  if (!template) return notFound()

  const dc = (template.defaultConfig as Record<string, unknown> | null) ?? {}
  const authored = dc.authored as AuthoredInvite | undefined

  const wizardConfig = authored?.wizardConfig ?? buildDemoWizardConfig(
    (dc.primaryColor as string) ?? "#9b4d5e",
    (dc.bgColor as string) ?? "#faf7f4",
    dc.titleFont as string | undefined,
    template.slug,
  )

  const theme  = { ...DEFAULT_THEME, ...(authored?.theme ?? {}) }
  const media  = authored?.media
    ? { ...DEFAULT_MEDIA, ...authored.media }
    : { ...DEFAULT_MEDIA, youtubeUrl: DEMO_YOUTUBE_URL, youtubeVideoId: DEMO_YOUTUBE_VIDEO_ID }
  const scrollConfig = { ...DEFAULT_SCROLL, ...(authored?.scrollConfig ?? {}) }

  const giftItems = (authored?.giftItems ?? DEMO_GIFT_ITEMS).map((g, i) => ({
    id: `tpl-gift-${i}`,
    imageUrl: g.imageUrl,
    link: g.link,
    label: g.label,
    sortOrder: g.sortOrder ?? i,
  }))
  const photoItems = (authored?.photoItems ?? []).map((p, i) => ({
    id: `tpl-photo-${i}`,
    imageUrl: p.imageUrl,
    caption: p.caption,
    sortOrder: p.sortOrder ?? i,
  }))

  const initialCard: InvitationCardData = {
    id: template.id,
    slug: `tpl-${template.id}`,
    templateId: template.id,
    title: wizardConfig.displayName || template.name,
    isPublished: false,
    language: wizardConfig.language,
    viewCount: 0,
    template: {
      slug: template.slug,
      name: template.name,
      category: template.category as InvitationCardData["template"]["category"],
      image1Url: rewriteStorageUrl(template.image1Url) || null,
      image2Url: rewriteStorageUrl(template.image2Url) || null,
    },
    theme,
    media,
    scrollConfig,
    wizardConfig,
    giftItems,
    photoItems,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  }

  // Overlay the full-screen builder above the admin chrome.
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <WizardShell initialCard={initialCard} authoring={{ templateId: template.id }} />
    </div>
  )
}
