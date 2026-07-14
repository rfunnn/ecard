import type { RefObject } from "react"
import type { InvitationCardData } from "@/types/invitation"
import { WeddingTemplate } from "./WeddingTemplate"
import { BirthdayTemplate } from "./BirthdayTemplate"
import { CorporateTemplate } from "./CorporateTemplate"
import { GenericTemplate } from "./GenericTemplate"

interface Props {
  card: InvitationCardData
  onRsvpOpen?: () => void
  previewPage?: number
  revealed?: boolean
  scrollContainerRef?: RefObject<HTMLDivElement | null>
}

export function TemplateRenderer({ card, onRsvpOpen, previewPage, revealed, scrollContainerRef }: Props) {
  switch (card.template.category) {
    case "WEDDING":   return <WeddingTemplate card={card} onRsvpOpen={onRsvpOpen} previewPage={previewPage} revealed={revealed} scrollContainerRef={scrollContainerRef} />
    case "BIRTHDAY":  return <BirthdayTemplate card={card} onRsvpOpen={onRsvpOpen} previewPage={previewPage} revealed={revealed} />
    case "CORPORATE": return <CorporateTemplate card={card} onRsvpOpen={onRsvpOpen} previewPage={previewPage} revealed={revealed} />
    default:          return <GenericTemplate card={card} onRsvpOpen={onRsvpOpen} previewPage={previewPage} revealed={revealed} />
  }
}
