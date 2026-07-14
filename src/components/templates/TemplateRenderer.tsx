import type { InvitationCardData } from "@/types/invitation"
import { WeddingTemplate } from "./WeddingTemplate"
import { BirthdayTemplate } from "./BirthdayTemplate"
import { CorporateTemplate } from "./CorporateTemplate"
import { GenericTemplate } from "./GenericTemplate"

interface Props { card: InvitationCardData; onRsvpOpen?: () => void; previewPage?: number }

export function TemplateRenderer({ card, onRsvpOpen, previewPage }: Props) {
  switch (card.template.category) {
    case "WEDDING":   return <WeddingTemplate card={card} onRsvpOpen={onRsvpOpen} previewPage={previewPage} />
    case "BIRTHDAY":  return <BirthdayTemplate card={card} onRsvpOpen={onRsvpOpen} previewPage={previewPage} />
    case "CORPORATE": return <CorporateTemplate card={card} onRsvpOpen={onRsvpOpen} previewPage={previewPage} />
    default:          return <GenericTemplate card={card} onRsvpOpen={onRsvpOpen} previewPage={previewPage} />
  }
}
