"use client"
import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Sidebar from '@/components/SidebarNew'

import {
    Search,
    Edit,
    ExternalLink,
    Clock,
    CheckCircle,
    XCircle,
    Loader,
    ShoppingBag,
    Calendar,
    Sparkles,
    ArrowRight,
} from "lucide-react"
import {useAuth} from "@/contexts/AuthContext";

interface JobResult {
    original_title?: string;
    new_title?: string;
    title?: string;
    description?: string;
    images?: string[];
    variants?: Record<string, string[]>;
    price?: string;
    category?: string;
    benefits_list?: string[];
    availability?: boolean;
    thumbnail?: string;
}

interface Job {
    _id: string;
    url: string;
    status: "completed" | "processing" | "pending" | "failed";
    created_at?: string;
    error?: string;
    result?: JobResult;
    exported?: boolean;
}

const statusConfig = {
    completed: {
        icon: CheckCircle,
        color: "text-[#1f9d6f]",
        bg: "bg-[#e6f6f0]",
        label: "Completed",
    },
    processing: {
        icon: Loader,
        color: "text-[#6425c7]",
        bg: "bg-[#efe6fa]",
        label: "Processing",
    },
    pending: {
        icon: Clock,
        color: "text-[#d99a2b]",
        bg: "bg-[#fbf1e2]",
        label: "Pending",
    },
    failed: {
        icon: XCircle,
        color: "text-[#d4506a]",
        bg: "bg-[#fce8ec]",
        label: "Failed",
    },
}

export default function MyPagesPage() {
    const auth = useAuth()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortBy, setSortBy] = useState("newest")
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            router.push('/signin');
        }
    }, [auth.isLoading, auth.isAuthenticated, router]);

    const fetchJobs = useCallback(async () => {
        if (!auth.token) return;
        setLoadingJobs(true);
        try {
            const response = await fetch(`${API_BASE_URL}/jobs`, {
                headers: {Authorization: `Bearer ${auth.token}`},
            });
            if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);
            const data = await response.json();
            setJobs(data as Job[]);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoadingJobs(false);
        }
    }, [auth.token, API_BASE_URL]);

    useEffect(() => {
        if (auth.isAuthenticated) fetchJobs();
    }, [auth.isAuthenticated, fetchJobs]);

    const sortedPages = useMemo(() => {
        let filtered = jobs.filter(job => {
            const matchesSearch = job.result?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.url.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        if (sortBy === 'oldest') {
            filtered = filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        } else {
            filtered = filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        }

        return filtered;
    }, [jobs, searchTerm, statusFilter, sortBy]);

    const totalPages = jobs.length;
    const completedPages = jobs.filter(job => job.status === 'completed').length;
    const [exportLoading, setExportLoading] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [exportSuccess, setExportSuccess] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        new_title: "",
        description: "",
        benefits: "",
        price: "",
        category: "",
    });

    const handleSaveEdit = () => {
        if (!selectedJob) return;

        const updatedJobs = jobs.map(job => {
            if (job._id === selectedJob._id) {
                return {
                    ...job,
                    result: {
                        ...job.result,
                        new_title: editForm.new_title,
                        description: editForm.description,
                        price: editForm.price,
                        category: editForm.category,
                    },
                };
            }
            return job;
        });

        setJobs(updatedJobs);
        setIsEditModalOpen(false);

        fetch(`${API_BASE_URL}/jobs/${selectedJob._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify(editForm),
        });
    };

    const handleExportToShopify = async (job: Job) => {
        if (!auth.token) {
            setExportError('No auth token.');
            return;
        }

        const payload = {
            new_title: job.result?.new_title || job.result?.title || "Untitled Product",
            description: job.result?.description,
            images: job.result?.images,
            variants: job.result?.variants || {},
            price: job.result?.price,
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

    return (
        <div className="min-h-screen bg-[#fcfafd] text-[#21182b]">
            <div className="flex h-screen">
                <Sidebar/>
                <div className="flex-1 w-full h-full overflow-y-auto">
                    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:py-10">
                        {/* Header */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e83ead]">Library</p>
                                    <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#21182b] sm:text-4xl">My Pages</h1>
                                    <p className="mt-2 text-[#766b80]">Manage your generated product pages and track performance.</p>
                                </div>
                                <Badge className="bg-[#f7e4f3] text-[#8e267e] border-0">
                                    <Sparkles className="mr-1 size-3" />
                                    Auto-Generated
                                </Badge>
                            </div>
                        </motion.div>

                        {/* Stats */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="mt-8 grid grid-cols-2 gap-4">
                            <Card className="rounded-2xl border border-[#eae2f0] bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-[#766b80]">Total Pages</p>
                                        <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#21182b]">{totalPages}</p>
                                    </div>
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#f7e4f3] text-[#e83ead]">
                                        <ShoppingBag className="size-5" />
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
                        </motion.div>

                        {/* Filters */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mt-6">
                            <Card className="rounded-2xl border border-[#eae2f0] bg-white p-5 shadow-sm">
                                <div className="flex flex-col gap-3 md:flex-row">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#aa97b0]" />
                                            <Input
                                                placeholder="Search pages by title or category..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="h-10 rounded-xl border border-[#eae2f0] bg-white px-3 text-sm text-[#21182b] focus:outline-none focus:ring-2 focus:ring-[#e83ead]/20 focus:border-[#e83ead]"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="completed">Completed</option>
                                            <option value="processing">Processing</option>
                                            <option value="pending">Pending</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="h-10 rounded-xl border border-[#eae2f0] bg-white px-3 text-sm text-[#21182b] focus:outline-none focus:ring-2 focus:ring-[#e83ead]/20 focus:border-[#e83ead]"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Pages grid */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                            {loadingJobs && (
                                <div className="col-span-full flex flex-col items-center py-16 text-[#aa97b0]">
                                    <div className="size-8 rounded-full border-2 border-[#e83ead] border-t-transparent animate-spin" />
                                    <p className="mt-3 text-sm">Fetching your pages...</p>
                                </div>
                            )}

                            {!loadingJobs && sortedPages.map((page, index) => {
                                const statusKey = page.status as keyof typeof statusConfig;
                                const StatusIcon = statusConfig[statusKey]?.icon || Clock;
                                const result = page.result || {};
                                const displayTitle = result.new_title || result.title || "Untitled Product Page";
                                const thumbnail = result.thumbnail || result.images?.[0] || '/placeholder.png';
                                return (
                                    <motion.div key={page._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}>
                                        <Card className="group overflow-hidden rounded-2xl border border-[#eae2f0] bg-white shadow-sm transition hover:border-[#d6b9df] hover:shadow-[0_18px_50px_rgba(77,33,91,0.08)]">
                                            <div className="relative h-44 overflow-hidden bg-[#f9f2f8]">
                                                <img src={thumbnail} alt={displayTitle} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={(e) => (e.currentTarget.src = '/placeholder.png')} />
                                                <div className="absolute right-3 top-3">
                                                    <Badge className={`${statusConfig[statusKey].bg} ${statusConfig[statusKey].color} border-0`}>
                                                        <StatusIcon className="mr-1 size-3" />
                                                        {statusConfig[statusKey].label}
                                                    </Badge>
                                                </div>
                                                {page.exported && (
                                                    <div className="absolute left-3 top-3">
                                                        <Badge className="bg-[#e6f6f0] text-[#1f9d6f] border-0">
                                                            <ShoppingBag className="mr-1 size-3" />
                                                            Exported
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <h3 className="line-clamp-2 text-base font-semibold text-[#21182b]">{displayTitle}</h3>
                                                {result.description && (
                                                    <p className="mt-1 line-clamp-2 text-sm text-[#766b80]" dangerouslySetInnerHTML={{ __html: result.description }} />
                                                )}
                                                <div className="mt-3 flex items-center gap-2 text-xs text-[#aa97b0]">
                                                    <Calendar className="size-3.5" />
                                                    {page.created_at ? new Date(page.created_at).toLocaleDateString() : '—'}
                                                </div>
                                                {result.category && (
                                                    <Badge variant="outline" className="mt-3 text-xs text-[#21182b] border-[#eae2f0]">
                                                        {result.category}
                                                    </Badge>
                                                )}
                                                <div className="mt-4 flex gap-2">
                                                    {page.status === "completed" && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 bg-gradient-to-r from-[#e83ead] to-[#6425c7] text-white hover:opacity-90"
                                                                onClick={() => router.push(`/page-editor?jobId=${encodeURIComponent(page._id)}`)}
                                                            >
                                                                <Edit className="mr-1.5 size-4" />
                                                                Open in editor
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-[#eae2f0] bg-white text-[#21182b] hover:bg-[#f9f2f8] hover:text-[#8e267e]"
                                                                onClick={() => {
                                                                    setSelectedJob(page);
                                                                    setEditForm({
                                                                        new_title: page.result?.new_title || page.result?.title || "",
                                                                        description: page.result?.description || "",
                                                                        benefits: (page.result?.benefits_list || []).join('\n'),
                                                                        price: page.result?.price || "",
                                                                        category: page.result?.category || "",
                                                                    });
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="size-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="border-[#eae2f0] bg-white text-[#21182b] hover:bg-[#f9f2f8] hover:text-[#8e267e]" onClick={() => handleExportToShopify(page)}>
                                                                <ExternalLink className="size-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {page.status === "failed" && (
                                                        <Button size="sm" className="bg-[#fce8ec] text-[#d4506a] hover:bg-[#f9dde3]">
                                                            <XCircle className="mr-1 size-4" />
                                                            Retry
                                                        </Button>
                                                    )}
                                                    {(page.status === "processing" || page.status === "pending") && (
                                                        <Button size="sm" variant="outline" disabled className="border-[#eae2f0] bg-white text-[#aa97b0]">
                                                            <Loader className="mr-1 size-4 animate-spin" />
                                                            {page.status === "processing" ? "Processing..." : "In Queue"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        {/* Empty state */}
                        {!loadingJobs && sortedPages.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#f9f2f8] text-[#6425c7]">
                                    <ShoppingBag className="size-8" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-[#21182b]">No pages found</h3>
                                <p className="mt-1 text-sm text-[#aa97b0]">
                                    {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "Start by generating your first product page"}
                                </p>
                                <Button onClick={() => router.push('/crm-dashboard')} className="mt-6 h-10 rounded-xl bg-gradient-to-r from-[#e83ead] to-[#6425c7] text-white">
                                    Generate New Page <ArrowRight className="ml-1 size-4" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Edit modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#21182b]/40 backdrop-blur-sm p-4">
                        <div className="w-full max-w-lg rounded-3xl border border-[#eae2f0] bg-white p-6 shadow-2xl">
                            <h3 className="text-lg font-semibold text-[#21182b]">Edit Product Page</h3>
                            <div className="mt-5 space-y-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#766b80]">Title</label>
                                    <Input value={editForm.new_title} onChange={(e) => setEditForm({...editForm, new_title: e.target.value})} placeholder="Product title" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#766b80]">Description</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        placeholder="Product description"
                                        className="w-full rounded-xl border border-[#eae2f0] bg-white px-3.5 py-2.5 text-sm text-[#21182b] placeholder:text-[#aa97b0] focus:outline-none focus:ring-2 focus:ring-[#e83ead]/20 focus:border-[#e83ead]"
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#766b80]">Benefits</label>
                                    <textarea
                                        value={editForm.benefits}
                                        onChange={(e) => setEditForm({...editForm, benefits: e.target.value})}
                                        placeholder="- First benefit...&#10;- Second benefit..."
                                        className="w-full rounded-xl border border-[#eae2f0] bg-white px-3.5 py-2.5 text-sm text-[#21182b]] placeholder:text-[#aa97b0] focus:outline-none focus:ring-2 focus:ring-[#e83ead]/20 focus:border-[#e83ead]"
                                        rows={5}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#766b80]">Price</label>
                                        <Input type="text" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#766b80]">Category</label>
                                        <Input type="text" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} placeholder="Category name" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <Button variant="outline" className="border-[#eae2f0] bg-white text-[#766b80] hover:bg-[#f9f2f8] hover:text-[#21182b]" onClick={() => setIsEditModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button className="bg-gradient-to-r from-[#e83ead] to-[#6425c7] text-white hover:opacity-90" onClick={() => handleSaveEdit()}>
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
