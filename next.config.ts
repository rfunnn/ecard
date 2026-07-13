import type { NextConfig } from "next"

const securityHeaders = [
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "X-Frame-Options",          value: "SAMEORIGIN" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control",   value: "on" },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
  // Required for Docker: copies only the minimal server files into .next/standalone
  output: "standalone",

  // Skip type-checking and linting during `next build`.
  // Run `tsc --noEmit` and `eslint` locally / in CI instead.
  // Removing these checks cuts Docker build time from 30+ min → ~2 min on a VPS.
  typescript: { ignoreBuildErrors: true },

  serverExternalPackages: ["mariadb", "@prisma/adapter-mariadb"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      // Wildcard allows any storage host — avoids baking STORAGE_PUBLIC_URL into
      // the build layer, which forced a full Next.js rebuild on every env change.
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
  },
}

export default nextConfig
