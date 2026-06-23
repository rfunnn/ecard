import type { InvitationCardData } from "@/types/invitation"
import { WeddingTemplate } from "./WeddingTemplate"
import { BirthdayTemplate } from "./BirthdayTemplate"
import { CorporateTemplate } from "./CorporateTemplate"
import { GenericTemplate } from "./GenericTemplate"

interface Props { card: InvitationCardData }

export function TemplateRenderer({ card }: Props) {
  switch (card.template.category) {
    case "WEDDING":   return <WeddingTemplate card={card} />
    case "BIRTHDAY":  return <BirthdayTemplate card={card} />
    case "CORPORATE": return <CorporateTemplate card={card} />
    default:          return <GenericTemplate card={card} />
  }
}
