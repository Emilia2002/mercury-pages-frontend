"use client"

import React, {useEffect, useState, useCallback} from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Sidebar from '@/components/SidebarNew'
import {
    Globe,
    Link as LinkIcon,
    Sparkles,
    ShoppingBag,
    Brain,
    ArrowRight,
    Wand2,
    CheckCircle,
    Loader,
    Clock,
    XCircle,
    TrendingUp,
    FileText,
    Target,
} from "lucide-react"
import {useAuth} from "@/contexts/AuthContext";
import {useRouter} from "next/navigation";
import {motion} from "framer-motion";

interface ExtractedData {
    new_title: string;
    description: string;
    images: string[];
    variants: Record<string, string[]>;
    price: string;
    category: string;
    availability: boolean;
    benefits_list?: string[];
}

interface JobResult {
    title?: string;
    description?: string;
    images?: string[];
    variants?: Record<string, string[]>;
    price?: string;
    benefits?: string[];
}

interface Job {
    id: string;
    url: string;
    status: string;
    created_at?: string;
    error?: string;
    result?: JobResult;
}

interface BackendJob {
    _id: string;
    url: string;
    status: string;
    created_at?: string;
    error?: string;
    result?: JobResult;
}

const statusConfig: Record<string, { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; color: string; bg: string }> = {
    completed: { icon: CheckCircle, label: "Completed", color: "text-[#1f9d6f]", bg: "bg-[#e6f6f0]" },
    processing: { icon: Loader, label: "Processing", color: "text-[#6425c7]", bg: "bg-[#efe6fa]" },
    pending: { icon: Clock, label: "Pending", color: "text-[#d99a2b]", bg: "bg-[#fbf1e2]" },
    failed: { icon: XCircle, label: "Failed", color: "text-[#d4506a]", bg: "bg-[#fce8ec]" },
}

export default function CRMDashboard() {
    const auth = useAuth();
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
    const [extractError, setExtractError] = useState<string | null>(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [exportSuccess, setExportSuccess] = useState<boolean>(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            router.push('/signin');
        }
    }, [auth.isLoading, auth.isAuthenticated, router]);

    const fetchJobs = useCallback(async () => {
        if (!auth.token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/jobs`, {
                headers: {Authorization: `Bearer ${auth.token}`},
            });
            if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);
            const data: BackendJob[] = await response.json();
            const jobsWithId: Job[] = data.map((job) => ({
                id: job._id,
                url: job.url,
                status: job.status,
                created_at: job.created_at,
                error: job.error,
                result: job.result,
            }));
            setJobs(jobsWithId);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoadingJobs(false);
        }
    }, [auth.token, API_BASE_URL]);

    useEffect(() => {
        if (auth.isAuthenticated) fetchJobs();
    }, [auth.isAuthenticated, fetchJobs]);

    const handleExtractData = async () => {
        if (!url || isLoading || !auth.token) return;
        setIsLoading(true);
        setExtractError(null);
        setExtractedData(null);
        setExportSuccess(false);

        try {
            const response = await fetch(`${API_BASE_URL}/ai-extract-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({source_url: url}),
            });

            if (!response.ok && response.status != 403) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Failed to extract data. Status: ${response.status}`);
            }

            if (!response.ok && response.status == 403) {
                const errorData = await response.json();
                throw new Error(`Plan limit exceeded`);
            }

            const data: ExtractedData = await response.json();
            setExtractedData(data);
            setUrl('');
            fetchJobs();
        /* eslint-disable @typescript-eslint/no-explicit-any */
        } catch (error: any) {
            console.error('Error extracting data:');
            if (error.message.includes('Plan limit exceeded')) {
                alert("You have reached the limit of free AI generations. Please upgrade to a paid plan to continue using this feature.");
                router.push('/pricing');
            } else {
                alert("There has been a problem generating the product page. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportToShopify = async () => {
        if (!auth.token) {
            setExportError('No auth token.');
            return;
        }
        let payloadVariants: Record<string, string[]> = {};
        if (extractedData) {
            payloadVariants = extractedData.variants;
        } else if (selectedJob?.result) {
            payloadVariants = selectedJob.result.variants
                ? flattenVariants(selectedJob.result.variants)
                : { Option: [] };
        } else {
            setExportError('No data to export.');
            return;
        }

        const payload = {
            new_title: extractedData?.new_title || selectedJob?.result?.title || '',
            description: extractedData?.description || selectedJob?.result?.description || '',
            images: extractedData?.images || selectedJob?.result?.images || [],
            variants: payloadVariants,
            price: extractedData?.price || selectedJob?.result?.price || '',
        };

        setExportLoading(true);
        setExportError(null);
        setExportSuccess(false);

        try {
            const response = await fetch(`${API_BASE_URL}/shopify/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok && response.status !== 400) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to export product.');
            }

            if (!response.ok && response.status === 400) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Shopify credentials not set.');
            }

            setExportSuccess(true);
            fetchJobs();
            alert("Product exported to Shopify successfully!");
        /* eslint-disable @typescript-eslint/no-explicit-any */
        } catch (error: any) {
            console.error('Error during Shopify export:', error);
            if (error.message.includes('Shopify credentials not set')) {
                alert("Shopify credentials not set. Please connect your Shopify store.");
                router.push('/integrations-shopify');
            } else {
                alert("There has been a problem exporting to Shopify. Please try again.");
            }
            setExportError(error instanceof Error ? error.message : 'Unknown error during export.');
        } finally {
            setExportLoading(false);
        }
    };

    function flattenVariants(variants: Record<string, (string | Record<string, unknown>)[]>): Record<string, string[]> {
        const normalized: Record<string, string[]> = {};
        for (const key in variants) {
            normalized[key] = variants[key].map(v => {
                if (typeof v === 'string') return v;
                if (typeof v === 'object' && v !== null) {
                    const values = Object.values(v);
                    if (values.length > 0) {
                        return String(values[0]);
                    }
                }
                return String(v);
            });
        }
        return normalized;
    }

    const totalPages = jobs.length;
    const completedPages = jobs.filter(job => job.status === 'completed').length;
    const usageUsed = Math.min(totalPages, 10);
    const usageTotal = 10;

    const recentJobs = [...jobs]
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 6);

    return (
        <div className="min-h-screen bg-[#fcfafd] text-[#21182b]">
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 w-full h-full overflow-y-auto">
                    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:py-10">
                        {/* Welcome header */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e83ead]">Welcome back</p>
                                    <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#21182b] sm:text-4xl">Your AI workspace</h1>
                                    <p className="mt-2 text-[#766b80]">Generate polished product pages and launch-ready ad creative in minutes.</p>
                                </div>
                                <Button
                                    onClick={() => router.push('/integrations-shopify')}
                                    variant="outline"
                                    className="h-10 rounded-xl border-[#eae2f0] bg-white text-[#21182b] hover:border-[#d6b9df] hover:bg-[#f9f2f8]"
                                >
                                    <ShoppingBag className="mr-2 size-4 text-[#6425c7]" />
                                    Connect Shopify
                                </Button>
                            </div>
                        </motion.div>

                        {/* Usage indicators */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
                            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
                        >
                            <Card className="rounded-2xl border border-[#eae2f0] bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-[#766b80]">Pages generated</p>
                                        <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#21182b]">{totalPages}</p>
                                    </div>
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#f7e4f3] text-[#e83ead]">
                                        <FileText className="size-5" />
                                    </div>
                                </div>
                            </Card>
                            <Card className="rounded-2xl border border-[#eae2f0] bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-[#766b80]">Completed</p>
                                        <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#21182b]">{completedPages}</p>
                                    </div>
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#e6f6f0] text-[#1f9d6f]">
                                        <CheckCircle className="size-5" />
                                    </div>
                                </div>
                            </Card>
                            <Card className="rounded-2xl border border-[#eae2f0] bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-[#766b80]">Monthly usage</p>
                                        <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#21182b]">{usageUsed}<span className="text-base font-medium text-[#aa97b0]"> / {usageTotal}</span></p>
                                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#ead7ec]">
                                            <div className="h-full rounded-full bg-gradient-to-r from-[#e83ead] to-[#6425c7] transition-all duration-500" style={{ width: `${(usageUsed / usageTotal) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#efe6fa] text-[#6425c7]">
                                        <TrendingUp className="size-5" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Product URL generator */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                            className="mt-8"
                        >
                            <Card className="overflow-hidden rounded-3xl border border-[#eae2f0] bg-white shadow-[0_18px_50px_rgba(77,33,91,0.04)]">
                                <div className="flex items-center gap-3 border-b border-[#f0e9f1] px-6 py-5">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e83ead] to-[#6425c7] text-white shadow-lg shadow-[#e83ead]/20">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#21182b]">Generate a product page</h3>
                                        <p className="text-sm text-[#766b80]">Paste any product URL and let AI build a polished page.</p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <div className="relative flex-1">
                                            <LinkIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#aa97b0]" />
                                            <Input
                                                type="text"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleExtractData()}
                                                placeholder="Paste product URL here..."
                                                className="h-12 pl-10 text-sm"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleExtractData}
                                            disabled={isLoading}
                                            className="h-12 rounded-xl bg-gradient-to-r from-[#e83ead] to-[#6425c7] px-6 text-sm font-semibold text-white shadow-lg shadow-[#6425c7]/20 transition hover:opacity-90 hover:scale-[1.01] disabled:opacity-60"
                                        >
                                            <Brain className="mr-2 size-4" />
                                            {isLoading ? 'Generating...' : 'Generate page'}
                                        </Button>
                                    </div>

                                    {/* AI Preview */}
                                    {isLoading ? (
                                        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-[#eae2f0] bg-[#f9f2f8] py-16 text-center">
                                            <div className="size-10 rounded-full border-2 border-[#e83ead] border-t-transparent animate-spin" />
                                            <p className="mt-4 text-sm font-medium text-[#21182b]">AI is analyzing the product...</p>
                                            <p className="mt-1 text-xs text-[#aa97b0]">This may take a few moments</p>
                                        </div>
                                    ) : extractedData ? (
                                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-6 rounded-2xl border border-[#eae2f0] bg-[#f9f2f8] p-6">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                                <div className="md:col-span-1">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {extractedData.images.slice(0, 4).map((imgSrc, index) => (
                                                            <div key={index} className="aspect-square overflow-hidden rounded-xl border border-[#eae2f0] bg-white">
                                                                <img src={imgSrc || '/placeholder.png'} alt={`Product image ${index + 1}`} className="h-full w-full object-contain" onError={(e) => (e.currentTarget.src = '/placeholder.png')} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 space-y-4">
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e83ead]">Title</p>
                                                        <p className="mt-1 text-lg font-semibold text-[#21182b]">{extractedData.new_title}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e83ead]">Description</p>
                                                        <div className="mt-1 text-sm leading-relaxed text-[#766b80]" dangerouslySetInnerHTML={{__html: extractedData.description}} />
                                                    </div>
                                                    {extractedData.benefits_list && extractedData.benefits_list.length > 0 && (
                                                        <div>
                                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e83ead]">Key benefits</p>
                                                            <ul className="mt-2 space-y-1.5">
                                                                {extractedData.benefits_list.map((benefit, i) => (
                                                                    <li key={i} className="flex items-start gap-2 text-sm text-[#766b80]">
                                                                        <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-[#1f9d6f]" />
                                                                        {benefit}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                                        {extractedData.price && <span className="text-[#21182b]"><strong>Price:</strong> {extractedData.price}</span>}
                                                        {extractedData.category && <span className="text-[#21182b]"><strong>Category:</strong> {extractedData.category}</span>}
                                                        <span className="text-[#21182b]"><strong>Availability:</strong> In Stock</span>
                                                        {extractedData.variants && Object.keys(extractedData.variants).length > 0 && (
                                                            <span className="text-[#21182b]"><strong>Variants:</strong> {Object.values(extractedData.variants).flat().join(', ')}</span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        onClick={handleExportToShopify}
                                                        disabled={exportLoading}
                                                        className="h-10 rounded-xl bg-[#21182b] px-5 text-sm font-semibold text-white transition hover:bg-[#6425c7] disabled:opacity-60"
                                                    >
                                                        <ShoppingBag className="mr-2 size-4" />
                                                        {exportLoading ? 'Exporting...' : 'Export to Shopify'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#eae2f0] bg-[#f9f2f8] py-16 text-center">
                                            <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#6425c7] shadow-sm">
                                                <Globe className="size-7" />
                                            </div>
                                            <p className="mt-4 text-sm font-medium text-[#21182b]">Enter a product URL to get started</p>
                                            <p className="mt-1 text-xs text-[#aa97b0]">AI will analyze and generate an optimized product page</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Recent product pages */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
                            className="mt-8"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#21182b]">Recent product pages</h3>
                                <button onClick={() => router.push('/my-pages')} className="flex items-center gap-1 text-sm font-medium text-[#8e267e] transition hover:text-[#e83ead]">
                                    View all <ArrowRight className="size-3.5" />
                                </button>
                            </div>

                            {loadingJobs ? (
                                <Card className="rounded-2xl border border-[#eae2f0] bg-white p-10 text-center shadow-sm">
                                    <div className="mx-auto size-8 rounded-full border-2 border-[#e83ead] border-t-transparent animate-spin" />
                                    <p className="mt-4 text-sm text-[#aa97b0]">Fetching your pages...</p>
                                </Card>
                            ) : recentJobs.length === 0 ? (
                                <Card className="rounded-2xl border border-dashed border-[#eae2f0] bg-white p-10 text-center shadow-sm">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f9f2f8] text-[#6425c7]">
                                        <FileText className="size-6" />
                                    </div>
                                    <p className="mt-4 text-sm font-medium text-[#21182b]">No pages yet</p>
                                    <p className="mt-1 text-xs text-[#aa97b0]">Generate your first product page above to see it here.</p>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {recentJobs.map((job, index) => {
                                        const status = statusConfig[job.status] || statusConfig.pending;
                                        const StatusIcon = status.icon;
                                        const title = job.result?.title || job.url;
                                        const thumbnail = job.result?.images?.[0] || '/placeholder.png';
                                        return (
                                            <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.03 * index }}>
                                                <Card className="group overflow-hidden rounded-2xl border border-[#eae2f0] bg-white shadow-sm transition hover:border-[#d6b9df] hover:shadow-[0_18px_50px_rgba(77,33,91,0.08)]">
                                                    <div className="relative h-36 overflow-hidden bg-[#f9f2f8]">
                                                        <img src={thumbnail} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={(e) => (e.currentTarget.src = '/placeholder.png')} />
                                                        <div className="absolute right-3 top-3">
                                                            <Badge className={`${status.bg} ${status.color} border-0`}>
                                                                <StatusIcon className="mr-1 size-3" />
                                                                {status.label}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <p className="line-clamp-1 text-sm font-semibold text-[#21182b]">{title}</p>
                                                        <p className="mt-1 line-clamp-1 text-xs text-[#aa97b0]">{job.url}</p>
                                                        <div className="mt-3 flex items-center gap-2 text-[11px] text-[#aa97b0]">
                                                            <Clock className="size-3" />
                                                            {job.created_at ? new Date(job.created_at).toLocaleDateString() : '—'}
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>

                        {/* Ad Creative Studio entry point */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                            className="mt-8"
                        >
                            <Card className="overflow-hidden rounded-3xl border border-[#21182b] bg-gradient-to-br from-[#21182b] to-[#3a1f47] p-8 text-white">
                                <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                                    <div className="max-w-lg">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#f3a9dc]">
                                            <Wand2 className="size-3.5" />
                                            Ad Creative Studio
                                        </div>
                                        <h3 className="mt-4 text-2xl font-bold tracking-[-0.03em]">Turn your products into launch-ready ad creative.</h3>
                                        <p className="mt-2 text-sm leading-6 text-[#d6c2de]">Generate on-brand ad variations across social, story, and display formats from any product in your workspace.</p>
                                    </div>
                                    <Button
                                        onClick={() => router.push('/ad-generator')}
                                        className="h-12 shrink-0 rounded-xl bg-gradient-to-r from-[#e83ead] to-[#6425c7] px-6 text-sm font-semibold text-white shadow-lg shadow-[#e83ead]/30 transition hover:opacity-90 hover:scale-[1.01]"
                                    >
                                        <Target className="mr-2 size-4" />
                                        Open Ad Studio
                                        <ArrowRight className="ml-1 size-4" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}