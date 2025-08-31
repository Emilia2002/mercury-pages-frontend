// FILE: src/app/dashboard/[jobId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Zap, ArrowLeft, Image as ImageIcon, CheckCircle, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

// Define the full structure of the final result
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
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shopifyShop, setShopifyShop] = useState('');
    const [shopifyToken, setShopifyToken] = useState('');
    const [exporting, setExporting] = useState(false);

    const handleExportClick = () => {
        setIsModalOpen(true);
    };

    const handleExportSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setExporting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/export-to-shopify/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({
                    job_id: jobId,
                    shop_name: shopifyShop,
                    access_token: shopifyToken,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to export product.');
            }

            alert("Product exported to Shopify successfully!");
            setIsModalOpen(false);
        } catch (error) {
            alert(`Export failed. Check your store name and access token.`);
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId || !auth.token) return;
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
                    headers: { 'Authorization': `Bearer ${auth.token}` }
                });
                if (!response.ok) throw new Error('Job not found.');
                const data = await response.json();
                setJob(data);
            } catch (error) {
                console.error("Failed to fetch job:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (auth.token) fetchJob();
    }, [jobId, auth.token]);

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
                        onClick={handleExportClick}
                        className="bg-primary text-black font-bold py-2 px-6 rounded-lg hover:text-gray-600 flex items-center gap-2">
                        <Zap size={18} />
                        Export to Shopify
                    </button>
                </div>
            </header>

=            {isModalOpen && (
                <div className="fixed inset-0 bg-[#111827] bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-black">Export to Shopify</h2>
                        <form onSubmit={handleExportSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Shopify Store Name</label>
                                <input
                                    type="text"
                                    value={shopifyShop}
                                    onChange={(e) => setShopifyShop(e.target.value)}
                                    placeholder="your-store-name"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Access Token</label>
                                <input
                                    type="text"
                                    value={shopifyToken}
                                    onChange={(e) => setShopifyToken(e.target.value)}
                                    placeholder="shpat_..."
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Create a Private App in your Shopify admin to get this token.
                                </p>

                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                                    disabled={exporting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-black rounded-lg "
                                    disabled={exporting}
                                >
                                    {exporting ? 'Exporting...' : 'Export Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <main className="container mx-auto p-8">
                <p className="text-center text-accent mb-8 text-black font-semibold">This is a simulation of your new Shopify product page.</p>

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

                            <button className="mt-8 w-full bg-primary text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center gap-3 glow-on-hover">
                                <ShoppingCart size={22}/>
                                Add to Cart
                            </button>
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
}