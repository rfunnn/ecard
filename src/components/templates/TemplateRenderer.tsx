import type { InvitationCardData } from "@/types/invitation"
import { WeddingTemplate } from "./WeddingTemplate"
import { BirthdayTemplate } from "./BirthdayTemplate"
import { CorporateTemplate } from "./CorporateTemplate"
import { GenericTemplate } from "./GenericTemplate"

interface Props { card: InvitationCardData; onRsvpOpen?: () => void }

export function TemplateRenderer({ card, onRsvpOpen }: Props) {
  switch (card.template.category) {
    case "WEDDING":   return <WeddingTemplate card={card} onRsvpOpen={onRsvpOpen} />
    case "BIRTHDAY":  return <BirthdayTemplate card={card} onRsvpOpen={onRsvpOpen} />
    case "CORPORATE": return <CorporateTemplate card={card} onRsvpOpen={onRsvpOpen} />
    default:          return <GenericTemplate card={card} onRsvpOpen={onRsvpOpen} />
  }
}
