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
    Target,
} from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"

const BRAND_PALETTE = {
    primary: "#e83ead",
    secondary: "#6425c7",
    accent: "#21182b",
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
                    { id: `${newAdSet.id}-var3`, headline: `Final Hours: Don\u2019t Miss Out!`, description: `This exclusive offer on ${productTitle} ends tonight!`, cta: "Claim Your Offer", template: "Promotional" },
                ]}
            setGeneratedAdSets([completedAdSet])
            setIsGenerating(false)
        }, 2500)
    }

    const exportAdVariation = async (adSet: GeneratedAdSet, variation: AdVariation) => {
        const element = document.getElementById(`ad-preview-${variation.id}`)
        if (!element) return alert("Ad preview not found")

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

        let newWindow: Window | null = null
        if (isMobile) {
            newWindow = window.open("", "_blank")
            if (!newWindow) {
                alert("Please allow popups to export image.")
                return
            }
            newWindow.document.write("<p>Generating preview...</p>")
        }

        await new Promise(res => setTimeout(res, 100))

        const canvas = await html2canvas(element, {
            backgroundColor: "#21182b",
            useCORS: true,
            scale: isMobile ? 1 : 2,
        })

        const dataUrl = canvas.toDataURL("image/png")

        if (isMobile) {
            if (newWindow) {
                newWindow.document.body.innerHTML = `<img src="${dataUrl}" alt="Ad Image" style="width:100%;height:auto;">`
            }
        } else {
            const link = document.createElement("a")
            link.href = dataUrl
            link.download = `${variation.headline.replace(/\s+/g, "_")}.png`
            document.body.appendChild(link)
            link.click()
            link.remove()
        }
    }

    return (
        <div className="min-h-screen bg-[#fcfafd] text-[#21182b]">
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 w-full h-full overflow-y-auto">
                    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:py-10">
                        {/* Header */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e83ead]">Creative</p>
                                    {/*<h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#21182b] sm:text-4xl">Ad Creative Studio</h1>*/}
                                    <p className="mt-2 text-[#766b80]">Auto-generate ready-to-use ads from your extracted products.</p>
                                </div>
                                <Badge className="bg-[#f7e4f3] text-[#8e267e] border-0">
                                    <Sparkles className="mr-1 size-3" />
                                    Auto-Generated
                                </Badge>
                            </div>
                        </motion.div>

                        {/* Products */}
                        {jobs.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="mt-8">
                                <h3 className="mb-4 text-lg font-semibold tracking-[-0.02em] text-[#21182b]">Select a product</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {jobs.map(job => (
                                        <Card
                                            key={job._id}
                                            className={`cursor-pointer overflow-hidden rounded-2xl border transition-all ${selectedProduct?._id === job._id ? "border-[#e83ead] bg-[#f7e4f3] shadow-md" : "border-[#eae2f0] bg-white hover:border-[#d6b9df] hover:shadow-sm"}`}
                                            onClick={() => handleProductSelect(job)}
                                        >
                                            <div className="h-32 overflow-hidden bg-[#f9f2f8]">
                                                <img src={job.result?.thumbnail || job.result?.images?.[0] || "/placeholder.png"} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.src = '/placeholder.png')} />
                                            </div>
                                            <div className="p-4">
                                                <h4 className="line-clamp-1 text-sm font-semibold text-[#21182b]">{job.result?.new_title || job.result?.original_title || "Untitled"}</h4>
                                                <p className="mt-1 line-clamp-2 text-xs text-[#766b80]">{job.result?.description}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {loadingJobs && (
                            <div className="mt-8 flex flex-col items-center py-12 text-[#aa97b0]">
                                <div className="size-8 rounded-full border-2 border-[#e83ead] border-t-transparent animate-spin" />
                                <p className="mt-3 text-sm">Loading your products...</p>
                            </div>
                        )}

                        {/* Ad Formats */}
                        {selectedProduct && (
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mt-8">
                                <h3 className="mb-4 text-lg font-semibold tracking-[-0.02em] text-[#21182b]">Choose an ad format</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {adFormats.map(format => (
                                        <Card
                                            key={format.id}
                                            className={`cursor-pointer rounded-2xl border p-4 transition-all ${selectedFormat?.id === format.id ? "border-[#6425c7] bg-[#efe6fa] shadow-md" : "border-[#eae2f0] bg-white hover:border-[#d6b9df] hover:shadow-sm"}`}
                                            onClick={() => handleFormatSelect(format)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#6425c7] shadow-sm">
                                                    <format.icon className="size-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-[#21182b]">{format.name}</h4>
                                                    <p className="text-xs text-[#aa97b0]">{format.platform}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Generate button */}
                        {selectedProduct && selectedFormat && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
                                <Button onClick={generateAds} disabled={isGenerating} className="h-12 rounded-xl bg-gradient-to-r from-[#e83ead] to-[#6425c7] px-8 text-sm font-semibold text-white shadow-lg shadow-[#6425c7]/20 transition hover:opacity-90 hover:scale-[1.01] disabled:opacity-60">
                                    <Wand2 className="mr-2 size-5" />
                                    {isGenerating ? "Generating..." : "Generate Ads"}
                                    <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </motion.div>
                        )}

                        {/* Generated Ads */}
                        {generatedAdSets.map(adSet => (
                            <motion.div key={adSet.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-8">
                                <Card className="rounded-3xl border border-[#eae2f0] bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 flex items-center text-lg font-semibold tracking-[-0.02em] text-[#21182b]">
                                        <Sparkles className="mr-2 size-5 text-[#e83ead]" />
                                        Your AI-Generated Ads
                                    </h3>
                                    {adSet.status === "generating" ? (
                                        <div className="flex flex-col items-center py-12 text-[#aa97b0]">
                                            <div className="size-8 rounded-full border-2 border-[#e83ead] border-t-transparent animate-spin" />
                                            <p className="mt-3 text-sm">Creating ad variations...</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                            {adSet.variations.map((variation) => (
                                                <Card key={variation.id} className="flex flex-col rounded-2xl border border-[#eae2f0] bg-[#f9f2f8] p-4">
                                                    <Badge className="mb-3 w-fit bg-[#efe6fa] text-[#6425c7] border-0 text-xs">
                                                        {variation.template}
                                                    </Badge>
                                                    <div id={`ad-preview-${variation.id}`} className="flex-1 overflow-hidden rounded-xl">
                                                        <div className={`relative flex items-center justify-center overflow-hidden rounded-xl ${adSet.format.aspectRatio === "1:1" ? "aspect-square" : adSet.format.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-[16/9]"}`}>
                                                            <img src={adSet.product.images[0] || "/placeholder.png"} alt="Ad preview" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.src = '/placeholder.png')} />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#21182b]/80 via-[#21182b]/20 to-transparent" />
                                                            <div className="absolute bottom-4 left-4 right-4">
                                                                <h4 className="line-clamp-2 text-sm font-bold text-white">{variation.headline}</h4>
                                                                <p className="mt-1 line-clamp-3 text-xs text-white/80">{variation.description}</p>
                                                                <span className="mt-2 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#21182b]">{variation.cta}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" className="mt-3 w-full bg-[#21182b] text-white hover:bg-[#6425c7]" onClick={() => exportAdVariation(adSet, variation)}>
                                                        <Download className="mr-1 size-3.5" /> Export Ad
                                                    </Button>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ))}

                        {/* Empty hint */}
                        {jobs.length === 0 && !loadingJobs && (
                            <div className="mt-12 flex flex-col items-center py-16 text-center">
                                <div className="flex size-16 items-center justify-center rounded-2xl bg-[#f9f2f8] text-[#6425c7]">
                                    <Target className="size-8" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-[#21182b]">No products yet</h3>
                                <p className="mt-1 text-sm text-[#aa97b0]">Generate a product page first, then come back to create ads.</p>
                                <Button onClick={() => window.location.href = '/crm-dashboard'} className="mt-6 h-10 rounded-xl bg-gradient-to-r from-[#e83ead] to-[#6425c7] text-white">
                                    Go to Dashboard <ArrowRight className="ml-1 size-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}