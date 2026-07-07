// Payment options available through ToyyibPay for this integration.
// createBill uses billPaymentChannel="2", which enables FPX online banking plus
// credit/debit cards. The payer picks the exact method on ToyyibPay's page.

export interface PaymentMethod {
  key: string
  labelMs: string
  descriptionMs: string
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    key: "fpx",
    labelMs: "Perbankan Internet (FPX)",
    descriptionMs: "Bayar terus dari akaun bank anda",
  },
  {
    key: "card",
    labelMs: "Kad Kredit / Debit",
    descriptionMs: "Visa & Mastercard",
  },
]

// FPX participating banks for personal/B2C online banking (via PayNet).
// ToyyibPay supports every FPX bank; the payer selects theirs on the hosted
// ToyyibPay page, so this list is for display/reassurance only.
export const FPX_BANKS: string[] = [
  "Affin Bank",
  "Agrobank",
  "Alliance Bank",
  "AmBank",
  "Bank Islam",
  "Bank Muamalat",
  "Bank Rakyat",
  "Bank Simpanan Nasional (BSN)",
  "CIMB Bank",
  "Hong Leong Bank",
  "HSBC Bank",
  "Kuwait Finance House",
  "Maybank",
  "MBSB Bank",
  "OCBC Bank",
  "Public Bank",
  "RHB Bank",
  "Standard Chartered",
  "UOB Bank",
]
