"use client"

import { useMemo, useState } from "react"
import { ImagePlus, Search } from "lucide-react"
import type { GeneratedImageAsset } from "@/lib/image-generation"

export interface EditorMediaAsset { id: string; url: string; alt: string; source: "original" | "uploaded" | "generated"; status?: string; purpose?: string }

export function MediaLibrary({ assets, onSelect, onGenerate }: { assets: EditorMediaAsset[]; onSelect: (asset: EditorMediaAsset) => void; onGenerate: () => void }) {
  const [tab, setTab] = useState<"all" | EditorMediaAsset["source"]>("all")
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => assets.filter(asset => (tab === "all" || asset.source === tab) && asset.alt.toLowerCase().includes(query.toLowerCase())), [assets, query, tab])
  return <div className="border-b border-[#eae2f0] p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-semibold uppercase tracking-wider text-[#766b80]">Media library</h3><button onClick={onGenerate} className="flex items-center gap-1 rounded-md bg-[#f7e4f3] px-2 py-1 text-xs font-semibold text-[#8e267e] hover:bg-[#efe6fa]"><ImagePlus className="size-3.5" /> AI image</button></div><div className="relative mb-3"><Search className="absolute left-2.5 top-2.5 size-3.5 text-[#aa97b0]" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search assets" className="h-8 w-full rounded-lg border border-[#eae2f0] pl-8 pr-2 text-xs" /></div><div className="mb-3 flex gap-1 overflow-x-auto">{(["all", "original", "uploaded", "generated"] as const).map(item => <button key={item} onClick={() => setTab(item)} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${tab === item ? "bg-[#21182b] text-white" : "bg-[#f9f2f8] text-[#766b80]"}`}>{item === "all" ? "All" : item === "original" ? "Product" : item}</button>)}</div><div className="grid max-h-52 grid-cols-3 gap-2 overflow-y-auto">{filtered.map(asset => <button key={asset.id} draggable onDragStart={event => { event.dataTransfer.setData("application/x-mercury-media", JSON.stringify(asset)); event.dataTransfer.effectAllowed = "copy" }} onClick={() => onSelect(asset)} className="group overflow-hidden rounded-lg border border-[#eae2f0] bg-white text-left hover:border-[#e83ead]" title={`Use ${asset.alt}`}><img src={asset.url} alt={asset.alt} className="aspect-square w-full object-cover" /><span className="block truncate px-1.5 py-1 text-[9px] capitalize text-[#766b80]">{asset.source}</span></button>)}{filtered.length === 0 && <p className="col-span-3 py-5 text-center text-xs text-[#aa97b0]">No assets available yet.</p>}</div></div>
}
