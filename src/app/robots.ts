import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // WhatsApp / Facebook link-preview crawler — needs OG image endpoint
        userAgent: "facebookexternalhit",
        allow: ["/", "/api/og/"],
        disallow: [],
      },
      {
        userAgent: "*",
        allow: ["/", "/api/og/"],
        disallow: [
          "/dashboard",
          "/builder/",
          "/admin/",
          "/checkout/",
          "/mock-payment/",
          "/api/user/",
          "/api/cards/",
          "/api/analytics/",
          "/api/admin/",
          "/api/auth/",
        ],
      },
    ],
    sitemap: "https://ekadku.com/sitemap.xml",
  }
}
