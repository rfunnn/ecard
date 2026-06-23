"use client"

import { useState, useEffect } from "react"
import { ShoppingBag } from "lucide-react"
import { CartDrawer } from "@/components/CartDrawer"
import { getCartCount } from "@/lib/cart"

export function NavCartButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(getCartCount())
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-1.5 text-[var(--tx-2)] hover:text-[var(--tx-1)] text-sm transition-colors px-3 py-2"
      >
        <ShoppingBag className="w-4 h-4" />
        <span className="hidden sm:inline">Kad Saya</span>
        {count > 0 && (
          <span className="absolute -top-0.5 right-0 sm:static sm:ml-0.5 min-w-[18px] h-[18px] text-[10px] bg-gold text-ink rounded-full flex items-center justify-center px-1 font-bold leading-none">
            {count}
          </span>
        )}
      </button>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
