export const FONT_CLASS_MAP: Record<string, string> = {
  "Playfair Display": "font-playfair",
  "Cormorant Garamond": "font-cormorant",
  "Great Vibes": "font-great-vibes",
  "Dancing Script": "font-dancing",
  "Cinzel": "font-cinzel",
  "EB Garamond": "font-garamond",
  "Lato": "font-lato",
  "Montserrat": "font-montserrat",
  "Open Sans": "font-opensans",
  "Raleway": "font-raleway",
}

export function getFontClass(fontName: string): string {
  return FONT_CLASS_MAP[fontName] ?? "font-playfair"
}
