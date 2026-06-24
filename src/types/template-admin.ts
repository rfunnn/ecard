export interface ContentBlock {
  type: "text" | "image"
  value?: string
  url?: string
}

export type OpeningAnimationStyle = "fade" | "rise" | "split" | "zoom"

export interface OpeningAnimation {
  style: OpeningAnimationStyle
  duration: number  // seconds
  delay: number     // seconds
}

export interface TemplateDisplayConfig {
  page1: {
    overlayText: {
      title: string
      subtitle: string
    }
    openingAnimation?: OpeningAnimation
  }
  page2: {
    scrollContent: ContentBlock[]
  }
  page3Plus: {
    scrollContent: ContentBlock[]
  }
  scrollSettings: {
    transitionType: "scroll-snap" | "js-listener"
    imageSwitchOffset: number
    animation: "smooth" | "instant"
  }
}

export interface AdminTemplate {
  id: string
  slug: string
  name: string
  nameMs: string
  category: "WEDDING" | "BIRTHDAY" | "CORPORATE" | "GENERIC"
  thumbnail: string
  previewUrl?: string
  isActive: boolean
  sortOrder: number
  defaultConfig: Record<string, unknown>
  image1Url?: string
  image2Url?: string
  displayConfig?: TemplateDisplayConfig
  createdAt: string
  updatedAt: string
}

export const DEFAULT_DISPLAY_CONFIG: TemplateDisplayConfig = {
  page1: {
    overlayText: { title: "", subtitle: "" },
    openingAnimation: { style: "fade", duration: 1.2, delay: 0.2 },
  },
  page2: {
    scrollContent: [{ type: "text", value: "" }],
  },
  page3Plus: {
    scrollContent: [{ type: "text", value: "" }],
  },
  scrollSettings: {
    transitionType: "js-listener",
    imageSwitchOffset: 0.8,
    animation: "smooth",
  },
}
