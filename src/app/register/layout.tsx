import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Daftar Akaun | ekadku.com",
  description: "Cipta akaun baharu ekadku.com secara percuma.",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
