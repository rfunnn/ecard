import type { WizardConfig } from "@/types/config"

export type OgCardCore = {
  title: string
  groomName: string | null
  brideName: string | null
  wizardConfig: unknown
  template: { category: string } | null
} | null

const EVENT_TYPE_BY_CATEGORY: Record<string, string> = {
  WEDDING: "Walimatul Urus",
  BIRTHDAY: "Jemputan Hari Lahir",
  CORPORATE: "Majlis Korporat",
}

export function deriveOgText(card: OgCardCore) {
  const wc = card?.wizardConfig as WizardConfig | undefined

  const rawName = wc?.displayName ||
    (card?.groomName && card?.brideName
      ? `${card.groomName} & ${card.brideName}`
      : card?.title ?? "Kad Jemputan")
  const displayName = rawName.replace(/\n/g, " ")

  const eventType =
    wc?.eventType ||
    (card?.template?.category && EVENT_TYPE_BY_CATEGORY[card.template.category]) ||
    "Jemputan Digital"

  const dayAndDateRaw = wc?.dayAndDate ?? ""

  return { displayName, eventType, dayAndDateRaw }
}
