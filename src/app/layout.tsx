import type { Metadata } from "next"
import { ThemeProvider } from "@/components/ThemeProvider"
import AuthProvider from "@/components/AuthProvider"
import {
  Playfair_Display,
  Lato,
  Great_Vibes,
  Cormorant_Garamond,
  Cinzel,
  Dancing_Script,
  Montserrat,
  Raleway,
  EB_Garamond,
  Open_Sans,
} from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" })
const lato = Lato({ subsets: ["latin"], weight: ["300", "400", "700"], variable: "--font-lato", display: "swap" })
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes", display: "swap" })
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-cormorant", display: "swap" })
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cinzel", display: "swap" })
const dancing = Dancing_Script({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-dancing", display: "swap" })
const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-montserrat", display: "swap" })
const raleway = Raleway({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-raleway", display: "swap" })
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-garamond", display: "swap" })
const openSans = Open_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-opensans", display: "swap" })

export const metadata: Metadata = {
  title: "ekadku.com — Kad Jemputan Digital",
  description: "Cipta kad jemputan digital yang cantik dan mudah dikongsi. Wedding, hari jadi, korporat dan lebih lagi.",
  keywords: ["kad jemputan", "digital invitation", "wedding card", "e-invite", "kad kahwin", "ekadku"],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "ekadku.com — Kad Jemputan Digital",
    description: "Cipta kad jemputan digital yang cantik dan mudah dikongsi.",
    type: "website",
  },
}

const fontVars = [
  playfair.variable, lato.variable, greatVibes.variable, cormorant.variable,
  cinzel.variable, dancing.variable, montserrat.variable, raleway.variable,
  ebGaramond.variable, openSans.variable,
].join(" ")

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms" className={`${fontVars} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-lato">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
