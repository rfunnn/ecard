import { NextRequest, NextResponse } from "next/server"

// Proxy public storage requests to MinIO internally.
// This lets STORAGE_PUBLIC_URL be set to https://ekadku.com/storage without
// requiring a separate Nginx location block for /storage.

const ENDPOINT = (process.env.STORAGE_ENDPOINT ?? "http://localhost:9000").replace(/\/$/, "")
const BUCKET   = process.env.STORAGE_BUCKET ?? "ecard"

interface RouteContext {
  params: Promise<{ path: string[] }>
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { path } = await params

  // Only serve objects from the configured bucket — reject anything else
  if (path[0] !== BUCKET || path.length < 2) {
    return new NextResponse("Not found", { status: 404 })
  }

  const upstream = `${ENDPOINT}/${path.join("/")}`

  let res: Response
  try {
    res = await fetch(upstream)
  } catch {
    return new NextResponse("Storage unreachable", { status: 502 })
  }

  if (!res.ok) {
    return new NextResponse(res.statusText, { status: res.status })
  }

  const headers = new Headers()
  const contentType = res.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)
  // Cache images aggressively at the CDN/browser layer
  headers.set("cache-control", "public, max-age=31536000, immutable")

  return new NextResponse(res.body, { status: 200, headers })
}
