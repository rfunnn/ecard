import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { createToyyibpayBill } from "@/lib/toyyibpay"
import { rateLimit } from "@/lib/rate-limit"

const RENEWAL_AMOUNT = 2000 // RM20 in sen

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!rateLimit(`create-bill:${session.user.id}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Cuba lagi sebentar." }, { status: 429 })
  }

  const { cardSlug } = (await req.json()) as { cardSlug?: string }
  if (!cardSlug) {
    return NextResponse.json({ error: "No card provided" }, { status: 400 })
  }

  const card = await prisma.invitationCard.findUnique({
    where: { slug: cardSlug, userId: session.user.id, isPublished: true },
    select: { id: true, slug: true, title: true, groomName: true, expiresAt: true },
  })

  if (!card) {
    return NextResponse.json({ error: "Card not found or not eligible for renewal" }, { status: 404 })
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      totalAmount: RENEWAL_AMOUNT,
      items: {
        create: [{
          cardId: card.id,
          package: "renewal",
          amount: RENEWAL_AMOUNT,
          addOns: {},
        }],
      },
    },
  })

  const billName = `ekadku.com - Perbaharui ${card.groomName ?? card.title ?? "Kad"}`
  const baseUrl = process.env.NEXTAUTH_URL
  if (!baseUrl) {
    return NextResponse.json({ error: "Server misconfiguration: NEXTAUTH_URL is not set" }, { status: 500 })
  }

  const callbackSecret = process.env.TOYYIBPAY_CALLBACK_SECRET
  const callbackUrl = callbackSecret
    ? `${baseUrl}/api/checkout/callback?secret=${callbackSecret}`
    : `${baseUrl}/api/checkout/callback`

  try {
    const bill = await createToyyibpayBill({
      billName,
      billDescription: "Perbaharui pautan kad jemputan digital (6 bulan)",
      billAmount: RENEWAL_AMOUNT,
      billReturnUrl: `${baseUrl}/checkout/success?orderId=${order.id}`,
      billCallbackUrl: callbackUrl,
      billExternalReferenceNo: order.id,
      billTo: "",
      billEmail: "",
      billPhone: "",
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { billCode: bill.billCode },
    })

    return NextResponse.json({ paymentUrl: bill.paymentUrl, orderId: order.id })
  } catch (err) {
    console.error("[create-renewal] Toyyibpay error:", err instanceof Error ? err.message : String(err))
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
    return NextResponse.json({ error: "Failed to create payment bill. Please try again." }, { status: 500 })
  }
}
