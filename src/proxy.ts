import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "ekadku.com"

function detectPartnerSlug(host: string): string | null {
  if (
    host !== BASE_DOMAIN &&
    host !== `www.${BASE_DOMAIN}` &&
    host.endsWith(`.${BASE_DOMAIN}`)
  ) {
    return host.slice(0, -(BASE_DOMAIN.length + 1))
  }
  if (host !== "localhost" && host.endsWith(".localhost")) {
    return host.slice(0, -(".localhost".length))
  }
  return null
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get("host") ?? ""
  const host = hostname.split(":")[0]

  const partnerSlug = detectPartnerSlug(host)

  // ── Partner subdomain handling ────────────────────────────
  if (partnerSlug) {
    // The login page (and thus Google OAuth) must happen on the main domain.
    // Redirecting /api/auth/signin/ would cause a cross-origin fetch CORS error
    // because NextAuth's signIn() uses fetch from the subdomain origin.
    // Redirecting the /login page itself means the full OAuth flow stays on
    // ekadku.com with no cross-origin requests at all.
    if (pathname === "/login" || pathname.startsWith("/login?") ||
        pathname === "/register" || pathname.startsWith("/register?")) {
      const url = req.nextUrl.clone()
      url.hostname = BASE_DOMAIN
      url.port = ""
      url.protocol = "https:"
      return NextResponse.redirect(url.toString(), 302)
    }

    // For non-API, non-Next.js-internal paths: set attribution cookie and
    // optionally rewrite root to the partner storefront.
    if (!pathname.startsWith("/api/") && !pathname.startsWith("/_next")) {
      const isRoot = pathname === "/" || pathname === ""
      const response = isRoot
        ? NextResponse.rewrite(new URL(`/storefront/${partnerSlug}`, req.url))
        : NextResponse.next()

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
