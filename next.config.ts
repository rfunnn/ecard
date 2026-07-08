import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
      // Allow images served from the MinIO/S3 public URL (set via STORAGE_PUBLIC_URL)
      ...(process.env.STORAGE_PUBLIC_URL
        ? [
            {
              protocol: process.env.STORAGE_PUBLIC_URL.startsWith("https") ? "https" as const : "http" as const,
              hostname: new URL(process.env.STORAGE_PUBLIC_URL).hostname,
            },
          ]
        : []),
    ],
  },
}

export default nextConfig
