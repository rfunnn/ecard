import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { subscribeWish } from "@/lib/rsvp-events"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const card = await prisma.invitationCard.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (!card) return new Response("Not found", { status: 404 })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Initial comment to flush headers immediately
      controller.enqueue(encoder.encode(": connected\n\n"))

      const unsubscribe = subscribeWish(card.id, (wish) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(wish)}\n\n`))
        } catch {}
      })

      // Heartbeat every 25s keeps the connection alive through Cloudflare/Nginx
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"))
        } catch {
          clearInterval(heartbeat)
        }
      }, 25_000)

      req.signal.addEventListener("abort", () => {
        unsubscribe()
        clearInterval(heartbeat)
        try { controller.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type":     "text/event-stream",
      "Cache-Control":    "no-cache, no-transform",
      "Connection":       "keep-alive",
      "X-Accel-Buffering": "no", // tells Nginx Proxy Manager not to buffer
    },
  })
}
