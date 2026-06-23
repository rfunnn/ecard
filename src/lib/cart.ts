const CART_KEY = "kad_my_cards"

export function getCartSlugs(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export function addToCart(slug: string) {
  if (typeof window === "undefined") return
  try {
    const slugs = getCartSlugs().filter((s) => s !== slug)
    slugs.unshift(slug)
    localStorage.setItem(CART_KEY, JSON.stringify(slugs.slice(0, 20)))
  } catch {}
}

export function removeFromCart(slug: string) {
  if (typeof window === "undefined") return
  try {
    const slugs = getCartSlugs().filter((s) => s !== slug)
    localStorage.setItem(CART_KEY, JSON.stringify(slugs))
  } catch {}
}

export function getCartCount(): number {
  return getCartSlugs().length
}
