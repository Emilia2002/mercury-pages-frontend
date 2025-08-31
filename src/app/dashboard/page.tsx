// FILE: src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Clock, CheckCircle, AlertTriangle, ArrowRight, ShoppingBag,
    FilePlus2, Zap, Info, Link as LinkIcon, CheckCircle as CheckCircleIcon
} from 'lucide-react';

interface Job {
    _id: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: { new_title?: string; images?: string[];};
    url: string;
    created_at: string;
    error?: string;
}

const AnimatedProductCard = ({ job }: { job: Job }) => (
    <div className="bg-gray-800/30 p-5 rounded-lg border border-yellow-400/30 flex justify-between items-center relative overflow-hidden">
        <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1 bg-yellow-400/50"
        />
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="text-yellow-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-base">
                    Generating page from link...
                </p>
            </div>
        </div>
        <div className="flex items-center gap-6 ml-4">
            <div className="flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full text-yellow-400 bg-yellow-400/10">
                <Clock size={16} className="animate-spin" />
                <span>Processing</span>
            </div>
        </div>
    </div>
);

export default function DashboardPage() {
    const auth = useAuth();
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    const fetchJobs = useCallback(async () => {
        if (!auth.token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/jobs`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            }
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        }
    }, [auth.token, API_BASE_URL]);

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            router.push('/signin');
        }
        if (auth.isAuthenticated) {
            fetchJobs();
        }
    }, [auth.isLoading, auth.isAuthenticated, fetchJobs, router]);

    const handleGenerate = async () => {
        if (!url || isLoading || !auth.token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/generate-page/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ source_url: url }),
            });

            if (response.status === 403) {
                alert("Monthly page generation limit reached. Please upgrade your plan.");
                router.push('/pricing');
            } else if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Failed to start job. Status: ${response.status}`);
            } else {
                setUrl('');
                fetchJobs();
            }
        } catch (error) {
            console.error("Error starting job:", error);
            alert(`We have encountered an error.`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const processingJobs = jobs.filter(job => job.status === 'pending' || job.status === 'in_progress');
        if (processingJobs.length > 0) {
            const intervalId = setInterval(fetchJobs, 5000);
            return () => clearInterval(intervalId);
        }
    }, [jobs, fetchJobs]);

    const getStatusComponent = (status: Job['status']) => {
        const statusMap = {
            completed: { icon: <CheckCircle size={18} />, text: 'Completed', color: 'text-green-400 bg-green-500/20' },
            in_progress: { icon: <Clock size={18} className="animate-spin" />, text: 'Processing', color: 'text-yellow-400 bg-yellow-400/20' },
            pending: { icon: <Clock size={18} />, text: 'Pending', color: 'text-gray-400 bg-gray-400/20' },
            failed: { icon: <AlertTriangle size={18} />, text: 'Failed', color: 'text-red-500 bg-red-500/20' },
        };
        const current = statusMap[status] || statusMap.pending;
        return (
            <div className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${current.color}`}>
                {current.icon}<span>{current.text}</span>
            </div>
        );
    };

    if (auth.isLoading || !auth.isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg">Loading...</div>;
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-4xl font-bold mb-2 gradient-text py-10">Dashboard</h1>
                <p className="text-gray-400 flex items-center gap-2"><Info size={16}/> Paste a product link to get started!</p>
            </div>
            {/* Connect to Shopify Section */}
            <div className="bg-primary/10 p-6 rounded-xl border border-primary/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag className="text-primary"/> Connect your Shopify Store</h2>
                    <p className="text-primary/80 mt-1">Export your generated pages directly to your store with one click.</p>
                </div>
            </div>

            {/* How It Works / Steps */}
            <div className="bg-gray-800/30 p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Info size={22}/> How it works
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center p-4 bg-gray-900/40 rounded-xl border border-gray-700">
                        <LinkIcon size={28} className="text-primary mb-3"/>
                        <h3 className="font-semibold text-lg">1. Paste Link</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Enter an AliExpress product page URL that you want to optimize.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center p-4 bg-gray-900/40 rounded-xl border border-gray-700">
                        <Zap size={28} className="text-yellow-400 mb-3"/>
                        <h3 className="font-semibold text-lg">2. Generate</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Click <span className="font-semibold">Generate</span> and our AI will create a new optimized page.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center p-4 bg-gray-900/40 rounded-xl border border-gray-700">
                        <CheckCircleIcon size={28} className="text-green-400 mb-3"/>
                        <h3 className="font-semibold text-lg">3. Review & Use</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Access your new page in <span className="font-semibold">My Pages</span> and export it to your Shopify Store.
                        </p>
                    </div>
                </div>
            </div>

            {/* Generate Input */}
            <div className="bg-gray-800/30 p-4 rounded-xl border border-white/10 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste your product link here..."
                    className="col-span-1 md:col-span-4 bg-gray-900 border border-gray-700 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-gray-200 text-base"
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="col-span-1 bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg glow-on-hover flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 text-base"
                >
                    <Zap size={20}/>{isLoading ? 'Starting...' : 'Generate'}
                </button>
            </div>

            {/* My Pages Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4">My Pages</h2>
                <div className="space-y-3">
                    {jobs.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl">
                            <FilePlus2 className="mx-auto text-gray-600 mb-4" size={40} />
                            <h3 className="text-xl font-semibold">No pages generated yet</h3>
                            <p className="text-gray-500">Paste a link above to create your first page.</p>
                        </div>
                    ) : (
                        jobs.map(job => (
                            job.status === 'pending' || job.status === 'in_progress'
                                ? <AnimatedProductCard key={job._id} job={job} />
                                : <Link key={job._id} href={`/dashboard/${job._id}`} className="block">
                                    <div className="bg-gray-800/30 p-4 rounded-lg border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-primary transition-colors">
                                        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                                            <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                                                {job.result?.images?.[0] ? (
                                                    <img src={job.result.images[0]} alt="Product" className="w-full h-full object-cover" />
                                                ) : <FilePlus2 className="w-8 h-8 text-gray-500 m-auto"/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate text-sm">
                                                    {job.result?.new_title || job.url}
                                                </p>

                                                {job.status === 'failed' && (
                                                    <p className="text-red-400 text-xs mt-1 truncate">
                                                        Error: {'Unknown error.'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 sm:mt-0 ml-0 sm:ml-4">
                                            {getStatusComponent(job.status)}
                                            <ArrowRight className="text-gray-600" size={20}/>
                                        </div>
                                    </div>
                                </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
