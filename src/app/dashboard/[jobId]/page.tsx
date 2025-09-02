'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Zap, ArrowLeft, Image as ImageIcon, CheckCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductData {
    title: string;
    price: string;
    images: string[];
    variants: Record<string, string[]>;
    new_title: string;
    description: string;
    benefits_list: string[];
}

interface Job {
    _id: string;
    status: 'completed' | 'failed';
    result?: ProductData;
    error?: string;
}

export default function JobResultPage() {
    const params = useParams();
    const router = useRouter();
    const auth = useAuth();
    const jobId = params.jobId as string;

    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [shopifyCredentialsSaved, setShopifyCredentialsSaved] = useState(false);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    /** Fetch job + user info once */
    const fetchJobAndUserInfo = async () => {
        if (!jobId || !auth.token) return;
        setIsLoading(true);
        try {
            const [jobRes, userRes] = await Promise.all([
                fetch(`${API_BASE_URL}/jobs/${jobId}`, {
                    headers: { 'Authorization': `Bearer ${auth.token}` }
                }),
                fetch(`${API_BASE_URL}/me`, {
                    headers: { 'Authorization': `Bearer ${auth.token}` }
                })
            ]);

            if (!jobRes.ok) throw new Error('Job not found.');
            const jobData = await jobRes.json();
            setJob(jobData);

            if (userRes.ok) {
                const userData = await userRes.json();
                setShopifyCredentialsSaved(Boolean(userData.shopify_store_url && userData.shopify_access_token));
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (auth.token) fetchJobAndUserInfo();
    }, [jobId, auth.token]);

    /** Explicitly fetch credentials only when opening modal */
    const handleOpenModal = async () => {
        if (!auth.token) return;
        try {
            const userRes = await fetch(`${API_BASE_URL}/me`, {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });
            console.log(userRes)
            if (userRes.ok) {
                const userData = await userRes.json();
                console.log("User data from /me:", userData);
                setShopifyCredentialsSaved(
                    Boolean(userData.shopify_store_url?.trim() && userData.shopify_access_token?.trim())
                );
            }

        } catch (error) {
            console.error("Failed to fetch user data:", error);
        }
        setIsModalOpen(true);
    };

    const handleExportSubmit = async () => {
        if (!job?.result) return;
        setExporting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/shopify/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`,
                },
                body: JSON.stringify(job.result),
            });

            if (!response.ok) throw new Error("Export failed");

            alert("✅ Exported successfully to Shopify!");
            setIsModalOpen(false);
        } catch (error) {
            console.error("Export failed:", error);
            alert("❌ Export failed. Please try again or check your credentials.");
        } finally {
            setExporting(false);
        }
    };

    if (isLoading || auth.isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Results...</div>;
    }

    if (!auth.isAuthenticated) {
        router.push('/signin');
        return null;
    }

    if (!job || !job.result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-3xl font-bold mb-4">Job Not Found or Still Processing</h1>
                <p className="text-gray-400 mb-8">The job might still be in progress or an error occurred. Please check the dashboard.</p>
                <Link href="/dashboard" className="flex items-center gap-2 hover:underline">
                    <ArrowLeft size={16}/> Back to Dashboard
                </Link>
            </div>
        );
    }

    const { result } = job;

    return (
        <div className="min-h-screen w-full bg-background">
            <header className="py-4 px-8 flex justify-between items-center border-b border-white/10 sticky top-0 bg-background/80 backdrop-blur-lg z-10">
                <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-black hover:text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </Link>
                <div className="flex gap-4">
                    <button
                        className="bg-primary text-black font-bold py-2 px-6 rounded-lg hover:text-gray-600 flex items-center gap-2"
                        onClick={handleOpenModal}
                    >
                        <Zap size={18} />
                        Export to Shopify
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-8">
                <p className="text-center text-accent mb-8 text-black font-semibold">
                    This is a simulation of your new Shopify product page.
                </p>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                        {result.images && result.images.length > 0 ? (
                            <div className="space-y-4">
                                <img src={result.images[0]} alt="Main product" className="w-full h-auto object-cover rounded-xl border border-white/10 shadow-lg"/>
                                <div className="grid grid-cols-4 gap-4">
                                    {result.images.slice(1, 5).map((imgUrl, index) => (
                                        <img key={index} src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-auto object-cover rounded-lg border border-white/10 opacity-70 hover:opacity-100 cursor-pointer transition" />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-500">
                                <ImageIcon size={48} />
                            </div>
                        )}
                    </motion.div>

                    {/* AI Generated Content */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                        <div className="prose prose-lg max-w-none text-black">
                            <h1 className="text-4xl font-bold mb-4">{result.new_title}</h1>
                            <p className="text-black">{result.description}</p>

                            <ul className="mt-6 space-y-2 text-black">
                                {result.benefits_list && result.benefits_list.map((benefit, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20}/>
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8">
                                {Object.entries(result?.variants).map(([key, values]) => (
                                    <div key={key} className="mb-4">
                                        <h3 className="font-semibold text-black mb-2">{key}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {values.map(value => (
                                                <span key={value} className="px-3 py-1 bg-gray-100 text-black rounded-full text-sm">
                                                    {value}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Export Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 transition-opacity"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20}/>
                            </button>

                            <h2 className="text-xl font-semibold mb-4 text-black">Export to Shopify</h2>

                            {shopifyCredentialsSaved ? (
                                <>
                                    <p className="text-black mb-4">
                                        Your Shopify store is connected. Click the button below to export this product.
                                    </p>
                                    <button
                                        onClick={handleExportSubmit}
                                        disabled={exporting}
                                        className="mt-6 w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                                    >
                                        {exporting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Exporting...
                                            </>
                                        ) : "Export"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-black mb-4">
                                        You have not yet connected your Shopify store. Please go to your Dashboard to set up your credentials.
                                    </p>
                                    <Link href="/dashboard">
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="mt-6 w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300"
                                        >
                                            Go to Dashboard
                                        </button>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
