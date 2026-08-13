// In-memory pub/sub for RSVP wish events.
// Works correctly in a single-process Docker deployment.
// If ever scaled to multiple instances, replace with Redis pub/sub.

export type WishEvent = {
  id: string
  guestName: string
  message: string
  createdAt: string
}

type Callback = (wish: WishEvent) => void

const subs = new Map<string, Set<Callback>>()

export function subscribeWish(cardId: string, cb: Callback): () => void {
  if (!subs.has(cardId)) subs.set(cardId, new Set())
  subs.get(cardId)!.add(cb)
  return () => {
    const s = subs.get(cardId)
    if (!s) return
    s.delete(cb)
    if (s.size === 0) subs.delete(cardId)
  }
}

export function publishWish(cardId: string, wish: WishEvent): void {
  subs.get(cardId)?.forEach((cb) => {
    try { cb(wish) } catch {}
  })
}
