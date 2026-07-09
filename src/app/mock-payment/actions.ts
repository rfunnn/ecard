"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { fulfillPaidOrder } from "@/lib/checkout-fulfillment"
import { setMockBillStatus } from "@/lib/toyyibpay"

function assertMockMode() {
  if (process.env.TOYYIBPAY_MOCK !== "true") {
    throw new Error("Mock payment actions require TOYYIBPAY_MOCK=true")
  }
}

export async function simulateSuccess(formData: FormData) {
  assertMockMode()
  const billCode  = formData.get("billCode")  as string
  const orderId   = formData.get("orderId")   as string
  const returnUrl = formData.get("returnUrl") as string
  setMockBillStatus(billCode, "paid")
  await fulfillPaidOrder(orderId, billCode)
  redirect(returnUrl)
}

export async function simulateFailure(formData: FormData) {
  assertMockMode()
  const orderId   = formData.get("orderId")   as string
  const returnUrl = formData.get("returnUrl") as string
  await prisma.order.update({ where: { id: orderId }, data: { status: "FAILED" } })
  redirect(returnUrl)
}

// Redirects to the return URL without touching the order — leaves it PENDING.
// Tests the "payment still processing / timed-out" branch on the success page.
export async function simulatePending(formData: FormData) {
  assertMockMode()
  const returnUrl = formData.get("returnUrl") as string
  redirect(returnUrl)
}
