export type TemplateId = "luxury-editorial" | "modern-minimal" | "bold-dtc" | "organic-lifestyle"

export type TemplateSectionType = "hero" | "gallery" | "buybox" | "benefits" | "specs" | "story" | "reviews" | "faq" | "cta"

export interface PageTemplate {
  id: TemplateId
  name: string
  description: string
  accent: string
  surface: string
  text: string
  muted: string
  sections: TemplateSectionType[]
  layout: "editorial" | "minimal" | "bold" | "organic"
}

export const DEFAULT_TEMPLATE_ID: TemplateId = "modern-minimal"

export const PAGE_TEMPLATES: Record<TemplateId, PageTemplate> = {
  "luxury-editorial": {
    id: "luxury-editorial",
    name: "Luxury Editorial",
    description: "High-contrast storytelling for considered, premium products.",
    accent: "#9d7650",
    surface: "#f5efe7",
    text: "#2f2923",
    muted: "#84766a",
    sections: ["hero", "gallery", "story", "benefits", "buybox", "cta"],
    layout: "editorial",
  },
  "modern-minimal": {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "A focused, spacious structure that keeps the product first.",
    accent: "#6425c7",
    surface: "#ffffff",
    text: "#21182b",
    muted: "#766b80",
    sections: ["hero", "gallery", "buybox", "benefits", "story", "cta"],
    layout: "minimal",
  },
  "bold-dtc": {
    id: "bold-dtc",
    name: "Bold DTC",
    description: "Confident color and punchy sections designed for conversion.",
    accent: "#ed5b3a",
    surface: "#fff3e8",
    text: "#251614",
    muted: "#865c54",
    sections: ["hero", "benefits", "gallery", "buybox", "reviews", "cta"],
    layout: "bold",
  },
  "organic-lifestyle": {
    id: "organic-lifestyle",
    name: "Organic Lifestyle",
    description: "Warm, grounded presentation for natural and everyday goods.",
    accent: "#55745a",
    surface: "#eef2e8",
    text: "#26352a",
    muted: "#718070",
    sections: ["hero", "story", "gallery", "benefits", "buybox", "faq", "cta"],
    layout: "organic",
  },
}

export const TEMPLATE_OPTIONS = Object.values(PAGE_TEMPLATES)

export function getPageTemplate(templateId?: string | null): PageTemplate {
  return PAGE_TEMPLATES[templateId as TemplateId] || PAGE_TEMPLATES[DEFAULT_TEMPLATE_ID]
}
