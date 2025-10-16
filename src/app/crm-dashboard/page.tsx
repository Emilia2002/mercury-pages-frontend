"use client"

import React, {useEffect, useState, useCallback} from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar from '@/components/SidebarNew'
import {
    Globe,
    Link,
    Sparkles,
    ShoppingBag,
    Brain,
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

    interface BackendJob {
        _id: string;
        url: string;
        status: string;
        created_at?: string;
        error?: string;
        result?: JobResult;
    }

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

        }
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        catch (error: any) {
            console.error('Error extracting data:');
            if (error.message.includes('Plan limit exceeded')) {
                alert("You have reached the limit of free AI generations. Please upgrade to a paid plan to continue using this feature.");
                router.push('/pricing');
            }

            else {
                alert("There has been a problem generating the product page. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportToShopify = async () => {
        if (!auth.token) {
            setExportError('No auth token.');
            console.log("Auth token missing");
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
        } catch (error: any) {
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

    return (
        <div className="h-screen relative overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
            </div>

                <div className="relative z-20 flex h-screen">
                    <Sidebar/>
                <div className="flex-1 w-full h-full overflow-y-auto p-8">
                    <Card
                        className="backdrop-blur-xl bg-slate-900/40 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl shadow-cyan-500/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="md:text-3xl font-bold text-white bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text sm:text-xl">
                                    Dashboard
                                </h2>
                                <p className="text-slate-300">Welcome back! Your AI workspace awaits</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Button
                                    onClick={() => router.push('/integrations-shopify')}
                                    className="bg-gradient-to-r from-green-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white transition-all duration-300 ease-out hover:scale-[1.02] shadow-lg shadow-cyan-500/30"
                                disabled={isLoading}>
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Connect Shopify
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/*<div className="grid grid-cols-4 gap-6">*/}
                    {/*    {[*/}
                    {/*        {*/}
                    {/*            title: "Pages Generated",*/}
                    {/*            value: "1,247",*/}
                    {/*            change: "+23%",*/}
                    {/*            icon: FileText,*/}
                    {/*            color: "text-white",*/}
                    {/*            bg: "bg-cyan-500/10",*/}
                    {/*            border: "border-cyan-500/20",*/}
                    {/*        },*/}
                    {/*        {*/}
                    {/*            title: "Ads Created",*/}
                    {/*            value: "89",*/}
                    {/*            change: "+15%",*/}
                    {/*            icon: Target,*/}
                    {/*            color: "text-white",*/}
                    {/*            bg: "bg-purple-500/10",*/}
                    {/*            border: "border-purple-500/20",*/}
                    {/*        },*/}
                    {/*        {*/}
                    {/*            title: "Shopify Exports",*/}
                    {/*            value: "156",*/}
                    {/*            change: "+31%",*/}
                    {/*            icon: ShoppingBag,*/}
                    {/*            color: "text-white",*/}
                    {/*            bg: "bg-pink-500/10",*/}
                    {/*            border: "border-pink-500/20",*/}
                    {/*        },*/}
                    {/*        {*/}
                    {/*            title: "Active Projects",*/}
                    {/*            value: "12",*/}
                    {/*            change: "+8%",*/}
                    {/*            icon: Briefcase,*/}
                    {/*            color: "text-white",*/}
                    {/*            bg: "bg-emerald-500/10",*/}
                    {/*            border: "border-emerald-500/20",*/}
                    {/*        },*/}
                    {/*    ].map((stat, index) => (*/}
                    {/*        <Card*/}
                    {/*            key={index}*/}
                    {/*            className={`backdrop-blur-xl ${stat.bg} border ${stat.border} rounded-3xl p-6 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg`}*/}
                    {/*        >*/}
                    {/*            <div className="flex items-center justify-between">*/}
                    {/*                <div>*/}
                    {/*                    <p className="text-white text-sm">{stat.title}</p>*/}
                    {/*                    <p className="text-2xl font-bold text-white">{stat.value}</p>*/}
                    {/*                    <p className={`text-sm font-bold ${stat.color}`}>{stat.change}</p>*/}
                    {/*                </div>*/}
                    {/*                <stat.icon className={`h-8 w-8 ${stat.color === "text-white" ? "text-cyan-400" : stat.color}`} />*/}
                    {/*            </div>*/}
                    {/*        </Card>*/}
                    {/*    ))}*/}
                    {/*</div>*/}

                    <div className="grid grid-cols-1 gap-6">
                        {/* Generate Product Page Section */}
                        <Card className="backdrop-blur-xl bg-slate-900/40 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl shadow-cyan-500/10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white flex items-center">
                                    <Sparkles className="mr-2 h-5 w-5 text-cyan-400" />
                                    Generate Product Page
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-300 h-4 w-4" />
                                    <Input
                                        type = "text"
                                        value = {url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="Paste product URL here..."
                                        className="pl-10 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-300 focus:border-cyan-400/50"
                                    />
                                </div>

                                <Button
                                    onClick={handleExtractData}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white transition-all duration-300 ease-out hover:scale-[1.02] shadow-lg shadow-cyan-500/30">
                                    <Brain className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Generating' : 'Generate page'}
                                </Button>

                                {/* AI Preview Card */}
                                <Card className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-4">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-center">
                                            <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-slate-300 mb-2">AI is analyzing the product...</p>
                                            <p className="text-sm text-slate-500">This may take a few moments</p>
                                        </div>
                                    ) : extractedData ? (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="bg-gray-800/30 p-6 rounded-xl border border-white/10 space-y-6"
                                            >
                                                <h2 className="text-2xl font-bold mb-4 text-white">Extracted Product Data</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="md:col-span-1">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {extractedData.images.slice(0, 4).map((imgSrc, index) => (
                                                                <img
                                                                    key={index}
                                                                    src={imgSrc || '/placeholder.png'}
                                                                    alt={`Product image ${index + 1}`}
                                                                    className="w-full h-32 object-contain rounded-lg shadow-md bg-gray-800"
                                                                    onError={(e) => (e.currentTarget.src = '/product-placeholder.png')}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-2 space-y-4">
                                                        <h3 className="text-xl font-bold mb-1 text-white">Title</h3>
                                                        <p className="text-lg font-semibold text-slate-200">{extractedData.new_title}</p>

                                                        <h3 className="text-xl font-bold mb-1 text-white">Description</h3>
                                                        <div
                                                            className="rounded-lg text-gray-300 text-sm sm:text-base leading-relaxed space-y-4"
                                                            dangerouslySetInnerHTML={{__html: extractedData.description}}
                                                        />

                                                        {extractedData.benefits_list && extractedData.benefits_list.length > 0 && (
                                                            <div className="mt-6">
                                                                <h3 className="text-xl font-semibold mb-3 text-white">✨
                                                                    Key Benefits</h3>
                                                                <ul className="list-disc list-inside text-gray-300 space-y-2">
                                                                    {extractedData.benefits_list.map((benefit, i) => (
                                                                        <li key={i}
                                                                            className="leading-relaxed">{benefit}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        <p className="text-slate-200">
                                                            <strong>Price:</strong> {extractedData.price}</p>

                                                        <p className="text-slate-200">
                                                            <strong>Category:</strong> {extractedData.category}</p>
                                                        <p className="text-slate-200">
                                                            <strong>Availability:</strong> In Stock
                                                        </p>
                                                        {extractedData.variants && (
                                                            <p className="text-slate-200">
                                                                <strong>Variants:</strong> {Object.values(extractedData.variants).flat().join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <Button
                                                onClick={handleExportToShopify}
                                                disabled={exportLoading}
                                                size="sm"
                                                className="w-full mt-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                                            >
                                                {exportLoading ? 'Exporting...' : 'Export to Shopify'}
                                                <ShoppingBag className="ml-2 h-3 w-3" />
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-center">
                                            <Globe className="w-16 h-16 text-slate-600 mb-4" />
                                            <p className="text-slate-400 mb-2">Enter a product URL to get started</p>
                                            <p className="text-sm text-slate-500">AI will analyze and generate an optimized product page</p>
                                        </div>
                                    )}
                                </Card>

                                <Card className="p-6 bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
                                    <h3 className="text-lg font-semibold text-white mb-4">AI-Powered Features</h3>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                icon: "🎯",
                                                title: "Smart Content Extraction",
                                                desc: "Automatically extracts product details, images, and descriptions",
                                            },
                                            { icon: "✨", title: "SEO Optimization", desc: "Generates optimized meta tags and structured data" },
                                            {
                                                icon: "🎨",
                                                title: "Design Enhancement",
                                                desc: "Applies modern design patterns and conversion optimization",
                                            },
                                            { icon: "📱", title: "Mobile Responsive", desc: "Ensures perfect display across all devices" },
                                        ].map((feature, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30">
                                                <span className="text-lg">{feature.icon}</span>
                                                <div>
                                                    <h4 className="text-white font-medium">{feature.title}</h4>
                                                    <p className="text-sm text-slate-400">{feature.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </Card>
                    </div>


                </div>

                {/*<Card className="col-span-2 backdrop-blur-xl bg-slate-900/40 border border-purple-500/20 rounded-3xl p-6 pb-6 h-fit shadow-2xl shadow-purple-500/10">*/}
                {/*    <div className="space-y-6">*/}
                {/*        /!* Quick Actions *!/*/}
                {/*        <div>*/}
                {/*            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">*/}
                {/*                <Zap className="mr-2 h-5 w-5 text-cyan-400" />*/}
                {/*                Quick Actions*/}
                {/*            </h3>*/}
                {/*            <div className="space-y-2">*/}
                {/*                {[*/}
                {/*                    { icon: Sparkles, label: "Generate Page", color: "hover:text-cyan-400" },*/}
                {/*                    { icon: Target, label: "Create Ad", color: "hover:text-purple-400", href: "/ad-generator" },*/}
                {/*                    { icon: Share2, label: "Export to Shopify", color: "hover:text-pink-400" },*/}
                {/*                    { icon: BarChart3, label: "View Analytics", color: "hover:text-emerald-400" },*/}
                {/*                ].map((action, index) => (*/}
                {/*                    <Button*/}
                {/*                        key={index}*/}
                {/*                        variant="ghost"*/}
                {/*                        size="sm"*/}
                {/*                        onClick={() => action.href ? router.push(action.href) : null}*/}
                {/*                        className={`w-full justify-start text-slate-200 hover:bg-slate-700/30 ${action.color} transition-all duration-300 ease-out hover:scale-[1.02]`}*/}
                {/*                    >*/}
                {/*                        <action.icon className="mr-3 h-4 w-4" />*/}
                {/*                        {action.label}*/}
                {/*                    </Button>*/}
                {/*                ))}*/}
                {/*            </div>*/}
                {/*        </div>*/}

                {/*        /!* AI Assistant Card *!/*/}
                {/*        <Card className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-2xl p-4">*/}
                {/*            <div className="text-center space-y-3">*/}
                {/*                <div className="flex justify-center">*/}
                {/*                    <Brain className="h-8 w-8 text-cyan-400" />*/}
                {/*                </div>*/}
                {/*                <div>*/}
                {/*                    <h4 className="text-white font-semibold">Mercury AI</h4>*/}
                {/*                    <p className="text-slate-200 text-sm">Your AI Assistant</p>*/}
                {/*                </div>*/}
                {/*                <Button*/}
                {/*                    size="sm"*/}
                {/*                    className="w-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-400/30 text-cyan-300 transition-all duration-300 ease-out hover:scale-[1.02]"*/}
                {/*                >*/}
                {/*                    Start Chat*/}
                {/*                </Button>*/}
                {/*            </div>*/}
                {/*        </Card>*/}
                {/*    </div>*/}
                {/*</Card>*/}

            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                <div className="backdrop-blur-xl bg-slate-900/40 border border-cyan-500/20 rounded-full px-6 py-2 shadow-lg shadow-cyan-500/20">
                    <p className="text-slate-200 text-sm">
                        Powered by{" "}
                        <span className="text-white bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold">
              Mercury AI
            </span>
                    </p>
                </div>
            </div>
        </div>
        </div>

    )
}
