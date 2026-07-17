import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og/"],
        disallow: [
          "/dashboard",
          "/builder/",
          "/admin/",
          "/checkout/",
          "/api/",
          "/mock-payment/",
        ],
      },
    ],
    sitemap: "https://ekadku.com/sitemap.xml",
  }
}
