// FILE: src/app/account/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '@/components/SidebarNew';
import { Card } from '@/components/ui/card';

interface UserInfo {
    email: string;
    first_name: string;
    subscription_plan: string;
    subscription_active: boolean;
    pages_limit_month?: number;
    pages_generated_month: number;
    shopify_store_url: string;
    shopify_access_token: string;
    is_verified: boolean;
}

export default function AccountPage() {
    const auth = useAuth();
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            router.push('/signin');
        } else if (auth.isAuthenticated) {
            fetchUserInfo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.isLoading, auth.isAuthenticated, auth.token]);

    const fetchUserInfo = async () => {
        if (!auth.token) return;
        setIsLoadingData(true);
        try {
            const response = await fetch(`${API_BASE_URL}/me`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch user data.');
            const data = await response.json();
            setUserInfo(data);
        } catch (error) {
            console.error('Error fetching user info:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleManageSubscription = async () => {
        if (!auth.token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/create-customer-portal-session`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            if (!response.ok) throw new Error('Failed to create Stripe portal session.');
            const data = await response.json();
            if (data.url) window.location.href = data.url;
        } catch (error) {
            console.error('Error managing subscription:', error);
            alert('Error: Could not open subscription portal.');
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) return;
        if (!auth.token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/cancel-subscription`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            if (!response.ok) throw new Error('Failed to cancel subscription.');
            alert('Subscription cancelled successfully.');
            fetchUserInfo();
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            alert('Error: Could not cancel subscription.');
        }
    };

    if (auth.isLoading || isLoadingData) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (!auth.isAuthenticated || !userInfo) {
        return null;
    }

    return (
        <div className="h-screen relative overflow-hidden bg-slate-950">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
            </div>

            <div className="flex h-screen">
                <Sidebar />

                <div className="flex-1 w-full h-full overflow-y-auto p-8 space-y-6">
                    {/* Header */}
                    <Card className="backdrop-blur-xl bg-slate-900/40 border border-pink-500/20 rounded-3xl p-6 shadow-2xl shadow-pink-500/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text">
                                    My Account
                                </h2>
                                <p className="text-slate-300">Manage your subscription</p>
                            </div>
                        </div>
                    </Card>

                    {/* Subscription Details */}
                    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 p-6 rounded-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-white">Subscription Details</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Current Plan:</span>
                                <span className="font-bold text-white">{userInfo.subscription_plan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Subscription status:</span>
                                <span
                                    className={`font-bold ${userInfo.subscription_active ? 'text-green-400' : 'text-red-400'}`}>
                  {userInfo.subscription_active ? 'Active' : 'Inactive'}
                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Pages Generated this month:</span>
                                <span className="font-bold text-white">{userInfo.pages_generated_month}</span>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10 flex gap-4">
                            {userInfo.subscription_active ? (
                                <>
                                    <button
                                        onClick={handleManageSubscription}
                                        className="bg-cyan-500 text-black font-bold py-2 px-4 rounded-lg border border-white"
                                    >
                                        Manage Subscription
                                    </button>
                                    <button
                                        onClick={handleCancelSubscription}
                                        className="bg-cyan-500 text-black font-bold py-2 px-4 rounded-lg border border-white"
                                    >
                                        Cancel Subscription
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/pricing"
                                    className="bg-[#38BDF8] text-black font-bold py-2 px-4 rounded-lg text-center"
                                >
                                    Upgrade Plan
                                </Link>
                            )}
                        </div>
                    </Card>


                </div>
            </div>
        </div>
    );
}
