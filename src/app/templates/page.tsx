import type { Metadata } from "next"
import { TemplatesClient } from "./TemplatesClient"

export const revalidate = 3600 // revalidate at most once per hour

export const metadata: Metadata = {
  title: "Templat Kad Jemputan Digital | ekadku.com",
  description: "Pilih dari pelbagai templat kad jemputan digital — perkahwinan, hari jadi, korporat dan umum. Sesuaikan warna, fon, muzik dan animasi dalam masa beberapa minit.",
  keywords: ["templat kad jemputan", "kad kahwin digital", "e-invite Malaysia", "kad hari jadi digital", "kad korporat digital"],
  alternates: { canonical: "https://ekadku.com/templates" },
  openGraph: {
    title: "Templat Kad Jemputan Digital | ekadku.com",
    description: "Pilih dari pelbagai templat kad jemputan digital yang cantik untuk majlis anda.",
    url: "https://ekadku.com/templates",
    siteName: "ekadku.com",
    locale: "ms_MY",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Templat Kad Jemputan Digital ekadku.com" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Templat Kad Jemputan Digital | ekadku.com",
    description: "Pilih dari pelbagai templat kad jemputan digital yang cantik untuk majlis anda.",
    site: "@ekadku",
    images: ["/opengraph-image"],
  },
}

export default function TemplatesPage() {
  return <TemplatesClient />
}
