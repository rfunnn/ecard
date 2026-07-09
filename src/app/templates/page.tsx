import type { Metadata } from "next"
import { TemplatesClient } from "./TemplatesClient"

export const metadata: Metadata = {
  title: "Templat Kad Jemputan Digital | ekadku.com",
  description: "Pilih dari pelbagai templat kad jemputan digital — perkahwinan, hari jadi, korporat dan umum. Sesuaikan warna, fon, muzik dan animasi dalam masa beberapa minit.",
  keywords: ["templat kad jemputan", "kad kahwin digital", "e-invite Malaysia", "kad hari jadi digital", "kad korporat digital"],
  alternates: { canonical: "https://ekadku.com/templates" },
  openGraph: {
    title: "Templat Kad Jemputan Digital | ekadku.com",
    description: "Pilih dari pelbagai templat kad jemputan digital yang cantik untuk majlis anda.",
    url: "https://ekadku.com/templates",
    type: "website",
  },
}

export default function TemplatesPage() {
  return <TemplatesClient />
}
