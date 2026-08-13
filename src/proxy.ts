import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "ekadku.com"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get("host") ?? ""
  const host = hostname.split(":")[0]

  // ── Partner subdomain detection ───────────────────────────
  // Skip for API routes and Next.js internals
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/_next")) {
    let partnerSlug: string | null = null

    if (
      host !== BASE_DOMAIN &&
      host !== `www.${BASE_DOMAIN}` &&
      host.endsWith(`.${BASE_DOMAIN}`)
    ) {
      partnerSlug = host.slice(0, -(BASE_DOMAIN.length + 1))
    }

    if (!partnerSlug && host !== "localhost" && host.endsWith(".localhost")) {
      partnerSlug = host.slice(0, -(".localhost".length))
    }

    if (partnerSlug) {
      // Only rewrite the root path to the storefront — all other paths
      // (templates, builder, dashboard, login, etc.) are served normally
      const isRoot = pathname === "/" || pathname === ""
      const response = isRoot
        ? NextResponse.rewrite(new URL(`/storefront/${partnerSlug}`, req.url))
        : NextResponse.next()

      // Use a root-domain cookie so attribution persists when the client
      // navigates to the main domain (e.g. ekadku.com/templates)
      const cookieDomain = host.endsWith(".localhost") ? undefined : `.${BASE_DOMAIN}`
      response.cookies.set("ekadku_partner", partnerSlug, {
        ...(cookieDomain ? { domain: cookieDomain } : {}),
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      })
      return response
    }
  }

  // ── Admin route protection ────────────────────────────────
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin")

  if (isAdminRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = "/login"
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const email = ((token.email as string) ?? "").toLowerCase()
    if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // ── Security headers ──────────────────────────────────────
  const response = NextResponse.next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  return response
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)",
  ],
}
