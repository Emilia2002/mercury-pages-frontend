"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "@/components/SidebarNew"
import { useAuth } from "@/contexts/AuthContext"
import { mapAIExtractToSections, type AIExtractResponse } from "@/lib/product-page-adapter"
import { getPageTemplate } from "@/lib/page-templates"
import { GenerateImageDialog } from "@/components/page-editor/GenerateImageDialog"
import type { GeneratedImageAsset } from "@/lib/image-generation"
import { MediaLibrary, type EditorMediaAsset } from "@/components/page-editor/MediaLibrary"
import { Plus, Copy, Trash2, Eye, EyeOff, GripVertical, Monitor, Smartphone, Undo2, Redo2, Save, Check, Loader as Loader2, ChevronLeft, Sparkles, Settings2, LayoutGrid, X, ArrowUp, ArrowDown, ImagePlus, Search, RefreshCw, CheckCircle2 } from "lucide-react"

// ---------- Types ----------
type SectionType = "hero" | "gallery" | "buybox" | "benefits" | "specs" | "story" | "reviews" | "faq" | "cta"

interface PageSection {
  id: string
  type: SectionType
  name: string
  visible: boolean
  settings: Record<string, unknown>
}

const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero", gallery: "Gallery", buybox: "Buy Box", benefits: "Benefits",
  specs: "Specifications", story: "Brand Story", reviews: "Reviews", faq: "FAQ", cta: "Call to Action",
}

const SECTION_TYPES: SectionType[] = ["hero", "gallery", "buybox", "benefits", "specs", "story", "reviews", "faq", "cta"]

const uid = () => Math.random().toString(36).slice(2, 10)

// ---------- Sample product ----------
const SAMPLE = {
  title: "Aurora Hydrating Serum",
  subtitle: "72-hour deep hydration with niacinamide + hyaluronic acid",
  price: "$48",
  originalPrice: "$62",
  currency: "$",
  eyebrow: "Bestseller",
  images: [
    "https://images.pexels.com/photos/6767763/pexels-photo-6767763.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/8101534/pexels-photo-8101534.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/8100691/pexels-photo-8100691.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/11741348/pexels-photo-11741348.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  ],
  storyImage: "https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  features: ["Vegan & cruelty-free", "Dermatologist tested", "Fragrance-free formula", "Made in small batches"],
  benefits: [
    { icon: "Sparkles", title: "Deep Hydration", description: "Hyaluronic acid locks in moisture for up to 72 hours." },
    { icon: "Shield", title: "Barrier Support", description: "Niacinamide strengthens your skin's natural barrier." },
    { icon: "Leaf", title: "Clean Ingredients", description: "No parabens, sulfates, or synthetic fragrances." },
    { icon: "Award", title: "Award Winning", description: "Voted Best Serum by Beauty Edit 2025." },
  ],
  specs: [
    { label: "Volume", value: "30 ml / 1.0 fl oz" },
    { label: "Skin Type", value: "All skin types" },
    { label: "Key Actives", value: "Hyaluronic Acid, Niacinamide, Panthenol" },
    { label: "Texture", value: "Lightweight gel-serum" },
    { label: "Use", value: "Morning & evening, before moisturizer" },
  ],
  reviews: [
    { author: "Maya R.", rating: 5, text: "My skin has never looked this dewy. Absorbs instantly and sits perfectly under makeup." },
    { author: "Jordan T.", rating: 4, text: "Great hydration boost. Wish the bottle was a bit bigger for the price." },
    { author: "Priya S.", rating: 5, text: "Cleared my dry patches in a week. The texture is luxurious without being greasy." },
  ],
  faq: [
    { question: "Is this safe for sensitive skin?", answer: "Yes. The formula is fragrance-free and dermatologist tested for sensitivity." },
    { question: "How long does one bottle last?", answer: "With daily use, one 30ml bottle lasts approximately 6-8 weeks." },
    { question: "Can I use it with retinol?", answer: "Yes. Apply the serum first, let it absorb, then follow with retinol." },
  ],
}

function makeDefaultSection(type: SectionType): PageSection {
  const base = { id: uid(), type, visible: true }
  switch (type) {
    case "hero":
      return { ...base, name: "Hero", settings: {
        eyebrow: SAMPLE.eyebrow, title: SAMPLE.title, subtitle: SAMPLE.subtitle,
        ctaLabel: "Shop now", ctaHref: "#buybox", imageUrl: SAMPLE.images[0], imageAlt: SAMPLE.title,
        imagePosition: "right", backgroundColor: "$primary", textColor: "#ffffff",
      }}
    case "gallery":
      return { ...base, name: "Gallery", settings: {
        columns: 4, backgroundColor: "#ffffff",
        images: SAMPLE.images.map((url) => ({ url, alt: SAMPLE.title })),
      }}
    case "buybox":
      return { ...base, name: "Buy Box", settings: {
        title: SAMPLE.title, price: "48", originalPrice: "62", currency: "$",
        features: SAMPLE.features, buttonLabel: "Add to cart", backgroundColor: "#fcfafd",
      }}
    case "benefits":
      return { ...base, name: "Benefits", settings: {
        title: "Why you'll love it", subtitle: "Clinically backed ingredients, visible results.",
        columns: 4, benefits: SAMPLE.benefits, backgroundColor: "#ffffff",
      }}
    case "specs":
      return { ...base, name: "Specifications", settings: {
        title: "Product details", layout: "table", specs: SAMPLE.specs, backgroundColor: "#f9f2f8",
      }}
    case "story":
      return { ...base, name: "Brand Story", settings: {
        eyebrow: "Our promise", title: "Skincare backed by science",
        body: "We formulate in small batches with clinically proven actives at effective concentrations. No filler, no fluff — just skincare that works.",
        imageUrl: SAMPLE.storyImage, imagePosition: "left",
        backgroundColor: "#21182b", textColor: "#ffffff",
      }}
    case "reviews":
      return { ...base, name: "Reviews", settings: {
        title: "Loved by 12,000+ customers", reviews: SAMPLE.reviews, backgroundColor: "#ffffff",
      }}
    case "faq":
      return { ...base, name: "FAQ", settings: {
        title: "Frequently asked questions", items: SAMPLE.faq, backgroundColor: "#f9f2f8",
      }}
    case "cta":
      return { ...base, name: "Call to Action", settings: {
        title: "Ready for your best skin yet?", subtitle: "Join thousands who switched to Aurora.",
        buttonLabel: "Shop the serum", buttonHref: "#", alignment: "center",
        backgroundColor: "$primary", textColor: "#ffffff",
      }}
  }
}

function initialSections(): PageSection[] {
  return (["hero","gallery","buybox","benefits","specs","story","reviews","faq","cta"] as SectionType[]).map(makeDefaultSection)
}

// ---------- Color helpers ----------
const TOKEN_COLORS: Record<string, string> = {
  primary: "#e83ead", secondary: "#6425c7", plum: "#21182b", surface: "#ffffff", soft: "#f9f2f8", text: "#21182b", muted: "#766b80",
}
function resolveColor(v: string): string {
  if (v.startsWith("$")) return TOKEN_COLORS[v.slice(1)] || "#ffffff"
  return v
}
const SWATCHES = ["#e83ead","#6425c7","#21182b","#ffffff","#fcfafd","#f9f2f8","#f7e4f3","#efe6fa","#1f9d6f","#d99a2b","#d4506a","#5b7cf0"]

function mediaFromSections(sections: PageSection[]): EditorMediaAsset[] {
  const assets: EditorMediaAsset[] = []
  sections.forEach((section) => {
    const images = section.type === "gallery" && Array.isArray(section.settings.images)
      ? section.settings.images as Array<{ url?: string; alt?: string }>
      : section.settings.imageUrl ? [{ url: String(section.settings.imageUrl), alt: String(section.settings.imageAlt || section.name) }] : []
    images.forEach((image, index) => { if (image.url) assets.push({ id: `${section.id}-${index}`, url: image.url, alt: image.alt || section.name, source: "original" }) })
  })
  return assets.filter((asset, index, all) => all.findIndex((candidate) => candidate.url === asset.url) === index)
}

// ---------- Icon map for benefits ----------
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Shield: Eye, Heart: Eye, Zap: Sparkles, Leaf: Plus, Award: Settings2,
}

// ---------- Inspector field components ----------
function TextField({ label, value, onChange, multiline, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[#766b80]">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="w-full rounded-lg border border-[#eae2f0] bg-white px-3 py-2 text-sm text-[#21182b] focus:outline-none focus:ring-2 focus:ring-[#e83ead]/20 focus:border-[#e83ead]" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-lg border border-[#eae2f0] bg-white px-3 text-sm text-[#21182b] focus:outline-none focus:ring-2 focus:ring-[#e83ead]/20 focus:border-[#e83ead]" />
      )}
    </label>
  )
}
function NumberField({ label, value, onChange, min = 1, max = 6 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[#766b80]">{label}</span>
      <input type="number" value={value} min={min} max={max} onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))} className="h-9 w-full rounded-lg border border-[#eae2f0] bg-white px-3 text-sm text-[#21182b] focus:outline-none focus:ring-2 focus:ring-[#e83ead]/20" />
    </label>
  )
}
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[#766b80]">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-lg border border-[#eae2f0] bg-white px-3 text-sm text-[#21182b] focus:outline-none focus:ring-2 focus:ring-[#e83ead]/20">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const resolved = resolveColor(value)
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[#766b80]">{label}</span>
      <div className="flex gap-2">
        <input type="color" value={resolved} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-[#eae2f0]" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 flex-1 rounded-lg border border-[#eae2f0] bg-white px-3 text-sm text-[#21182b] focus:outline-none focus:ring-2 focus:ring-[#e83ead]/20" />
      </div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {SWATCHES.map((c) => (
          <button key={c} type="button" onClick={() => onChange(c)} className="size-5 rounded-md border border-[#eae2f0] transition hover:scale-110" style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>
  )
}
function StringList({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-[#766b80]">{label}</span>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input type="text" value={item} onChange={(e) => { const c = [...items]; c[i] = e.target.value; onChange(c) }} className="h-8 flex-1 rounded border border-[#eae2f0] px-2 text-xs text-[#21182b] focus:outline-none focus:ring-1 focus:ring-[#e83ead]/20" />
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-[#d4506a] hover:text-red-600"><X className="size-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="flex items-center gap-1 text-xs font-medium text-[#8e267e] hover:text-[#e83ead]"><Plus className="size-3.5" /> Add</button>
    </div>
  )
}

interface ObjField { key: string; label: string; type: "text" | "textarea" | "select" | "number"; options?: string[] }
function ObjectList({ label, items, fields, onChange }: { label: string; items: Record<string, unknown>[]; fields: ObjField[]; onChange: (v: Record<string, unknown>[]) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-[#766b80]">{label}</span>
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-[#eae2f0] bg-white p-2.5">
          <div className="flex flex-col gap-2">
            {fields.map((f) => (
              <div key={f.key}>
                {f.type === "textarea" ? (
                  <textarea value={(item[f.key] as string) || ""} onChange={(e) => { const c = [...items]; c[i] = { ...item, [f.key]: e.target.value }; onChange(c) }} placeholder={f.label} rows={2} className="w-full rounded border border-[#eae2f0] px-2 py-1 text-xs text-[#21182b] focus:outline-none focus:ring-1 focus:ring-[#e83ead]/20" />
                ) : f.type === "select" ? (
                  <select value={(item[f.key] as string) || ""} onChange={(e) => { const c = [...items]; c[i] = { ...item, [f.key]: e.target.value }; onChange(c) }} className="h-8 w-full rounded border border-[#eae2f0] px-2 text-xs text-[#21182b] focus:outline-none focus:ring-1 focus:ring-[#e83ead]/20">
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === "number" ? (
                  <input type="number" value={(item[f.key] as number) || 0} min={1} max={5} onChange={(e) => { const c = [...items]; c[i] = { ...item, [f.key]: Math.max(1, Math.min(5, parseInt(e.target.value) || 5)) }; onChange(c) }} placeholder={f.label} className="h-8 w-full rounded border border-[#eae2f0] px-2 text-xs text-[#21182b] focus:outline-none focus:ring-1 focus:ring-[#e83ead]/20" />
                ) : (
                  <input type="text" value={(item[f.key] as string) || ""} onChange={(e) => { const c = [...items]; c[i] = { ...item, [f.key]: e.target.value }; onChange(c) }} placeholder={f.label} className="h-8 w-full rounded border border-[#eae2f0] px-2 text-xs text-[#21182b] focus:outline-none focus:ring-1 focus:ring-[#e83ead]/20" />
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="mt-2 flex items-center gap-1 text-xs text-[#d4506a] hover:text-red-600"><Trash2 className="size-3" /> Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => { const n: Record<string, unknown> = {}; fields.forEach((f) => { n[f.key] = f.type === "number" ? 5 : f.key === "icon" ? "Sparkles" : "" }); onChange([...items, n]) }} className="flex items-center gap-1 text-xs font-medium text-[#8e267e] hover:text-[#e83ead]"><Plus className="size-3.5" /> Add</button>
    </div>
  )
}

// ---------- Inspector ----------
function Inspector({ section, onUpdate }: { section: PageSection | null; onUpdate: (id: string, settings: Record<string, unknown>) => void }) {
  if (!section) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f9f2f8] text-[#6425c7]"><Settings2 className="size-6" /></div>
        <p className="mt-3 text-sm font-medium text-[#766b80]">No section selected</p>
        <p className="mt-1 text-xs text-[#aa97b0]">Click a section in the preview to edit its content.</p>
      </div>
    )
  }
  const s = section.settings
  const u = (k: string, v: unknown) => onUpdate(section.id, { ...s, [k]: v })
  const fields: React.ReactNode = (() => {
    switch (section.type) {
      case "hero": return <>
        <TextField label="Eyebrow" value={s.eyebrow as string} onChange={(v) => u("eyebrow", v)} />
        <TextField label="Title" value={s.title as string} onChange={(v) => u("title", v)} multiline />
        <TextField label="Subtitle" value={s.subtitle as string} onChange={(v) => u("subtitle", v)} multiline />
        <TextField label="CTA Label" value={s.ctaLabel as string} onChange={(v) => u("ctaLabel", v)} />
        <TextField label="CTA Link" value={s.ctaHref as string} onChange={(v) => u("ctaHref", v)} />
        <TextField label="Image URL" value={s.imageUrl as string} onChange={(v) => u("imageUrl", v)} />
        <TextField label="Image Alt" value={s.imageAlt as string} onChange={(v) => u("imageAlt", v)} />
        <SelectField label="Image Position" value={s.imagePosition as string} options={["left","right","full"]} onChange={(v) => u("imagePosition", v)} />
        <ColorField label="Background" value={s.backgroundColor as string} onChange={(v) => u("backgroundColor", v)} />
        <ColorField label="Text Color" value={s.textColor as string} onChange={(v) => u("textColor", v)} />
      </>
      case "gallery": return <>
        <NumberField label="Columns" value={s.columns as number} onChange={(v) => u("columns", v)} min={1} max={6} />
        <ObjectList label="Images" items={s.images as Record<string,unknown>[]} fields={[{key:"url",label:"URL",type:"text"},{key:"alt",label:"Alt text",type:"text"}]} onChange={(v) => u("images", v)} />
        <ColorField label="Background" value={s.backgroundColor as string} onChange={(v) => u("backgroundColor", v)} />
      </>
      case "buybox": return <>
        <TextField label="Title" value={s.title as string} onChange={(v) => u("title", v)} />
        <TextField label="Price" value={s.price as string} onChange={(v) => u("price", v)} />
        <TextField label="Original Price" value={s.originalPrice as string} onChange={(v) => u("originalPrice", v)} />
        <TextField label="Currency" value={s.currency as string} onChange={(v) => u("currency", v)} />
        <StringList label="Features" items={s.features as string[]} onChange={(v) => u("features", v)} />
        <TextField label="Button Label" value={s.buttonLabel as string} onChange={(v) => u("buttonLabel", v)} />
        <ColorField label="Background" value={s.backgroundColor as string} onChange={(v) => u("backgroundColor", v)} />
      </>
      case "benefits": return <>
        <TextField label="Title" value={s.title as string} onChange={(v) => u("title", v)} />
        <TextField label="Subtitle" value={s.subtitle as string} onChange={(v) => u("subtitle", v)} />
        <NumberField label="Columns" value={s.columns as number} onChange={(v) => u("columns", v)} min={1} max={4} />
        <ObjectList label="Benefits" items={s.benefits as Record<string,unknown>[]} fields={[{key:"icon",label:"Icon",type:"select",options:["Sparkles","Shield","Heart","Zap","Leaf","Award"]},{key:"title",label:"Title",type:"text"},{key:"description",label:"Description",type:"textarea"}]} onChange={(v) => u("benefits", v)} />
        <ColorField label="Background" value={s.backgroundColor as string} onChange={(v) => u("backgroundColor", v)} />
      </>
      case "specs": return <>
        <TextField label="Title" value={s.title as string} onChange={(v) => u("title", v)} />
        <SelectField label="Layout" value={s.layout as string} options={["table","cards"]} onChange={(v) => u("layout", v)} />
        <ObjectList label="Specs" items={s.specs as Record<string,unknown>[]} fields={[{key:"label",label:"Label",type:"text"},{key:"value",label:"Value",type:"text"}]} onChange={(v) => u("specs", v)} />
        <ColorField label="Background" value={s.backgroundColor as string} onChange={(v) => u("backgroundColor", v)} />
      </>
      case "story": return <>
        <TextField label="Eyebrow" value={s.eyebrow as string} onChange={(v) => u("eyebrow", v)} />
        <TextField label="Title" value={s.title as string} onChange={(v) => u("title", v)} />
        <TextField label="Body" value={s.body as string} onChange={(v) => u("body", v)} multiline rows={5} />
        <TextField label="Image URL" value={s.imageUrl as string} onChange={(v) => u("imageUrl", v)} />
        <SelectField label="Image Position" value={s.imagePosition as string} options={["left","right"]} onChange={(v) => u("imagePosition", v)} />
        <ColorField label="Background" value={s.backgroundColor as string} onChange={(v) => u("backgroundColor", v)} />
        <ColorField label="Text Color" value={s.textColor as string} onChange={(v) => u("textColor", v)} />
      </>
      case "reviews": return <>
        <TextField label="Title" value={s.title as string} onChange={(v) => u("title", v)} />
        <ObjectList label="Reviews" items={s.reviews as Record<string,unknown>[]} fields={[{key:"author",label:"Author",type:"text"},{key:"rating",label:"Rating",type:"number"},{key:"text",label:"Review",type:"textarea"}]} onChange={(v) => u("reviews", v)} />
        <ColorField label="Background" value={s.backgroundColor as string} onChange={(v) => u("backgroundColor", v)} />
      </>
      case "faq": return <>
        <TextField label="Title" value={s.title as string} onChange={(v) => u("title", v)} />
        <ObjectList label="FAQ Items" items={s.items as Record<string,unknown>[]} fields={[{key:"question",label:"Question",type:"text"},{key:"answer",label:"Answer",type:"textarea"}]} onChange={(v) => u("items", v)} />
        <ColorField label="Background" value={s.backgroundColor as string} onChange={(v) => u("backgroundColor", v)} />
      </>
      case "cta": return <>
        <TextField label="Title" value={s.title as string} onChange={(v) => u("title", v)} />
        <TextField label="Subtitle" value={s.subtitle as string} onChange={(v) => u("subtitle", v)} />
        <TextField label="Button Label" value={s.buttonLabel as string} onChange={(v) => u("buttonLabel", v)} />
        <TextField label="Button Link" value={s.buttonHref as string} onChange={(v) => u("buttonHref", v)} />
        <SelectField label="Alignment" value={s.alignment as string} options={["left","center"]} onChange={(v) => u("alignment", v)} />
        <ColorField label="Background" value={s.backgroundColor as string} onChange={(v) => u("backgroundColor", v)} />
        <ColorField label="Text Color" value={s.textColor as string} onChange={(v) => u("textColor", v)} />
      </>
    }
  })()

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[#eae2f0] px-5 py-4">
        <LayoutGrid className="size-4 text-[#e83ead]" />
        <h3 className="text-sm font-semibold text-[#21182b]">{section.name}</h3>
        <span className="ml-auto rounded-full bg-[#f7e4f3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8e267e]">{section.type}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-4">{fields}</div>
      </div>
    </div>
  )
}

// ---------- Section renderer (live preview) ----------
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-[#e83ead]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-25"}>★</span>
      ))}
    </div>
  )
}

function SectionContent({ section }: { section: PageSection }) {
  const s = section.settings
  const bg = resolveColor(s.backgroundColor as string)
  const text = resolveColor((s.textColor as string) || "#21182b")

  switch (section.type) {
    case "hero": {
      const img = s.imageUrl as string
      const pos = s.imagePosition as string
      if (pos === "full") return (
        <div className="relative flex min-h-[400px] items-end overflow-hidden" style={{ background: bg }}>
          {img && <img src={img} alt={s.imageAlt as string} className="absolute inset-0 size-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="relative z-10 p-10" style={{ color: text }}>
            {(s.eyebrow as string) && <span className="text-xs font-semibold uppercase tracking-[0.18em] opacity-90">{s.eyebrow as string}</span>}
            <h1 className="mt-2 text-4xl font-bold tracking-tight">{s.title as string}</h1>
            <p className="mt-2 max-w-lg text-base opacity-85">{s.subtitle as string}</p>
            <button className="mt-5 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#21182b]">{s.ctaLabel as string}</button>
          </div>
        </div>
      )
      return (
        <div className={`grid items-center gap-0 md:grid-cols-2`} style={{ background: bg, color: text }}>
          <div className={`p-10 ${pos === "right" ? "order-1" : "order-2"}`}>
            {(s.eyebrow as string) && <span className="text-xs font-semibold uppercase tracking-[0.18em] opacity-90">{s.eyebrow as string}</span>}
            <h1 className="mt-2 text-4xl font-bold tracking-tight">{s.title as string}</h1>
            <p className="mt-3 text-base opacity-85">{s.subtitle as string}</p>
            <button className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold" style={{ color: bg === "#ffffff" ? "#e83ead" : "#21182b" }}>{s.ctaLabel as string}</button>
          </div>
          <div className={`h-full min-h-[300px] overflow-hidden ${pos === "right" ? "order-2" : "order-1"}`}>
            {img && <img src={img} alt={s.imageAlt as string} className="size-full object-cover" />}
          </div>
        </div>
      )
    }
    case "gallery": {
      const cols = s.columns as number
      const images = s.images as { url: string; alt: string }[]
      return (
        <div className="p-8" style={{ background: bg }}>
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {images.map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl border border-[#eae2f0]">
                {img.url && <img src={img.url} alt={img.alt} className="size-full object-cover" />}
              </div>
            ))}
          </div>
        </div>
      )
    }
    case "buybox": {
      const price = s.price as string
      const orig = s.originalPrice as string
      const cur = s.currency as string
      return (
        <div className="p-10" style={{ background: bg }}>
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#21182b]">{s.title as string}</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#e83ead]">{cur}{price}</span>
              {orig && <span className="text-lg text-[#aa97b0] line-through">{cur}{orig}</span>}
            </div>
            <ul className="flex flex-col gap-2">
              {(s.features as string[]).map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#766b80]"><Check className="size-4 text-[#1f9d6f]" /> {f}</li>
              ))}
            </ul>
            <button className="mt-2 h-12 rounded-xl bg-gradient-to-r from-[#e83ead] to-[#6425c7] text-sm font-semibold text-white">{s.buttonLabel as string}</button>
          </div>
        </div>
      )
    }
    case "benefits": {
      const cols = s.columns as number
      const benefits = s.benefits as { icon: string; title: string; description: string }[]
      return (
        <div className="p-10" style={{ background: bg }}>
          <h2 className="text-center text-2xl font-bold tracking-tight text-[#21182b]">{s.title as string}</h2>
          <p className="mt-2 text-center text-sm text-[#766b80]">{s.subtitle as string}</p>
          <div className={`mt-8 grid gap-5`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {benefits.map((b, i) => {
              const Icon = ICON_MAP[b.icon] || Sparkles
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f7e4f3] text-[#e83ead]"><Icon className="size-6" /></div>
                  <h3 className="mt-3 text-sm font-semibold text-[#21182b]">{b.title}</h3>
                  <p className="mt-1 text-xs text-[#766b80]">{b.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    case "specs": {
      const specs = s.specs as { label: string; value: string }[]
      const layout = s.layout as string
      return (
        <div className="p-10" style={{ background: bg }}>
          <h2 className="text-2xl font-bold tracking-tight text-[#21182b]">{s.title as string}</h2>
          {layout === "cards" ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {specs.map((sp, i) => (
                <div key={i} className="rounded-xl border border-[#eae2f0] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#aa97b0]">{sp.label}</p>
                  <p className="mt-1 text-sm text-[#21182b]">{sp.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <table className="mt-6 w-full text-sm">
              <tbody>
                {specs.map((sp, i) => (
                  <tr key={i} className="border-b border-[#eae2f0]">
                    <td className="py-3 pr-4 font-medium text-[#766b80]">{sp.label}</td>
                    <td className="py-3 text-[#21182b]">{sp.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )
    }
    case "story": {
      const pos = s.imagePosition as string
      return (
        <div className={`grid items-center gap-0 md:grid-cols-2`} style={{ background: bg, color: text }}>
          <div className={`p-10 ${pos === "right" ? "order-2" : "order-1"}`}>
            {(s.eyebrow as string) && <span className="text-xs font-semibold uppercase tracking-[0.18em] opacity-90">{s.eyebrow as string}</span>}
            <h2 className="mt-2 text-3xl font-bold tracking-tight">{s.title as string}</h2>
            <p className="mt-4 text-base opacity-85">{s.body as string}</p>
          </div>
          <div className={`h-full min-h-[300px] overflow-hidden ${pos === "right" ? "order-1" : "order-2"}`}>
            {(s.imageUrl as string) && <img src={s.imageUrl as string} alt="" className="size-full object-cover" />}
          </div>
        </div>
      )
    }
    case "reviews": {
      const reviews = s.reviews as { author: string; rating: number; text: string }[]
      return (
        <div className="p-10" style={{ background: bg }}>
          <h2 className="text-center text-2xl font-bold tracking-tight text-[#21182b]">{s.title as string}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-2xl border border-[#eae2f0] bg-white p-5">
                <Stars rating={r.rating} />
                <p className="mt-3 text-sm text-[#21182b]">{r.text}</p>
                <p className="mt-3 text-xs font-semibold text-[#766b80]">— {r.author}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case "faq": {
      const items = s.items as { question: string; answer: string }[]
      return (
        <div className="p-10" style={{ background: bg }}>
          <h2 className="text-center text-2xl font-bold tracking-tight text-[#21182b]">{s.title as string}</h2>
          <div className="mx-auto mt-6 max-w-2xl flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i} className="rounded-xl border border-[#eae2f0] bg-white p-4">
                <p className="text-sm font-semibold text-[#21182b]">{item.question}</p>
                <p className="mt-1 text-sm text-[#766b80]">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case "cta": {
      const align = s.alignment as string
      return (
        <div className="p-12 text-center" style={{ background: bg, color: text, textAlign: align as "left" | "center" }}>
          <h2 className="text-3xl font-bold tracking-tight">{s.title as string}</h2>
          <p className="mt-3 text-base opacity-85">{s.subtitle as string}</p>
          <button className={`mt-6 rounded-full bg-white px-8 py-3 text-sm font-semibold ${align === "center" ? "" : ""}`} style={{ color: "#21182b" }}>{s.buttonLabel as string}</button>
        </div>
      )
    }
  }
}

// ---------- Main page ----------
export default function PageEditorPage() {
  const auth = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template") || "modern-minimal"
  const [sections, setSections] = useState<PageSection[]>(initialSections)
  const [templateName, setTemplateName] = useState("Demo template")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [pageTitle, setPageTitle] = useState("Aurora Hydrating Serum — Product Page")
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [generationState, setGenerationState] = useState<"loading" | "loaded" | "empty" | "error">("loading")
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [mediaAssets, setMediaAssets] = useState<EditorMediaAsset[]>(() => mediaFromSections(initialSections()))
  const [showMedia, setShowMedia] = useState(true)
  const [showImageGenerator, setShowImageGenerator] = useState(false)
  const [imageTargetId, setImageTargetId] = useState<string | null>(null)

  // Undo / redo
  const undoStack = useRef<PageSection[][]>([])
  const redoStack = useRef<PageSection[][]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const selected = sections.find((s) => s.id === selectedId) || null

  const pushHistory = useCallback((prev: PageSection[]) => {
    undoStack.current.push(prev)
    if (undoStack.current.length > 50) undoStack.current.shift()
    redoStack.current = []
    setCanUndo(undoStack.current.length > 0)
    setCanRedo(false)
  }, [])

  const updateSections = useCallback((updater: (prev: PageSection[]) => PageSection[], track = true) => {
    setSections((prev) => {
      if (track) pushHistory(prev)
      return updater(prev)
    })
    if (track) setSaveStatus("unsaved")
  }, [pushHistory])

  const updateSettings = useCallback((id: string, settings: Record<string, unknown>) => {
    setSections((prev) => {
      // Track history only on first change of this edit — use a light approach: push every time
      undoStack.current.push(prev)
      if (undoStack.current.length > 50) undoStack.current.shift()
      redoStack.current = []
      setCanUndo(true)
      setCanRedo(false)
      return prev.map((s) => s.id === id ? { ...s, settings } : s)
    })
    setSaveStatus("unsaved")
  }, [])

  const undo = useCallback(() => {
    const prev = undoStack.current.pop()
    if (!prev) return
    setSections((current) => {
      redoStack.current.push(current)
      return prev
    })
    setCanUndo(undoStack.current.length > 0)
    setCanRedo(redoStack.current.length > 0)
    setSaveStatus("unsaved")
  }, [])

  const redo = useCallback(() => {
    const next = redoStack.current.pop()
    if (!next) return
    setSections((current) => {
      undoStack.current.push(current)
      return next
    })
    setCanUndo(true)
    setCanRedo(redoStack.current.length > 0)
    setSaveStatus("unsaved")
  }, [])

  // Drag and drop
  const dragIndex = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (i: number) => { dragIndex.current = i }
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIndex(i) }
  const handleDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    const from = dragIndex.current
    if (from === null || from === i) { dragIndex.current = null; setDragOverIndex(null); return }
    updateSections((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(i, 0, moved)
      return next
    })
    dragIndex.current = null
    setDragOverIndex(null)
  }

  const addMediaToSection = useCallback((asset: EditorMediaAsset, sectionId: string) => {
    updateSections((prev) => prev.map((section) => {
      if (section.id !== sectionId) return section
      if (section.type === "gallery") {
        const images = Array.isArray(section.settings.images) ? [...section.settings.images as Array<Record<string, unknown>>] : []
        return { ...section, settings: { ...section.settings, images: [...images, { url: asset.url, alt: asset.alt }] } }
      }
      return { ...section, settings: { ...section.settings, imageUrl: asset.url, imageAlt: asset.alt } }
    }))
  }, [updateSections])

  const handleCanvasDrop = (event: React.DragEvent, sectionId: string) => {
    event.preventDefault()
    const media = event.dataTransfer.getData("application/x-mercury-media")
    if (media) { try { addMediaToSection(JSON.parse(media) as EditorMediaAsset, sectionId) } catch { /* Ignore malformed drag payloads. */ } }
    const componentType = event.dataTransfer.getData("application/x-mercury-component") as SectionType
    if (componentType && SECTION_TYPES.includes(componentType)) addSection(componentType)
  }

  const handleGeneratedAsset = (asset: GeneratedImageAsset) => {
    const editorAsset: EditorMediaAsset = { ...asset, alt: asset.alt, source: "generated" }
    setMediaAssets((prev) => [editorAsset, ...prev.filter((candidate) => candidate.id !== editorAsset.id)])
    if (imageTargetId) addMediaToSection(editorAsset, imageTargetId)
    setShowImageGenerator(false)
    setImageTargetId(null)
  }

  // Section actions
  const addSection = (type: SectionType) => {
    const ns = makeDefaultSection(type)
    updateSections((prev) => [...prev, ns])
    setSelectedId(ns.id)
    setShowAddMenu(false)
  }
  const duplicateSection = (id: string) => {
    updateSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx === -1) return prev
      const copy = { ...prev[idx], id: uid(), name: prev[idx].name + " copy" }
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
  }
  const deleteSection = (id: string) => {
    updateSections((prev) => prev.filter((s) => s.id !== id))
    if (selectedId === id) setSelectedId(null)
  }
  const toggleVisible = (id: string) => {
    updateSections((prev) => prev.map((s) => s.id === id ? { ...s, visible: !s.visible } : s))
  }
  const moveSection = (id: string, dir: -1 | 1) => {
    updateSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx === -1 || idx + dir < 0 || idx + dir >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[idx + dir]] = [next[idx + dir], next[idx]]
      return next
    })
  }

  // Save (simulated — no database)
  const handleSave = useCallback(() => {
    setSaveStatus("saving")
    setTimeout(() => setSaveStatus("saved"), 800)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
      else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo() }
      else if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); handleSave() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo, handleSave])

  // Auth guard and latest generated product loading
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) router.push("/signin")
  }, [auth.isLoading, auth.isAuthenticated, router])

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) return
    const loadLatestGeneration = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
        const response = await fetch(`${baseUrl}/jobs`, { headers: { Authorization: `Bearer ${auth.token}` } })
        if (!response.ok) throw new Error("Unable to load your generated product")
        const jobs = await response.json() as Array<{ _id?: string; id?: string; status?: string; result?: AIExtractResponse }>
        const selectedJobId = searchParams.get("jobId")
        const selected = selectedJobId
          ? jobs.find((job) => (job._id || job.id) === selectedJobId)
          : undefined
        const latest = selected || jobs.find((job) => job.status === "completed" && job.result)
        if (!latest?.result || latest.status !== "completed") { setGenerationState("empty"); return }
        const templateId = latest.result.template_id || (latest as { template_id?: string }).template_id
        const generated = mapAIExtractToSections(latest.result, templateId) as PageSection[]
        setSections(generated)
        setMediaAssets(mediaFromSections(generated))
        setTemplateName(getPageTemplate(templateId).name)
        setPageTitle(`${String(latest.result.new_title || latest.result.title || "Product")} — Product Page`)
        setGenerationState("loaded")
      } catch (error) {
        setGenerationState("error")
        setGenerationError(error instanceof Error ? error.message : "Unable to load generated product")
      }
    }
    void loadLatestGeneration()
  }, [auth.isAuthenticated, auth.token, searchParams])

  const handleBack = () => {
    if (saveStatus === "unsaved") setShowExitModal(true)
    else router.push("/crm-dashboard")
  }

  const previewWidth = previewMode === "mobile" ? "max-w-[390px]" : "max-w-full"

  return (
    <div className="flex h-screen overflow-hidden bg-[#fcfafd] text-[#21182b]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#eae2f0] bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="flex size-9 items-center justify-center rounded-lg text-[#766b80] transition hover:bg-[#f9f2f8] hover:text-[#21182b]">
              <ChevronLeft className="size-5" />
            </button>
            <div className="hidden sm:block">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#aa97b0]">Template</span>
                <span className="rounded-full bg-[#f3eafa] px-2 py-0.5 text-[10px] font-semibold text-[#6425c7]">{templateName}</span>
              </div>
              <input
                value={pageTitle}
                onChange={(e) => { setPageTitle(e.target.value); setSaveStatus("unsaved") }}
                className="w-64 rounded-lg border border-transparent px-2 py-1 text-sm font-semibold text-[#21182b] transition hover:border-[#eae2f0] focus:border-[#e83ead] focus:outline-none focus:ring-2 focus:ring-[#e83ead]/20 lg:w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo / Redo */}
            <button onClick={undo} disabled={!canUndo} className="flex size-9 items-center justify-center rounded-lg border border-[#eae2f0] text-[#766b80] transition hover:bg-[#f9f2f8] disabled:opacity-40 disabled:hover:bg-white" title="Undo (Ctrl+Z)">
              <Undo2 className="size-4" />
            </button>
            <button onClick={redo} disabled={!canRedo} className="flex size-9 items-center justify-center rounded-lg border border-[#eae2f0] text-[#766b80] transition hover:bg-[#f9f2f8] disabled:opacity-40 disabled:hover:bg-white" title="Redo (Ctrl+Y)">
              <Redo2 className="size-4" />
            </button>

            <div className="mx-1 h-6 w-px bg-[#eae2f0]" />

            {/* Preview toggle */}
            <div className="flex items-center rounded-lg border border-[#eae2f0] p-0.5">
              <button onClick={() => setPreviewMode("desktop")} className={`flex size-8 items-center justify-center rounded-md transition ${previewMode === "desktop" ? "bg-[#f7e4f3] text-[#e83ead]" : "text-[#aa97b0] hover:text-[#21182b]"}`} title="Desktop preview">
                <Monitor className="size-4" />
              </button>
              <button onClick={() => setPreviewMode("mobile")} className={`flex size-8 items-center justify-center rounded-md transition ${previewMode === "mobile" ? "bg-[#f7e4f3] text-[#e83ead]" : "text-[#aa97b0] hover:text-[#21182b]"}`} title="Mobile preview">
                <Smartphone className="size-4" />
              </button>
            </div>

            <div className="mx-1 h-6 w-px bg-[#eae2f0]" />

            {/* Save status + button */}
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {saveStatus === "saved" && <span className="flex items-center gap-1 text-[#1f9d6f]"><Check className="size-3.5" /> Saved</span>}
              {saveStatus === "saving" && <span className="flex items-center gap-1 text-[#6425c7]"><Loader2 className="size-3.5 animate-spin" /> Saving...</span>}
              {saveStatus === "unsaved" && <span className="text-[#d99a2b]">Unsaved changes</span>}
            </div>
            <button onClick={handleSave} className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-[#e83ead] to-[#6425c7] px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
              <Save className="size-4" /> Save
            </button>
          </div>
        </header>

        {/* 3-panel layout */}
        {generationState === "loading" && <div className="border-b border-[#eae2f0] bg-[#f9f2f8] px-4 py-2 text-xs text-[#766b80]">Loading your latest generated product…</div>}
        {generationState === "error" && <div role="alert" className="border-b border-[#f4c6ce] bg-[#fce8ec] px-4 py-2 text-xs text-[#a8324b]">{generationError}. You can use the sample page while we retry.</div>}
        {generationState === "empty" && <div className="border-b border-[#eae2f0] bg-[#f9f2f8] px-4 py-2 text-xs text-[#766b80]">No generated product yet. Showing the sample page as a demo.</div>}

        <div className="flex flex-1 overflow-hidden">
          {/* Left: section navigator */}
          <aside className="hidden w-64 shrink-0 flex-col border-r border-[#eae2f0] bg-white md:flex">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#eae2f0]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#766b80]">Sections</h3>
              <span className="text-xs text-[#aa97b0]">{sections.length}</span>
            </div>
            <div className="border-b border-[#eae2f0] p-3">
              <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-wider text-[#766b80]">Component library</span><LayoutGrid className="size-3.5 text-[#aa97b0]" /></div>
              <div className="grid grid-cols-2 gap-1.5">
                {SECTION_TYPES.map((type) => <button key={type} draggable onDragStart={(event) => { event.dataTransfer.setData("application/x-mercury-component", type); event.dataTransfer.effectAllowed = "copy" }} onClick={() => addSection(type)} className="rounded-md border border-dashed border-[#d6b9df] px-2 py-1.5 text-left text-[10px] font-medium text-[#8e267e] hover:bg-[#f9f2f8]">+ {SECTION_LABELS[type]}</button>)}
              </div>
              <p className="mt-2 text-[10px] text-[#aa97b0]">Drag a component onto the canvas or click to add it.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {sections.map((section, i) => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={(e) => handleDrop(e, i)}
                  onDragEnd={() => { setDragOverIndex(null); dragIndex.current = null }}
                  onClick={() => setSelectedId(section.id)}
                  className={`group mb-1 flex items-center gap-2 rounded-lg border px-2 py-2.5 cursor-pointer transition ${
                    selectedId === section.id ? "border-[#e83ead] bg-[#f7e4f3]" :
                    dragOverIndex === i ? "border-[#6425c7] bg-[#efe6fa]" :
                    "border-transparent hover:bg-[#f9f2f8]"
                  } ${!section.visible ? "opacity-50" : ""}`}
                >
                  <GripVertical className="size-4 shrink-0 cursor-grab text-[#c9b8cf] active:cursor-grabbing" />
                  <span className="flex-1 truncate text-sm font-medium text-[#21182b]">{section.name}</span>
                  <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, -1) }} className="rounded p-1 text-[#aa97b0] hover:bg-white hover:text-[#21182b]" title="Move up"><ArrowUp className="size-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 1) }} className="rounded p-1 text-[#aa97b0] hover:bg-white hover:text-[#21182b]" title="Move down"><ArrowDown className="size-3" /></button>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleVisible(section.id) }} className="rounded p-1 text-[#aa97b0] hover:bg-white hover:text-[#21182b]" title={section.visible ? "Hide" : "Show"}>
                    {section.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  </button>
                </div>
              ))}
            </div>
            {/* Add section */}
            <div className="relative border-t border-[#eae2f0] p-2">
              {showAddMenu ? (
                <div className="rounded-lg border border-[#eae2f0] bg-white p-2 shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#766b80]">Add section</span>
                    <button onClick={() => setShowAddMenu(false)} className="text-[#aa97b0] hover:text-[#21182b]"><X className="size-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {SECTION_TYPES.map((t) => (
                      <button key={t} onClick={() => addSection(t)} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[#21182b] transition hover:bg-[#f9f2f8]">
                        <Plus className="size-3.5 text-[#e83ead]" /> {SECTION_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddMenu(true)} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#d6b9df] text-sm font-medium text-[#8e267e] transition hover:bg-[#f9f2f8]">
                  <Plus className="size-4" /> Add section
                </button>
              )}
            </div>
          </aside>

          {/* Center: live preview */}
          <main className="flex-1 overflow-y-auto bg-[#f4eef6]">
            <div className={`mx-auto my-6 ${previewWidth} transition-all duration-300`}>
              <div className="overflow-hidden rounded-2xl border border-[#eae2f0] bg-white shadow-[0_20px_60px_rgba(77,33,91,0.08)]">
                {/* Fake browser chrome */}
                <div className="flex items-center gap-2 border-b border-[#eae2f0] bg-[#f9f2f8] px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-[#e8587a]" />
                    <span className="size-2.5 rounded-full bg-[#d99a2b]" />
                    <span className="size-2.5 rounded-full bg-[#1f9d6f]" />
                  </div>
                  <div className="mx-auto flex h-6 max-w-xs flex-1 items-center rounded-md bg-white px-3 text-[10px] text-[#aa97b0]">
                    <span className="truncate">auroraskincare.com / {pageTitle.toLowerCase().replace(/\s+/g, "-")}</span>
                  </div>
                </div>
                {/* Sections */}
                <div className={`${previewMode === "mobile" ? "max-w-full" : ""}`}>
                  {sections.filter((s) => s.visible).map((section) => (
                    <div
                      key={section.id}
                      onClick={() => setSelectedId(section.id)}
                      onDragOver={(event) => { if (event.dataTransfer.types.includes("application/x-mercury-media") || event.dataTransfer.types.includes("application/x-mercury-component")) { event.preventDefault(); event.dataTransfer.dropEffect = "copy" } }}
                      onDrop={(event) => handleCanvasDrop(event, section.id)}
                      className={`relative cursor-pointer transition ${selectedId === section.id ? "ring-2 ring-[#e83ead] ring-inset" : "hover:ring-2 hover:ring-[#d6b9df] hover:ring-inset"}`}
                    >
                      {selectedId === section.id && (
                        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-[#e83ead] px-2.5 py-1 text-[10px] font-semibold text-white shadow-md">
                          <Sparkles className="size-3" /> {section.name}
                        </div>
                      )}
                      <SectionContent section={section} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Right: inspector */}
          <aside className="hidden w-80 shrink-0 flex-col border-l border-[#eae2f0] bg-white lg:flex">
            <div className="flex items-center justify-between border-b border-[#eae2f0] px-4 py-3"><span className="text-xs font-semibold uppercase tracking-wider text-[#766b80]">Inspector</span><button onClick={() => setShowMedia((value) => !value)} className="text-xs font-medium text-[#8e267e] hover:text-[#e83ead]">{showMedia ? "Hide media" : "Show media"}</button></div>
            {showMedia && <MediaLibrary assets={mediaAssets} onSelect={(asset) => { if (selectedId) addMediaToSection(asset, selectedId) }} onGenerate={() => { setImageTargetId(selectedId); setShowImageGenerator(true) }} />}
            {/* Section quick actions */}
            {selected && (
              <div className="flex items-center gap-1 border-b border-[#eae2f0] px-4 py-2">
                <button onClick={() => duplicateSection(selected.id)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#766b80] transition hover:bg-[#f9f2f8] hover:text-[#21182b]" title="Duplicate">
                  <Copy className="size-3.5" /> Duplicate
                </button>
                <button onClick={() => toggleVisible(selected.id)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#766b80] transition hover:bg-[#f9f2f8] hover:text-[#21182b]" title={selected.visible ? "Hide" : "Show"}>
                  {selected.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />} {selected.visible ? "Hide" : "Show"}
                </button>
                {(["hero", "gallery", "story"].includes(selected.type)) && <button onClick={() => { setImageTargetId(selected.id); setShowImageGenerator(true) }} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#8e267e] transition hover:bg-[#f7e4f3]" title="Generate image"><ImagePlus className="size-3.5" /> AI image</button>}
                <button onClick={() => deleteSection(selected.id)} className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#d4506a] transition hover:bg-[#fce8ec]" title="Delete">
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <Inspector section={selected} onUpdate={updateSettings} />
            </div>
          </aside>
        </div>
      </div>

      <GenerateImageDialog open={showImageGenerator} apiUrl={process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"} token={auth.token || ""} productContext={templateName || "product page"} templateId={templateId} jobId={searchParams.get("jobId") || undefined} onClose={() => { setShowImageGenerator(false); setImageTargetId(null) }} onGenerated={handleGeneratedAsset} />

      {/* Exit confirmation modal */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#21182b]/30 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-[#21182b]">Unsaved changes</h3>
              <p className="mt-2 text-sm text-[#766b80]">You have unsaved changes. Are you sure you want to leave without saving?</p>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setShowExitModal(false)} className="rounded-lg border border-[#eae2f0] px-4 py-2 text-sm font-medium text-[#766b80] transition hover:bg-[#f9f2f8]">Stay</button>
                <button onClick={() => { setShowExitModal(false); router.push("/crm-dashboard") }} className="rounded-lg bg-[#d4506a] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">Leave anyway</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
