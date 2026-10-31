"use client"

import { useState } from "react"
import { ImagePlus, Loader2, RefreshCw, X } from "lucide-react"
import { generateProductImage, type GeneratedImageAsset, type ImagePurpose, type ImageStyle } from "@/lib/image-generation"

export function GenerateImageDialog({ open, apiUrl, token, productContext, templateId, jobId, pageId, onClose, onGenerated }: { open: boolean; apiUrl: string; token: string; productContext: string; templateId?: string; jobId?: string; pageId?: string; onClose: () => void; onGenerated: (asset: GeneratedImageAsset) => void }) {
  const [purpose, setPurpose] = useState<ImagePurpose>("hero")
  const [style, setStyle] = useState<ImageStyle>("studio")
  const [aspectRatio, setAspectRatio] = useState<"square" | "portrait" | "landscape">("landscape")
  const [prompt, setPrompt] = useState("")
  const [asset, setAsset] = useState<GeneratedImageAsset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!open) return null
  const generate = async () => {
    setLoading(true); setError(null)
    try { setAsset(await generateProductImage(apiUrl, token, { productContext, purpose, style, aspectRatio, prompt: prompt.trim() || undefined, templateId, jobId })) }
    catch (err) { setError(err instanceof Error ? err.message : "Image generation failed.") }
    finally { setLoading(false) }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#21182b]/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="generate-image-title">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#eae2f0] px-5 py-4"><div><h2 id="generate-image-title" className="flex items-center gap-2 font-semibold text-[#21182b]"><ImagePlus className="size-5 text-[#e83ead]" /> Generate with AI</h2><p className="mt-1 text-xs text-[#766b80]">Create a replacement asset without changing your original product photos.</p></div><button onClick={onClose} className="rounded-lg p-2 text-[#aa97b0] hover:bg-[#f9f2f8]" aria-label="Close"><X className="size-5" /></button></div>
      <div className="grid gap-5 p-5 md:grid-cols-[1fr_1fr]">
        <div className="space-y-4"><div><label className="text-xs font-semibold text-[#766b80]">Product context</label><p className="mt-1 rounded-lg bg-[#f9f2f8] p-3 text-sm text-[#21182b]">{productContext}</p></div><label className="block text-xs font-semibold text-[#766b80]">Image purpose<select value={purpose} onChange={e => setPurpose(e.target.value as ImagePurpose)} className="mt-1 h-10 w-full rounded-lg border border-[#eae2f0] px-3 text-sm font-normal text-[#21182b]"><option value="hero">Hero</option><option value="lifestyle">Lifestyle</option><option value="promotional">Promotional</option><option value="editorial">Editorial</option></select></label><label className="block text-xs font-semibold text-[#766b80]">Visual style<select value={style} onChange={e => setStyle(e.target.value as ImageStyle)} className="mt-1 h-10 w-full rounded-lg border border-[#eae2f0] px-3 text-sm font-normal text-[#21182b]"><option value="luxury">Luxury</option><option value="minimal">Minimal</option><option value="bold-dtc">Bold DTC</option><option value="organic">Organic</option><option value="studio">Studio Photography</option></select></label><label className="block text-xs font-semibold text-[#766b80]">Aspect ratio<select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as typeof aspectRatio)} className="mt-1 h-10 w-full rounded-lg border border-[#eae2f0] px-3 text-sm font-normal text-[#21182b]"><option value="landscape">Landscape</option><option value="square">Square</option><option value="portrait">Portrait</option></select></label><label className="block text-xs font-semibold text-[#766b80]">Optional direction<textarea value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={500} rows={3} placeholder="Warm morning light, clean marble surface…" className="mt-1 w-full rounded-lg border border-[#eae2f0] px-3 py-2 text-sm font-normal text-[#21182b]" /></label><button onClick={generate} disabled={loading} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#e83ead] to-[#6425c7] text-sm font-semibold text-white disabled:opacity-60">{loading ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : <><ImagePlus className="size-4" /> Generate image</>}</button>{error && <div role="alert" className="rounded-lg border border-[#f4c6ce] bg-[#fce8ec] p-3 text-xs text-[#a8324b]">{error}</div>}</div>
        <div className="flex min-h-64 items-center justify-center rounded-xl bg-[#f9f2f8] p-3">{asset ? <div className="w-full"><img src={asset.url} alt={asset.alt} className="max-h-80 w-full rounded-lg object-contain" /><div className="mt-3 flex gap-2"><button onClick={() => onGenerated(asset)} className="flex-1 rounded-lg bg-[#21182b] px-3 py-2 text-sm font-semibold text-white">Use image</button><button onClick={generate} disabled={loading} className="rounded-lg border border-[#eae2f0] bg-white px-3 py-2 text-sm font-semibold text-[#21182b]"><RefreshCw className="size-4" /></button></div></div> : <div className="text-center text-xs text-[#aa97b0]"><ImagePlus className="mx-auto mb-2 size-8" /><p>Your preview will appear here.</p></div>}</div>
      </div>
    </div>
  </div>
}
