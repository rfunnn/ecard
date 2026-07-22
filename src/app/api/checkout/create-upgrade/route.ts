import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { createToyyibpayBill } from "@/lib/toyyibpay"
import { rateLimit } from "@/lib/rate-limit"
import { getPackageTier } from "@/types/config"

// Prices in sen
const PACKAGE_PRICES_SEN: Record<string, number> = {
  bronze: 3000,
  silver: 4000,
  gold:   6000,
}

// Full packageType strings written back to wizardConfig
const PACKAGE_TYPE_LABEL: Record<string, string> = {
  silver: "Silver (RM40)",
  gold:   "Gold (RM60)",
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!rateLimit(`create-bill:${session.user.id}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Cuba lagi sebentar." }, { status: 429 })
  }

  const { cardSlug, targetPackage } = (await req.json()) as {
    cardSlug?: string
    targetPackage?: string
  }

  if (!cardSlug || !targetPackage) {
    return NextResponse.json({ error: "Missing cardSlug or targetPackage" }, { status: 400 })
  }

  const targetTier = targetPackage.toLowerCase()
  if (targetTier !== "silver" && targetTier !== "gold") {
    return NextResponse.json({ error: "Invalid target package" }, { status: 400 })
  }

  const card = await prisma.invitationCard.findUnique({
    where: { slug: cardSlug, userId: session.user.id, isPublished: true },
    select: { id: true, slug: true, title: true, groomName: true, wizardConfig: true },
  })
  if (!card) {
    return NextResponse.json({ error: "Card not found or not eligible for upgrade" }, { status: 404 })
  }

  const wc = card.wizardConfig as { packageType?: string } | null
  const currentTier = getPackageTier(wc?.packageType ?? "bronze")

  const currentPrice = PACKAGE_PRICES_SEN[currentTier] ?? 3000
  const targetPrice  = PACKAGE_PRICES_SEN[targetTier]  ?? 6000

  if (targetPrice <= currentPrice) {
    return NextResponse.json({ error: "Target package must be higher than current package" }, { status: 400 })
  }

  const upgradeAmount = targetPrice - currentPrice

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      totalAmount: upgradeAmount,
      items: {
        create: [{
          cardId:  card.id,
          package: `upgrade-${targetTier}`,
          amount:  upgradeAmount,
          addOns:  {},
        }],
      },
    },
  })

  const tierLabel    = targetTier === "gold" ? "Gold" : "Silver"
  const billName     = `ekadku.com - Naik Taraf ${card.groomName ?? card.title ?? "Kad"} ke ${tierLabel}`
  const baseUrl      = process.env.NEXTAUTH_URL
  if (!baseUrl) {
    return NextResponse.json({ error: "Server misconfiguration: NEXTAUTH_URL is not set" }, { status: 500 })
  }

  const callbackSecret = process.env.TOYYIBPAY_CALLBACK_SECRET
  const callbackUrl    = callbackSecret
    ? `${baseUrl}/api/checkout/callback?secret=${callbackSecret}`
    : `${baseUrl}/api/checkout/callback`

  try {
    const bill = await createToyyibpayBill({
      billName,
      billDescription: `Naik taraf pakej kad jemputan ke ${tierLabel}`,
      billAmount:      upgradeAmount,
      billReturnUrl:   `${baseUrl}/checkout/success?orderId=${order.id}`,
      billCallbackUrl: callbackUrl,
      billExternalReferenceNo: order.id,
      billTo:    "",
      billEmail: "",
      billPhone: "",
    })

    await prisma.order.update({
      where: { id: order.id },
      data:  { billCode: bill.billCode },
    })

    return NextResponse.json({
      paymentUrl:  bill.paymentUrl,
      orderId:     order.id,
      upgradeAmount,
      targetLabel: PACKAGE_TYPE_LABEL[targetTier],
    })
  } catch (err) {
    console.error("[create-upgrade] Toyyibpay error:", err instanceof Error ? err.message : String(err))
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
    return NextResponse.json({ error: "Failed to create payment bill. Please try again." }, { status: 500 })
  }
}
