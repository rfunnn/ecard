import type { Metadata } from "next"
import { ThemeProvider } from "@/components/ThemeProvider"
import AuthProvider from "@/components/AuthProvider"
import { ConditionalSiteNav } from "@/components/ConditionalSiteNav"
import { WhatsAppButton } from "@/components/WhatsAppButton"
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
  metadataBase: new URL("https://ekadku.com"),
  title: {
    default: "ekadku.com — Kad Jemputan Digital Malaysia",
    template: "%s | ekadku.com",
  },
  description: "Cipta kad jemputan digital yang cantik dan mudah dikongsi. Perkahwinan, hari jadi, korporat dan lebih lagi. Mulai RM30 sahaja.",
  keywords: ["kad jemputan digital", "kad kahwin digital", "e-kad Malaysia", "digital invitation Malaysia", "kad jemputan online", "ekadku", "kad perkahwinan digital", "kad hari jadi digital"],
  authors: [{ name: "ekadku.com", url: "https://ekadku.com" }],
  creator: "ekadku.com",
  alternates: { canonical: "https://ekadku.com" },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "ekadku.com — Kad Jemputan Digital Malaysia",
    description: "Cipta kad jemputan digital yang cantik dan mudah dikongsi. Perkahwinan, hari jadi, korporat dan lebih lagi. Mulai RM30 sahaja.",
    url: "https://ekadku.com",
    siteName: "ekadku.com",
    locale: "ms_MY",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ekadku.com — Kad Jemputan Digital Malaysia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ekadku.com — Kad Jemputan Digital Malaysia",
    description: "Cipta kad jemputan digital yang cantik. Perkahwinan, hari jadi, korporat. Mulai RM30.",
    site: "@ekadku",
    images: ["/opengraph-image"],
  },
  verification: {
    google: "FsMFuM2EhLes5nhV5dR9Yc7yJJJ7UHctT_3ZOkExniI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
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
      <head>
        {/* Apply saved theme before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('ekad_theme')==='dark')document.documentElement.classList.add('dark')}catch{}` }} />
      </head>
      <body className="min-h-full flex flex-col font-lato">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://ekadku.com/#organization",
                name: "ekadku.com",
                url: "https://ekadku.com",
                description: "Platform kad jemputan digital Malaysia — perkahwinan, hari jadi, dan korporat.",
              },
              {
                "@type": "WebSite",
                "@id": "https://ekadku.com/#website",
                url: "https://ekadku.com",
                name: "ekadku.com",
                publisher: { "@id": "https://ekadku.com/#organization" },
                potentialAction: {
                  "@type": "SearchAction",
                  target: { "@type": "EntryPoint", urlTemplate: "https://ekadku.com/templates" },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "SoftwareApplication",
                name: "ekadku.com",
                applicationCategory: "WebApplication",
                operatingSystem: "Web",
                url: "https://ekadku.com",
                description: "Platform cipta kad jemputan digital untuk majlis perkahwinan, hari jadi, dan korporat di Malaysia.",
                offers: [
                  { "@type": "Offer", name: "Bronze", price: "30", priceCurrency: "MYR" },
                  { "@type": "Offer", name: "Silver", price: "40", priceCurrency: "MYR" },
                  { "@type": "Offer", name: "Gold",   price: "60", priceCurrency: "MYR" },
                ],
              },
            ],
          })}}
        />
        <AuthProvider>
          <ThemeProvider>
            <ConditionalSiteNav />
            {children}
            <WhatsAppButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
