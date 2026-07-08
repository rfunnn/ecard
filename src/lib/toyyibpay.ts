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

// ToyyibPay allows only alphanumeric characters, spaces and underscores in
// billName / billDescription. Anything else (e.g. "." or "-") makes createBill
// fail, so strip disallowed characters and collapse repeated whitespace.
function sanitizeBillText(text: string, maxLen: number): string {
  return text
    .replace(/[^a-zA-Z0-9 _]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen)
}

export async function createToyyibpayBill(params: CreateBillParams): Promise<CreateBillResult> {
  const secretKey = process.env.TOYYIBPAY_SECRET_KEY
  const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE

  if (!secretKey || !categoryCode) {
    throw new Error("Toyyibpay credentials not configured (TOYYIBPAY_SECRET_KEY, TOYYIBPAY_CATEGORY_CODE)")
  }

  const billName = sanitizeBillText(params.billName, 30) || "Pembayaran"
  const billDescription = sanitizeBillText(params.billDescription, 100) || "Pembayaran kad"

  const body = new URLSearchParams({
    userSecretKey: secretKey,
    categoryCode,
    billName,
    billDescription,
    billPriceSetting: "1",       // 1 = fixed amount (use billAmount); 0 = payer enters amount
    billPayorInfo: "0",          // do not collect/display payor info on payment page
    billAmount: String(params.billAmount),
    billReturnUrl: params.billReturnUrl,
    billCallbackUrl: params.billCallbackUrl,
    billExternalReferenceNo: params.billExternalReferenceNo,
    billTo:    params.billTo    ?? "",
    billEmail: params.billEmail ?? "",
    billPhone: params.billPhone ?? "",
    billSplitPayment: "0",
    billSplitPaymentArgs: "",
    billPaymentChannel: "0",     // 0 = FPX only (safest — works on all account types)
    billContentEmail: "",
    billChargeToCustomer: "1",   // 1 = customer pays fee (default; "0" requires fee-absorption plan)
  })

  const res = await fetch(`${BASE_URL}/index.php/api/createBill`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) {
    throw new Error(`Toyyibpay API returned ${res.status}`)
  }

  // Success: [{ "BillCode": "xxxxxxxx" }]
  // Error:   [{ "status": "error", "msg": "..." }]  (or a bare object / string)
  const data: unknown = await res.json().catch(() => null)
  const first = Array.isArray(data) ? data[0] : data
  const billCode =
    first && typeof first === "object" && "BillCode" in first
      ? String((first as { BillCode: unknown }).BillCode)
      : ""

  if (!billCode) {
    const msg =
      first && typeof first === "object" && "msg" in first
        ? String((first as { msg: unknown }).msg)
        : "No BillCode in Toyyibpay response"
    throw new Error(`Toyyibpay createBill failed: ${msg}`)
  }

  return { billCode, paymentUrl: `${BASE_URL}/${billCode}` }
}

// ToyyibPay posts these fields to the callback URL after a payment attempt.
// `order_id` echoes the billExternalReferenceNo we set (our Order.id).
// `refno` is ToyyibPay's own payment reference — do NOT use it as the order id.
export function parseToyyibpayCallback(body: string): {
  orderId: string
  refno: string
  status: string
  billcode: string
  transactionId: string
  amount: string
} {
  const p = new URLSearchParams(body)
  return {
    orderId: p.get("order_id") ?? "",
    refno: p.get("refno") ?? "",
    // The server callback sends `status`; some variants/return-url flows send
    // `status_id`. Accept either so success is never missed (1=success,2=pending,3=fail).
    status: p.get("status") ?? p.get("status_id") ?? "",
    billcode: p.get("billcode") ?? "",
    transactionId: p.get("transaction_id") ?? "",
    amount: p.get("amount") ?? "",
  }
}

interface BillTransaction {
  billpaymentStatus?: string   // "1" success, "2" pending, "3" unsuccessful, "4" pending
  billpaymentAmount?: string
  billpaymentInvoiceNo?: string
  billExternalReferenceNo?: string
}

// Server-to-server lookup of a bill's transactions. Used to verify a payment
// really succeeded rather than trusting the (spoofable) callback body.
export async function getToyyibpayBillTransactions(billCode: string): Promise<BillTransaction[]> {
  if (!billCode) return []

  const body = new URLSearchParams({ billCode })
  const secretKey = process.env.TOYYIBPAY_SECRET_KEY
  if (secretKey) body.set("userSecretKey", secretKey)

  const res = await fetch(`${BASE_URL}/index.php/api/getBillTransactions`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) {
    throw new Error(`Toyyibpay getBillTransactions returned ${res.status}`)
  }

  const data: unknown = await res.json().catch(() => null)
  return Array.isArray(data) ? (data as BillTransaction[]) : []
}

// Authoritative check that a bill has at least one successful transaction.
export async function verifyToyyibpayBillPaid(billCode: string): Promise<boolean> {
  try {
    const txns = await getToyyibpayBillTransactions(billCode)
    return txns.some((t) => t.billpaymentStatus === "1")
  } catch {
    // Network/API error — treat as "not verified" so we never publish on doubt.
    return false
  }
}
