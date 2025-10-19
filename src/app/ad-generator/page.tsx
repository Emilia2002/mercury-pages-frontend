"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/SidebarNew"
import html2canvas from "html2canvas-pro"
import {
    Sparkles,
    Download,
    Wand2,
    ArrowRight,
    Square,
    RectangleHorizontal,
    RectangleVertical,
} from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"

const BRAND_PALETTE = {
    primary: "#6366f1", // Indigo
    secondary: "#f43f5e", // Rose
    accent: "#06b6d4", // Cyan
}

interface Product { id: string; title: string; description: string; price: string; images: string[]; category: string }
interface JobResult { original_title?: string; new_title?: string; description?: string; images?: string[]; price?: string; category?: string; thumbnail?: string }
interface Job { _id: string; status: "completed" | "processing" | "pending" | "failed"; result?: JobResult }
interface AdVariation { id: string; headline: string; description: string; cta: string; template: string }
interface AdFormat { id: string; name: string; platform: string; dimensions: string; aspectRatio: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }
interface GeneratedAdSet { id: string; product: Product; format: AdFormat; variations: AdVariation[]; status: "generating" | "ready" }

const adFormats: AdFormat[] = [
    { id: "social-post", name: "Social Media Post", platform: "Instagram/Facebook", dimensions: "1080x1080", aspectRatio: "1:1", icon: Square },
    { id: "story-reel", name: "Story / Reel Format", platform: "Instagram/Facebook", dimensions: "1080x1920", aspectRatio: "9:16", icon: RectangleVertical },
    { id: "google-display", name: "Google Ad", platform: "Google", dimensions: "1200x628", aspectRatio: "16:9", icon: RectangleHorizontal },
    { id: "pinterest-tiktok", name: "Pinterest / TikTok Creative", platform: "Pinterest/TikTok", dimensions: "1080x1920", aspectRatio: "9:16", icon: RectangleVertical },
]

export default function AdGeneratorPage() {
    const [selectedProduct, setSelectedProduct] = useState<Job | null>(null)
    const [selectedFormat, setSelectedFormat] = useState<AdFormat | null>(null)
    const [generatedAdSets, setGeneratedAdSets] = useState<GeneratedAdSet[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const auth = useAuth()
    const [jobs, setJobs] = useState<Job[]>([])
    const [loadingJobs, setLoadingJobs] = useState(true)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

    const generateId = () => crypto.randomUUID()

    const handleProductSelect = (job: Job) => {
        setSelectedProduct(job)
        setGeneratedAdSets([])
    }
    const handleFormatSelect = (format: AdFormat) => setSelectedFormat(format)

    const fetchJobs = useCallback(async () => {
        if (!auth.token) return
        setLoadingJobs(true)
        try {
            const res = await fetch(`${API_BASE_URL}/jobs`, { headers: { Authorization: `Bearer ${auth.token}` } })
            if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`)
            const data = await res.json()
            setJobs(data as Job[])
        } catch (err) { console.error(err) } finally { setLoadingJobs(false) }
    }, [auth.token])

    useEffect(() => { if (auth.isAuthenticated) fetchJobs() }, [auth.isAuthenticated, fetchJobs])

    const generateAds = () => {
        if (!selectedProduct || !selectedFormat) return
        setIsGenerating(true)
        setGeneratedAdSets([])

        const productTitle = selectedProduct.result?.new_title || selectedProduct.result?.original_title || "Product"
        const productDescription = selectedProduct.result?.description || ""
        const productImages = selectedProduct.result?.images || []

        const newAdSet: GeneratedAdSet = {
            id: generateId(),
            product: { id: selectedProduct._id, title: productTitle, description: productDescription, price: selectedProduct.result?.price || "", images: productImages, category: selectedProduct.result?.category || "General" },
            format: selectedFormat,
            variations: [],
            status: "generating",
        }

        setGeneratedAdSets([newAdSet])

        setTimeout(() => {
            const completedAdSet = { ...newAdSet, status: "ready" as const, variations: [
                    { id: `${newAdSet.id}-var1`, headline: `Transform Your Life with ${productTitle}`, description: `Experience the difference. ${productDescription}`, cta: "Shop Now & Get 20% Off", template: "Product Showcase" },
                    { id: `${newAdSet.id}-var2`, headline: `Elevate Your Daily Routine`, description: `Discover premium quality with ${productTitle}.`, cta: "Discover More", template: "Lifestyle Focus" },
                    { id: `${newAdSet.id}-var3`, headline: `Final Hours: Don’t Miss Out!`, description: `This exclusive offer on ${productTitle} ends tonight!`, cta: "Claim Your Offer", template: "Promotional" },
                ]}
            setGeneratedAdSets([completedAdSet])
            setIsGenerating(false)
        }, 2500)
    }

    const exportAdVariation = async (adSet: GeneratedAdSet, variation: AdVariation) => {
        const element = document.getElementById(`ad-preview-${variation.id}`)
        if (!element) return alert("Ad preview not found")
        await new Promise(res => setTimeout(res, 100))
        const canvas = await html2canvas(element, {
            backgroundColor: "#111827",
            useCORS: true,
            logging: true,
            scale: 2,
        });

        const dataUrl = canvas.toDataURL("image/png")
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

        if (isMobile) {
            const newWindow = window.open()
            if (newWindow) {
                newWindow.document.write(`<img src="${dataUrl}" alt="Ad Image" style="width:100%;">`)
            }
        }
        else {
            const link = document.createElement("a")
            link.href = dataUrl
            link.download = `${variation.headline.replace(/\s+/g, "_")}.png`
            link.click()
        }
    }

    return (
        <div className="h-screen relative overflow-hidden bg-slate-950">
            <div className="relative z-10 flex h-screen">
                <Sidebar />
                <div className="flex-1 w-full h-full overflow-y-auto p-8">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                        <Card className=" bg-slate-900/40 border border-pink-500/20 rounded-3xl p-6 shadow-2xl shadow-pink-500/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">AI Ad Generator</h2>
                                    <p className="text-slate-300">Auto-generate ready-to-use ads from your extracted products</p>
                                </div>
                                <Badge className="bg-pink-500 text-white text-xs flex items-center space-x-1">
                                    <Sparkles className="h-3 w-3" />
                                    <span>Auto-Generated</span>
                                </Badge>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Products */}
                    {jobs.length > 0 && (
                        <Card className="bg-slate-900/50 border border-pink-500/30 rounded-3xl p-6 mb-6">
                            <h3 className="text-xl text-white mb-4">Select a Product</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {jobs.map(job => (
                                    <Card key={job._id} className={`cursor-pointer p-4 ${selectedProduct?._id === job._id ? "bg-purple-500/20 border-purple-400" : "hover:bg-slate-800/30 border-slate-600"}`} onClick={() => handleProductSelect(job)}>
                                        <img src={job.result?.thumbnail || job.result?.images?.[0] || "/placeholder.svg"} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
                                        <h4 className="text-white font-medium text-sm">{job.result?.new_title || job.result?.original_title || "Untitled"}</h4>
                                        <p className="text-slate-300 text-xs line-clamp-2">{job.result?.description}</p>
                                    </Card>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Ad Formats */}
                    {selectedProduct && (
                        <Card className="bg-slate-900/80 border border-pink-500/30 rounded-3xl p-6 mb-6">
                            <h3 className="text-xl text-white mb-4">Choose an Ad Format</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {adFormats.map(format => (
                                    <Card key={format.id} className={`cursor-pointer p-4 flex items-center space-x-4 ${selectedFormat?.id === format.id ? "bg-purple-500/20 border-purple-400" : "hover:bg-slate-800/30 border-slate-600"}`} onClick={() => handleFormatSelect(format)}>
                                        <div style={{ backgroundColor: "rgba(99,102,241,0.2)" }} className="p-3 rounded-full">
                                            <format.icon className="w-6 h-6" style={{ color: BRAND_PALETTE.primary }} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{format.name}</h4>
                                            <p className="text-slate-400 text-sm">{format.platform}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Generate Ads */}
                    {selectedProduct && selectedFormat && (
                        <div className="text-center mb-6">
                            <Button onClick={generateAds} disabled={isGenerating} size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-2">
                                <Wand2 className="mr-2 h-5 w-5" />
                                {isGenerating ? "Generating..." : "Generate Ads"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Generated Ads */}
                    {generatedAdSets.map(adSet => (
                        <Card key={adSet.id} className="bg-slate-900/80 border border-pink-500/30 rounded-3xl p-6 mb-6">
                            <h3 className="text-xl text-white mb-4 flex items-center"><Sparkles className="mr-2 h-5 w-5 text-pink-400" />Your AI-Generated Ads</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {adSet.variations.map((variation) => (
                                    <Card key={variation.id} className="bg-slate-800/80 border border-slate-600 rounded-xl p-4 flex flex-col">
                                        {/* Reverted to clean Tailwind classes */}
                                        <Badge className="bg-purple-500/20 text-purple-400 text-xs mb-2">
                                            {variation.template}
                                        </Badge>

                                        {/* Reverted to clean Tailwind classes */}
                                        <div id={`ad-preview-${variation.id}`} className="bg-slate-900 rounded-lg p-3 flex-1">

                                            {/* Reverted to clean Tailwind gradient classes */}
                                            <div className={`bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden ${adSet.format.aspectRatio === "1:1" ? "aspect-square" : adSet.format.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-[16/9]"}`}>
                                                <img src={adSet.product.images[0] || "/placeholder.svg"} alt="Ad preview" className="w-full h-full object-cover" />

                                                {/* Reverted to clean Tailwind gradient classes */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <h4 className="text-white font-bold text-sm mb-1 line-clamp-2">{variation.headline}</h4>
                                                    <p className="text-slate-200 text-xs mb-2 line-clamp-3">{variation.description}</p>
                                                    <Button size="sm" className="bg-white text-black text-xs px-3 py-1 rounded-full">{variation.cta}</Button>
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" className="mt-2 w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" onClick={() => exportAdVariation(adSet, variation)}>
                                            <Download className="mr-1 h-3 w-3" />Export Ad
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        </Card>
                    ))}

                </div>
            </div>
        </div>
    )
}
