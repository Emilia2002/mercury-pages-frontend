// FILE: src/app/pricing/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    const auth = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null); // Track which button is loading
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    const handleSubscription = async (planName: string) => {
        // If the user is not logged in, redirect them to the sign-in page first.
        if (!auth.isAuthenticated) {
            router.push('/signup');
            return;
        }

        setIsLoading(planName);

        try {
            const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}` // Send the user's JWT for authentication
                },
                // Send the plan name to the backend, which will look up the price ID.
                body: JSON.stringify({ plan_name: planName })
            });

            if (!response.ok) {
                // If the response is not ok, read the error message from the backend.
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create checkout session.');
            }

            const session = await response.json();

            // Redirect the user to the Stripe Checkout page
            if (session.url) {
                window.location.href = session.url;
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
            alert(`We have encountered a problem. Please try again later.`);
            setIsLoading(null);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#fcfafd] text-[#21182b]">
            <Header />
            <main className="container mx-auto px-8 py-20 flex-grow">
                <div className="text-center mb-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e83ead]">Pricing</p>
                    <h1 className="mt-4 text-5xl font-bold tracking-[-0.06em] text-[#21182b]">Simple plans for ambitious brands</h1>
                    <p className="mt-4 text-lg text-[#766b80]">No hidden fees. Cancel anytime.</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Craftsman Plan */}
                    <div className="bg-white p-8 rounded-3xl border border-[#eae2f0] flex flex-col shadow-sm">
                        <h3 className="text-2xl font-bold mb-2 text-white">Craftsman</h3>
                        <p className="text-gray-400 mb-6">For getting started and launching your first products.</p>
                        <p className="text-5xl font-bold mb-6 text-white">€0<span className="text-lg font-normal text-gray-400">/mo</span></p>
                        <ul className="space-y-4 text-gray-300 mb-8">

                            <li className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#34D399] mr-2"/>5 Product Pages / month
                            </li>

                            <li className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#34D399] mr-2"/>AI-Generated Product Descriptions
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#34D399] mr-2"/>Built-In Ad Generator for Facebook
                                & Instagram
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#34D399] mr-2"/>SEO Optimization for Product Pages
                            </li>
                        </ul>
                        {/* Correct button logic: call handleSubscription */}
                        {auth.isAuthenticated ? (
                            <button
                                onClick={() => router.push('/crm-dashboard')}
                                className="mt-auto w-full text-center bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        ) : (
                            <Link href="/signup"
                                  className="mt-auto w-full text-center bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors">Choose Plan</Link>
                        )}
                    </div>

                    {/* Artisan Plan (Highlighted) */}
                    <div className="bg-[#21182b] text-white p-8 rounded-3xl border border-[#6425c7] relative flex flex-col shadow-2xl shadow-[#6425c7]/20">
                        <span className="absolute top-0 -translate-y-1/2 bg-[#F472B6] text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                        <h3 className="text-2xl font-bold mb-2">Artisan</h3>
                        <p className="text-gray-800 mb-6">For growing brands that test and launch regularly.</p>
                        <p className="text-5xl font-bold mb-6">€30<span className="text-lg font-normal text-gray-800">/mo</span></p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2"/>Unlimited Product Pages
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2"/>AI Image Generator inside the editor
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2"/>Shopify Export and Product Sync
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2"/>AI-Generated Product Descriptions
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2"/>Built-In Ad Generator for Facebook
                                & Instagram
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2"/>SEO Optimization for Product Pages
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2"/>Priority AI Processing
                            </li>
                        </ul>
                        {/* Correct button logic: call handleSubscription */}
                        <button
                            onClick={() => handleSubscription('artisan')}
                            disabled={isLoading === 'artisan'}
                            className="mt-auto w-full text-center bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors glow-on-hover disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading === 'artisan' ? 'Loading...' : 'Start Free Trial'}
                        </button>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
