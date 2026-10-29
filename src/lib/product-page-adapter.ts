import { DEFAULT_TEMPLATE_ID, getPageTemplate, type TemplateId } from "@/lib/page-templates"

export interface AIExtractResponse {
  new_title?: string
  title?: string
  description?: string
  images?: string[]
  price?: string | number
  original_price?: string | number
  currency?: string
  variants?: Record<string, string[]> | string[]
  benefits_list?: string[]
  benefits?: string[]
  category?: string
  availability?: string
  template_id?: string
}

export interface EditorSection {
  id: string
  type: "hero" | "gallery" | "buybox" | "benefits" | "specs" | "story" | "reviews" | "faq" | "cta"
  name: string
  visible: boolean
  settings: Record<string, unknown>
}

const id = (type: string) => `generated-${type}`
const text = (value: unknown) => value == null ? "" : String(value)

export function mapAIExtractToSections(product: AIExtractResponse, templateId?: string): EditorSection[] {
  const template = getPageTemplate(templateId || product.template_id || DEFAULT_TEMPLATE_ID)
  const title = text(product.new_title || product.title || "Product")
  const description = text(product.description)
  const images = Array.isArray(product.images) ? product.images.filter(Boolean).map((url) => ({ url, alt: title })) : []
  const benefits = (product.benefits_list || product.benefits || []).filter(Boolean).map((value) => ({ icon: "Sparkles", title: text(value), description: "" }))
  const variants = Array.isArray(product.variants) ? { Options: product.variants.map(text) } : product.variants || {}
  const price = text(product.price)
  const currency = text(product.currency || (price.match(/^[^\d\s]+/)?.[0] || "$"))
  const numericPrice = price.replace(/[^\d.]/g, "")
  const originalPrice = text(product.original_price).replace(/[^\d.]/g, "")
  const fallbackImage = images[0]?.url || ""
  const sectionSettings: Record<string, Record<string, unknown>> = {
    hero: { eyebrow: product.category || "", title, subtitle: description.replace(/<[^>]+>/g, "").slice(0, 220), ctaLabel: "Shop now", ctaHref: "#buybox", imageUrl: fallbackImage, imageAlt: title, imagePosition: "right", backgroundColor: template.accent, textColor: "#ffffff" },
    gallery: { columns: 4, backgroundColor: template.surface, images },
    buybox: { title, price: numericPrice || price, originalPrice, currency, features: [product.availability || "In stock", ...Object.entries(variants).flatMap(([key, values]) => values.map((value) => `${key}: ${value}`))], buttonLabel: "Add to cart", backgroundColor: template.surface },
    benefits: { title: "Why you'll love it", subtitle: "Designed around what matters most.", columns: 4, benefits, backgroundColor: template.surface },
    story: { eyebrow: product.category || "Product details", title, body: description, imageUrl: fallbackImage, imagePosition: "left", backgroundColor: template.text, textColor: "#ffffff" },
    reviews: { title: "Loved by customers", subtitle: "See why shoppers keep coming back.", backgroundColor: template.surface },
    faq: { title: "Questions, answered", backgroundColor: template.surface },
    cta: { title: `Ready to try ${title}?`, subtitle: product.availability || "Discover the difference.", buttonLabel: "Shop now", buttonHref: "#buybox", alignment: "center", backgroundColor: template.accent, textColor: "#ffffff" },
  }

  return template.sections.map((type) => ({
    id: id(type),
    type,
    name: type === "buybox" ? "Buy Box" : type === "cta" ? "Call to Action" : type.charAt(0).toUpperCase() + type.slice(1),
    visible: true,
    settings: { ...sectionSettings[type] },
  }))
}

export function isTemplateId(value: string | null | undefined): value is TemplateId {
  return Boolean(value && getPageTemplate(value).id === value)
}
