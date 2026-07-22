import { NextResponse } from "next/server"

// Used by Docker HEALTHCHECK, load balancers, and uptime monitors.
// Returns 200 when the app server is reachable. DB has its own healthcheck
// in docker-compose so we don't duplicate that here.
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 })
}
