const BASE_URL = process.env.TOYYIBPAY_BASE_URL ?? "https://toyyibpay.com"

interface CreateBillParams {
  billName: string
  billDescription: string
  billAmount: number       // in sen (100 sen = RM1)
  billReturnUrl: string
  billCallbackUrl: string
  billExternalReferenceNo: string
  billTo?: string
  billEmail?: string
  billPhone?: string
}

interface CreateBillResult {
  billCode: string
  paymentUrl: string
}

export async function createToyyibpayBill(params: CreateBillParams): Promise<CreateBillResult> {
  const secretKey = process.env.TOYYIBPAY_SECRET_KEY
  const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE

  if (!secretKey || !categoryCode) {
    throw new Error("Toyyibpay credentials not configured (TOYYIBPAY_SECRET_KEY, TOYYIBPAY_CATEGORY_CODE)")
  }

  const body = new URLSearchParams({
    userSecretKey: secretKey,
    categoryCode,
    billName: params.billName.slice(0, 30),
    billDescription: params.billDescription.slice(0, 100),
    billPriceSetting: "0",       // fixed price
    billPayorInfo: "1",          // collect name/email/phone
    billAmount: String(params.billAmount),
    billReturnUrl: params.billReturnUrl,
    billCallbackUrl: params.billCallbackUrl,
    billExternalReferenceNo: params.billExternalReferenceNo,
    billTo: params.billTo ?? "",
    billEmail: params.billEmail ?? "",
    billPhone: params.billPhone ?? "",
    billSplitPayment: "0",
    billSplitPaymentArgs: "",
    billPaymentChannel: "0",     // FPX only
    billContentEmail: "",
    billChargeToCustomer: "0",   // merchant absorbs fee
    billExpiryDays: "1",
  })

  const res = await fetch(`${BASE_URL}/index.php/api/createBill`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) {
    throw new Error(`Toyyibpay API returned ${res.status}`)
  }

  const data = (await res.json()) as [{ BillCode: string }]
  const billCode = data[0]?.BillCode

  if (!billCode) {
    throw new Error("No BillCode in Toyyibpay response")
  }

  return { billCode, paymentUrl: `${BASE_URL}/${billCode}` }
}

export function parseToyyibpayCallback(body: string): {
  refno: string
  status: string
  billcode: string
  transactionId: string
  amount: string
} {
  const p = new URLSearchParams(body)
  return {
    refno: p.get("refno") ?? "",
    status: p.get("status") ?? "",
    billcode: p.get("billcode") ?? "",
    transactionId: p.get("transaction_id") ?? "",
    amount: p.get("amount") ?? "",
  }
}
