import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Log Masuk | ekadku.com",
  description: "Log masuk ke akaun ekadku.com anda.",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
