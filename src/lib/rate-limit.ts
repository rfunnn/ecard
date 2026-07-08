const store = global as typeof global & {
  _rl: Map<string, { count: number; resetAt: number }>
}
if (!store._rl) store._rl = new Map()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store._rl.get(key)

  if (!entry || now > entry.resetAt) {
    store._rl.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false
  entry.count++
  return true
}

export function rateLimitKey(req: { headers: { get(name: string): string | null } }, prefix: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  return `${prefix}:${ip}`
}
