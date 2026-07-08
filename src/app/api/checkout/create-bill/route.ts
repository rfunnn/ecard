import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { createToyyibpayBill } from "@/lib/toyyibpay"

// Prices in sen (100 sen = RM1)
const PACKAGE_PRICES: Record<string, number> = {
  bronze: 3000,
  silver: 4000,
  gold:   6000,
}

function packageAmount(packageType: string): number {
  const key = packageType.split("(")[0].trim().toLowerCase()
  return PACKAGE_PRICES[key] ?? 3000
}

interface WizardConfigSlice {
  packageType?: string
  addOnCustomDesign?: boolean
  addOnCoverVideo?: boolean
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { cardSlugs } = (await req.json()) as { cardSlugs: string[] }
  if (!Array.isArray(cardSlugs) || cardSlugs.length === 0) {
    return NextResponse.json({ error: "No cards provided" }, { status: 400 })
  }

  // Fetch only unpublished cards that belong to this user
  const cards = await prisma.invitationCard.findMany({
    where: {
      slug: { in: cardSlugs },
      userId: session.user.id,
      isPublished: false,
    },
    select: { id: true, slug: true, title: true, groomName: true, wizardConfig: true },
  })

  if (cards.length === 0) {
    return NextResponse.json({ error: "No unpublished cards found" }, { status: 400 })
  }

  // Build order items with prices
  const items = cards.map((card) => {
    const wc = (card.wizardConfig ?? {}) as WizardConfigSlice
    const base = packageAmount(wc.packageType ?? "Bronze")
    const addOnAmount =
      (wc.addOnCustomDesign ? 1000 : 0) +
      (wc.addOnCoverVideo  ? 1000 : 0)
    return {
      cardId: card.id,
      package: (wc.packageType ?? "Bronze").split("(")[0].trim(),
      amount: base + addOnAmount,
      addOns: {
        customDesign: wc.addOnCustomDesign ?? false,
        coverVideo:   wc.addOnCoverVideo  ?? false,
      },
    }
  })

  const totalAmount = items.reduce((s, i) => s + i.amount, 0)

  // Create order record first
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      totalAmount,
      items: {
        create: items.map((i) => ({
          cardId:  i.cardId,
          package: i.package,
          amount:  i.amount,
          addOns:  i.addOns,
        })),
      },
    },
  })

  const billName = `ekadku.com - ${cards[0].groomName ?? cards[0].title ?? "Pelanggan"}`
  const billDesc = `${cards.length} kad jemputan digital`
  const baseUrl = process.env.NEXTAUTH_URL
  if (!baseUrl) {
    return NextResponse.json({ error: "Server misconfiguration: NEXTAUTH_URL is not set" }, { status: 500 })
  }

  try {
    const bill = await createToyyibpayBill({
      billName,
      billDescription: billDesc,
      billAmount: totalAmount,
      billReturnUrl:  `${baseUrl}/checkout/success?orderId=${order.id}`,
      billCallbackUrl: `${baseUrl}/api/checkout/callback`,
      billExternalReferenceNo: order.id,
      billTo:    session.user.name ?? undefined,
      billEmail: "ar.worldwide.biz@gmail.com",
      billPhone: "0129190025",
    })

    await prisma.order.update({
      where: { id: order.id },
      data:  { billCode: bill.billCode },
    })

    return NextResponse.json({ paymentUrl: bill.paymentUrl, orderId: order.id })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error("[create-bill] Toyyibpay error:", detail)
    // Roll back the order so the user can retry
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
    return NextResponse.json({ error: "Failed to create payment bill. Please try again.", detail }, { status: 500 })
  }
}
