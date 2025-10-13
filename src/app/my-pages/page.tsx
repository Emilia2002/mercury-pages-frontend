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
    id: string;
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
        color: "text-emerald-400",
        bg: "bg-emerald-500/20",
        label: "Completed",
    },
    processing: {
        icon: Loader,
        color: "text-cyan-400",
        bg: "bg-cyan-500/20",
        label: "Processing",
    },
    pending: {
        icon: Clock,
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
        label: "Pending",
    },
    failed: {
        icon: XCircle,
        color: "text-red-400",
        bg: "bg-red-500/20",
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
    const [job] = useState<Job | null>(null);
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
        } else { // default to newest
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
        price: "",
        category: "",
    });

    const handleSaveEdit = () => {
        if (!selectedJob) return;

        const updatedJobs = jobs.map(job => {
            if (job.id === selectedJob.id) {
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

        fetch(`${API_BASE_URL}/jobs/${selectedJob.id}`, {
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
            console.log("Auth token missing");
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
        }
            /* eslint-disable  @typescript-eslint/no-explicit-any */
        catch (error: any) {
            console.error('Error during Shopify export:', error);
            if (error.message.includes('Shopify credentials not set')) {
                alert("Shopify credentials not set. Please connect your Shopify store.");
                router.push('/integrations-shopify');
            }

            else {
                alert("There has been a problem exporting to Shopify. Please try again.");
            }
            setExportError(error instanceof Error ? error.message : 'Unknown error during export.');
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <div className="h-screen relative overflow-hidden bg-slate-950">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"/>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"/>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"/>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"/>
            </div>

            <div className="flex h-screen">
                <div className="flex h-screen">
                    <Sidebar/>
                </div>
                    <div className="flex-1 w-full h-full overflow-y-auto p-8">
                        {/* Header */}
                        <Card
                            className="backdrop-blur-xl bg-slate-900/40 border border-pink-500/20 rounded-3xl p-6 shadow-2xl shadow-pink-500/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text">
                                        My Pages
                                    </h2>
                                    <p className="text-slate-300">Manage your generated product pages and track
                                        performance</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Badge className="bg-pink-500/20 text-pink-100 border border-pink-500/30">
                                        <Sparkles className="mr-1 h-3 w-3"/>
                                        Auto-Generated
                                    </Badge>
                                </div>
                            </div>
                        </Card>

                        {/* Stats Overview */}
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.1}}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                        >
                            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 p-6 rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm">Total Pages</p>
                                        <p className="text-2xl font-bold text-white">{totalPages}</p>
                                    </div>
                                    <div className="p-3 bg-cyan-500/20 rounded-lg">
                                        <ShoppingBag className="w-6 h-6 text-cyan-400"/>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 p-6 rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm">Completed</p>
                                        <p className="text-2xl font-bold text-white">{completedPages}</p>
                                    </div>
                                    <div className="p-3 bg-emerald-500/20 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-emerald-400"/>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Filters and Search */}
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.2}}
                            className="mb-8"
                        >
                            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 p-6 rounded-2xl">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"/>
                                            <Input
                                                placeholder="Search pages by title or category..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
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
                                            className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Pages Grid */}
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{delay: 0.3}}
                            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            {loadingJobs && (
                                <div className="col-span-full text-center py-12 text-slate-400 flex flex-col items-center">
                                    <Loader className="w-8 h-8 animate-spin mb-3 text-cyan-500"/>
                                    Fetching your pages...
                                </div>
                            )}

                            {!loadingJobs && sortedPages.map((page, index) => {
                                const statusKey = page.status as keyof typeof statusConfig;
                                const StatusIcon = statusConfig[statusKey]?.icon || Clock;
                                const result = page.result || {};
                                const displayTitle = result.new_title ||  "Untitled Product Page";
                                const thumbnail = result.thumbnail || result.images?.[0] || '/placeholder-image.png';

                                return (
                                    <motion.div
                                        key={page.id}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: 0.1 * index}}
                                    >
                                        <Card
                                            className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 group rounded-3xl">
                                            {/* Thumbnail */}
                                            <div className="relative h-48 overflow-hidden rounded-t-3xl">
                                                <img
                                                    src={thumbnail}
                                                    alt={displayTitle}
                                                    className="c"
                                                />
                                                <div className="absolute top-4 right-4">
                                                    <Badge
                                                        className={`${statusConfig[statusKey].bg} ${statusConfig[statusKey].color} border-0`}
                                                    >
                                                        <StatusIcon className="w-3 h-3 mr-1"/>
                                                        {statusConfig[statusKey].label}
                                                    </Badge>
                                                </div>
                                                {page.exported && (
                                                    <div className="absolute top-4 left-4">
                                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                                                            <ShoppingBag className="w-3 h-3 mr-1"/>
                                                            Exported
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                <div className="mb-4">
                                                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{displayTitle}</h3>
                                                    <div
                                                        className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                                        <Calendar className="w-4 h-4"/>
                                                        {new Date(page.created_at || '').toLocaleDateString()}
                                                    </div>
                                                    <Badge variant="outline" className="text-xs text-white">
                                                        {result.category || 'Uncategorized'}
                                                    </Badge>
                                                </div>

                                                {/*/!* Stats *!/*/}
                                                {/*{page.status === "completed" && (*/}
                                                {/*    <div*/}
                                                {/*        className="grid grid-cols-3 gap-4 mb-4 p-3 bg-slate-800/30 rounded-lg">*/}
                                                {/*        /!*<div className="text-center">*!/*/}
                                                {/*        /!*    <p className="text-xs text-slate-400">Views</p>*!/*/}
                                                {/*        /!*    <p className="text-sm font-semibold text-white">{page.result?.views?.toLocaleString()}</p>*!/*/}
                                                {/*        /!*</div>*!/*/}
                                                {/*        /!*<div className="text-center">*!/*/}
                                                {/*        /!*    <p className="text-xs text-slate-400">Conversions</p>*!/*/}
                                                {/*        /!*    <p className="text-sm font-semibold text-white">{page.result?.conversions}</p>*!/*/}
                                                {/*        /!*</div>*!/*/}
                                                {/*        /!*<div className="text-center">*!/*/}
                                                {/*        /!*    <p className="text-xs text-slate-400">Revenue</p>*!/*/}
                                                {/*        /!*    <p className="text-sm font-semibold text-white">{page.result?.revenue}</p>*!/*/}
                                                {/*        /!*</div>*!/*/}
                                                {/*    </div>*/}
                                                {/*)}*/}

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    {page.status === "completed" && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="bg-transparent text-white hover:text-white/80"
                                                                onClick={() => {
                                                                    setSelectedJob(page);
                                                                    setEditForm({
                                                                        new_title: page.result?.new_title || page.result?.title || "",
                                                                        description: page.result?.description || "",
                                                                        price: page.result?.price || "",
                                                                        category: page.result?.category || "",
                                                                    });
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>

                                                            <Button size="sm" variant="outline" className="bg-transparent text-white hover:text-white/80"
                                                                    onClick={() => handleExportToShopify(page)}> <ExternalLink className="w-4 h-4"/>
                                                            </Button>

                                                        </>
                                                    )}

                                                    {page.status === "failed" && (
                                                        <Button size="sm"
                                                                className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30">
                                                            <XCircle className="w-4 h-4 mr-1"/>
                                                            Retry
                                                        </Button>
                                                    )}

                                                    {(page.status === "processing" || page.status === "pending") && (
                                                        <Button size="sm" variant="outline"
                                                                className="flex-1 bg-transparent" disabled>
                                                            <Loader className="w-4 h-4 mr-1 animate-spin"/>
                                                            {page.status === "processing" ? "Processing..." : "In Queue"}
                                                        </Button>
                                                    )}

                                                    {/*<Button size="sm" variant="outline"*/}
                                                    {/*        className="text-red-400 hover:text-red-300 bg-transparent">*/}
                                                    {/*    <Trash2 className="w-4 h-4"/>*/}
                                                    {/*</Button>*/}
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </motion.div>

                        {/* Empty State */}
                        {sortedPages.length === 0 && (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center py-12">
                                <div
                                    className="w-24 h-24 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                                    <ShoppingBag className="w-12 h-12 text-slate-400"/>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No pages found</h3>
                                <p className="text-slate-400 mb-6">
                                    {searchTerm || statusFilter !== "all"
                                        ? "Try adjusting your search or filters"
                                        : "Start by generating your first product page"}
                                </p>
                                <Button
                                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                                    Generate New Page
                                </Button>
                            </motion.div>
                        )}
                    </div>
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg relative shadow-xl">
                            <h3 className="text-xl font-semibold text-white mb-4">Edit Product Page</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">Title</label>
                                    <Input
                                        value={editForm.new_title}
                                        onChange={(e) => setEditForm({...editForm, new_title: e.target.value})}
                                        placeholder="Product title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">Description</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        placeholder="Product description"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-1">Price</label>
                                        <Input
                                            type="text"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-sm mb-1">Category</label>
                                        <Input
                                            type="text"
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                            placeholder="Category name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <Button
                                    variant="outline"
                                    className="bg-transparent text-slate-300 hover:text-white"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                                    onClick={() => handleSaveEdit()}
                                >
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
