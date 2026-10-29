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

export function mapAIExtractToSections(product: AIExtractResponse): EditorSection[] {
  const title = text(product.new_title || product.title || "Product")
  const description = text(product.description)
  const images = Array.isArray(product.images) ? product.images.filter(Boolean).map((url) => ({ url, alt: title })) : []
  const benefits = (product.benefits_list || product.benefits || []).filter(Boolean).map((value) => ({ icon: "Sparkles", title: text(value), description: "" }))
  const variants = Array.isArray(product.variants)
    ? { Options: product.variants.map(text) }
    : product.variants || {}
  const price = text(product.price)
  const currency = text(product.currency || (price.match(/^[^\d\s]+/)?.[0] || "$"))
  const numericPrice = price.replace(/[^\d.]/g, "")
  const originalPrice = text(product.original_price).replace(/[^\d.]/g, "")
  const fallbackImage = images[0]?.url || ""

  return [
    { id: id("hero"), type: "hero", name: "Hero", visible: true, settings: { eyebrow: product.category || "", title, subtitle: description.replace(/<[^>]+>/g, "").slice(0, 220), ctaLabel: "Shop now", ctaHref: "#buybox", imageUrl: fallbackImage, imageAlt: title, imagePosition: "right", backgroundColor: "$primary", textColor: "#ffffff" } },
    { id: id("gallery"), type: "gallery", name: "Gallery", visible: true, settings: { columns: 4, backgroundColor: "#ffffff", images } },
    { id: id("buybox"), type: "buybox", name: "Buy Box", visible: true, settings: { title, price: numericPrice || price, originalPrice, currency, features: [product.availability || "In stock", ...Object.entries(variants).flatMap(([key, values]) => values.map((value) => `${key}: ${value}`))], buttonLabel: "Add to cart", backgroundColor: "#fcfafd" } },
    { id: id("benefits"), type: "benefits", name: "Benefits", visible: true, settings: { title: "Why you'll love it", subtitle: "Designed around what matters most.", columns: 4, benefits, backgroundColor: "#ffffff" } },
    { id: id("story"), type: "story", name: "Product Story", visible: true, settings: { eyebrow: product.category || "Product details", title, body: description, imageUrl: fallbackImage, imagePosition: "left", backgroundColor: "#21182b", textColor: "#ffffff" } },
    { id: id("cta"), type: "cta", name: "Call to Action", visible: true, settings: { title: `Ready to try ${title}?`, subtitle: product.availability || "Discover the difference.", buttonLabel: "Shop now", buttonHref: "#buybox", alignment: "center", backgroundColor: "$primary", textColor: "#ffffff" } },
  ]
}
