/**
 * Convert rich-text HTML (as stored in card.description) into plain text
 * suitable for <meta> tags. Meta descriptions must be plain text — leaving
 * HTML in them makes crawlers like WhatsApp render the escaped tags as
 * literal visible text in the link preview.
 */
export function toPlainText(
  html: string | null | undefined,
  fallback = "",
  maxLength = 200
): string {
  if (!html) return fallback
  const text = html
    .replace(/<[^>]*>/g, " ") // drop tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
  if (!text) return fallback
  return text.length > maxLength ? text.slice(0, maxLength - 1).trimEnd() + "…" : text
}
