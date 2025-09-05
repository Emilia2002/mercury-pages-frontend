'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingSlides from '../../components/OnboardingSlides';
import {Clock, Image as ImageIcon, Zap, CheckCircleIcon, LinkIcon, Info} from 'lucide-react';

interface ExtractedData {
    new_title: string;
    description: string;
    images: string[];
    variants: string[];
    price: string;
    category: string;
    availability: boolean;
}

interface JobResult {
    new_title?: string;
    description?: string;
    images?: string[];
    variants?: Record<string, string[]>; // dictionary from backend
    price?: string;
}

interface Job {
    id: string;
    url: string;
    status: string;
    created_at?: string;
    error?: string;
    result?: JobResult;
}

export default function DashboardPage() {
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

    // Backend job type
    interface BackendJob {
        _id: string;
        url: string;
        status: string;
        created_at?: string;
        error?: string;
        result?: JobResult;
    }

    // Fetch jobs
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

    // Extract data from URL
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Failed to extract data. Status: ${response.status}`);
            }

            const data: ExtractedData = await response.json();
            setExtractedData(data);
            setUrl('');
            fetchJobs();
        } catch (error) {
            console.error('Error extracting data:');
        } finally {
            setIsLoading(false);
        }
    };

    // Export to Shopify
    const handleExportToShopify = async () => {
        // Normalize data from either extractedData or selectedJob
        const dataToExport: ExtractedData | null = extractedData
            ? extractedData
            : selectedJob?.result
                ? {
                    new_title: selectedJob.result.new_title || '',
                    description: selectedJob.result.description || '',
                    images: selectedJob.result.images || [],
                    variants: selectedJob.result.variants
                        ? Object.values(selectedJob.result.variants).flat()
                        : [],
                    price: selectedJob.result.price || '',
                    category: '',       // optional
                    availability: true, // optional
                }
                : null;

        if (!dataToExport || !auth.token) {
            setExportError('No data to export.');
            return;
        }

        setExportLoading(true);
        setExportError(null);
        setExportSuccess(false);

        try {
            const payload = {
                new_title: dataToExport.new_title,
                description: dataToExport.description,
                images: dataToExport.images,
                variants: {Option: dataToExport.variants},
                price: dataToExport.price,
            };

            const response = await fetch(`${API_BASE_URL}/shopify/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to export product.');
            }

            setExportSuccess(true);
            fetchJobs();
        } catch (error) {
            console.error('Error during Shopify export:', error);
            setExportError(error instanceof Error ? error.message : 'Unknown error during export.');
        } finally {
            setExportLoading(false);
        }
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 rounded-full bg-yellow-500 text-black text-xs">Pending</span>;
            case 'in_progress':
                return <span className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs">In Progress</span>;
            case 'completed':
                return <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs">Completed</span>;
            case 'failed':
                return <span className="px-2 py-1 rounded-full bg-red-600 text-white text-xs">Failed</span>;
            default:
                return <span className="px-2 py-1 rounded-full bg-gray-500 text-white text-xs">{status}</span>;
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-4xl font-bold mb-2 gradient-text py-10">Dashboard</h1>
                <div
                    className="mb-8 p-4 sm:p-6 rounded-2xl relative overflow-hidden shadow-xl
             bg-white/5 backdrop-blur-md border-2 border-transparent
             bg-clip-padding
             before:absolute before:inset-0 before:rounded-2xl
             before:p-[2px] before:bg-gradient-to-r
             before:from-cyan-400 before:via-blue-500 before:to-fuchsia-500
             before:content-[''] before:-z-10
             hover:before:animate-pulse"
                >
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 drop-shadow-lg text-center sm:text-left">
                        ⚡ Connect Your Shopify Store
                    </h2>

                    <p className="text-black mt-3 leading-relaxed text-base sm:text-lg text-center sm:text-left">
                        Ready to <span className="text-cyan-800 font-semibold">export amazing products</span> straight
                        into your
                        Shopify? Just grab your <span className="text-fuchsia-400 font-semibold">Store URL</span> ⚙️ and
                        <span className="text-cyan-800 font-semibold"> API Access Token</span> 🔑.
                    </p>

                    <p className="text-gray-900 mt-2 text-sm sm:text-base text-center sm:text-left">
                        Don’t worry — we’ll guide you step-by-step 🛸
                        <span className="block sm:inline italic text-cyan-200">
      Estimated time: <span className="font-semibold">3 minutes</span> ⏱️
    </span>
                    </p>

                    <div
                        className="mt-4 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-sm font-medium text-gray-900">
                        <span>👇 Follow the guide below</span>
                    </div>
                </div>

            </div>


            <OnboardingSlides/>
            {/* How It Works / Steps */}
            <div className="bg-gray-800/30 p-6 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Info size={22}/> How it works
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div
                        className="flex flex-col items-center text-center p-4 bg-gray-900/40 rounded-xl border border-gray-700">
                        <LinkIcon size={28} className="text-primary mb-3"/>
                        <h3 className="font-semibold text-lg">1. Paste Link</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Enter a product page URL that you want to optimize.
                        </p>
                    </div>
                    <div
                        className="flex flex-col items-center text-center p-4 bg-gray-900/40 rounded-xl border border-gray-700">
                        <Zap size={28} className="text-yellow-400 mb-3"/>
                        <h3 className="font-semibold text-lg">2. Generate</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Click <span className="font-semibold">Generate</span> and our AI will create a new optimized
                            page.
                        </p>
                    </div>
                    <div
                        className="flex flex-col items-center text-center p-4 bg-gray-900/40 rounded-xl border border-gray-700">
                        <CheckCircleIcon size={28} className="text-green-400 mb-3"/>
                        <h3 className="font-semibold text-lg">3. Review & Use</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Access your new page in <span className="font-semibold">My Pages</span> and export it to
                            your Shopify Store.
                        </p>
                    </div>
                </div>
            </div>


                    {/* Generate Input */}
                    <div
                        className="bg-gray-800/30 p-4 rounded-xl border border-white/10 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste your product link here..."
                            className="col-span-1 md:col-span-4 bg-gray-900 border border-gray-700 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-gray-200 text-base"
                        />
                        <button
                            onClick={handleExtractData}
                            disabled={isLoading}
                            className="col-span-1 bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg glow-on-hover flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 text-base"
                        >
                            <Zap size={20}/>
                            {isLoading ? 'Extracting...' : 'Extract Data'}
                        </button>
                    </div>

                    {/* Extracted Data */}
                    {extractedData && (
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5}}
                            className="bg-gray-800/30 p-6 rounded-xl border border-white/10 space-y-6"
                        >
                            <h2 className="text-2xl font-bold mb-4">Extracted Product Data</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        {extractedData.images.slice(0, 4).map((imgSrc, index) => (
                                            <img
                                                key={index}
                                                src={imgSrc}
                                                alt={`Product image ${index + 1}`}
                                                className="w-full h-64 object-contain rounded-lg shadow-md bg-gray-800"
                                                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <h3 className="text-xl font-bold mb-1">Title</h3>
                                    <p className="text-lg font-semibold">{extractedData.new_title}</p>
                                    <h3 className="text-xl font-bold mb-1">Description</h3>
                                    <div
                                        className="max-h-64 overflow-y-auto p-3 rounded-lg border border-gray-700 bg-gray-900/30 text-gray-300 text-sm sm:text-base leading-relaxed"
                                        dangerouslySetInnerHTML={{__html: extractedData.description}}
                                    />
                                    <p><strong>Price:</strong> {extractedData.price}</p>
                                    <p><strong>Category:</strong> {extractedData.category}</p>
                                    <p>
                                        <strong>Availability:</strong> {extractedData.availability ? 'In Stock' : 'Out of Stock'}
                                    </p>
                                    <p><strong>Variants:</strong> {extractedData.variants.join(', ') || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="mt-8 text-center">
                                <button
                                    onClick={handleExportToShopify}
                                    disabled={exportLoading}
                                    className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exportLoading ? 'Exporting...' : 'Export to Shopify'}
                                </button>
                                {exportSuccess && <p className="mt-2 text-green-400">Product exported successfully!</p>}
                                {exportError && <p className="mt-2 text-red-400">{exportError}</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* Job History */}
                    <div className="bg-gray-800/30 p-6 rounded-xl border border-white/10">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Clock size={20}/> Job History
                        </h2>
                        {loadingJobs ? (
                            <p className="text-gray-400">Loading jobs...</p>
                        ) : jobs.length === 0 ? (
                            <p className="text-gray-400">No jobs yet. Start by extracting a product!</p>
                        ) : (
                            <ul className="divide-y divide-gray-700">
                                {jobs.map((job) => (
                                    <li
                                        key={job.id}
                                        className="py-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded"
                                        onClick={() => setSelectedJob(job)}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-white font-medium">
                                                    {job.result?.new_title || job.url}
                                                </p>
                                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                                    Status: {statusBadge(job.status)}
                                                </p>

                                            </div>
                                            <div className="text-sm text-gray-400 mt-2 sm:mt-0">
                                                {job.created_at ? new Date(job.created_at).toLocaleString() : ''}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Selected Job Details */}
                    {selectedJob && (
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            className="bg-gray-900/40 p-6 rounded-xl border border-white/10 space-y-4"
                        >
                            <h2 className="text-2xl font-bold">Job Details</h2>
                            <p><strong>Status:</strong> {statusBadge(selectedJob.status)}</p>

                            {selectedJob.result && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}}
                                                transition={{duration: 0.5}}>
                                        {selectedJob.result.images && selectedJob.result.images.length > 0 ? (
                                            <div className="space-y-4">
                                                <img src={selectedJob.result.images[0]} alt="Main product"
                                                     className="w-full h-auto object-cover rounded-xl border border-white/10 shadow-lg"/>
                                                <div className="grid grid-cols-4 gap-4">
                                                    {selectedJob.result.images.slice(1, 5).map((imgUrl, index) => (
                                                        <img key={index} src={imgUrl} alt={`Image ${index + 1}`}
                                                             className="w-full h-auto object-cover rounded-lg border border-white/10 opacity-70 hover:opacity-100 cursor-pointer transition"/>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="w-full aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-500">
                                                <ImageIcon size={48}/>
                                            </div>
                                        )}
                                    </motion.div>
                                    <div className="space-y-2">
                                        <p><strong>Title:</strong> {selectedJob.result.new_title}</p>
                                        <p><strong>Price:</strong> {selectedJob.result.price}</p>
                                        {selectedJob.result.description && (
                                            <div
                                                className="max-h-48 overflow-y-auto p-3 rounded-lg border border-gray-700 bg-gray-900/30 text-gray-300 text-sm sm:text-base"
                                                dangerouslySetInnerHTML={{__html: selectedJob.result.description}}
                                            />
                                        )}
                                        {selectedJob.result.variants && (
                                            <p>
                                                <strong>Variants:</strong> {Object.values(selectedJob.result.variants).flat().join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex gap-4">
                                <button
                                    className="px-4 py-2 bg-gray-700 rounded text-white"
                                    onClick={() => setSelectedJob(null)}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleExportToShopify}
                                    disabled={exportLoading}
                                    className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exportLoading ? 'Exporting...' : 'Export to Shopify'}
                                </button>
                                {exportSuccess && <p className="mt-2 text-green-400">Product exported successfully!</p>}
                                {exportError && <p className="mt-2 text-red-400">{exportError}</p>}
                            </div>
                        </motion.div>
                    )}
                </div>
                );
                }
