import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Used by Docker HEALTHCHECK, load balancers, and uptime monitors.
// Returns 200 when the app and database are both reachable, 503 otherwise.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json(
      { ok: true, db: "connected" },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { ok: false, db: "error" },
      { status: 503 }
    )
  }
}
