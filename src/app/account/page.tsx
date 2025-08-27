// FILE: src/app/account/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from '../../components/Sidebar';
import { Menu, Zap, X } from 'lucide-react';

// Define user info interface to match your backend schema
interface UserInfo {
    email: string;
    subscription_plan: string;
    subscription_active: boolean;
    pages_limit_month?: number;
    pages_generated_month: number;
    brand_voice_used: number;
}

export default function AccountPage() {
    const auth = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            router.push('/signin');
        } else if (auth.isAuthenticated) {
            // Fetch user info when authenticated
            fetchUserInfo();
        }
    }, [auth.isLoading, auth.isAuthenticated, router, API_BASE_URL, auth.token]);

    const fetchUserInfo = async () => {
        if (!auth.token) return;
        setIsLoadingData(true);
        try {
            const response = await fetch(`${API_BASE_URL}/me`, {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch user data.");
            const data = await response.json();
            setUserInfo(data);
        } catch (error) {
            console.error("Error fetching user info:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleManageSubscription = async () => {
        if (!auth.token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/create-customer-portal-session`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });
            if (!response.ok) throw new Error("Failed to create Stripe portal session.");
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Error managing subscription:", error);
            alert("Error: Could not open subscription portal.");
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm("Are you sure you want to cancel your subscription? This action cannot be undone.")) return;
        if (!auth.token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/cancel-subscription`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });
            if (!response.ok) throw new Error("Failed to cancel subscription.");
            alert("Subscription cancelled successfully.");
            // Refresh user data after cancellation
            fetchUserInfo();
        } catch (error) {
            console.error("Error cancelling subscription:", error);
            alert("Error: Could not cancel subscription.");
        }
    };

    if (auth.isLoading || isLoadingData) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!auth.isAuthenticated || !userInfo) {
        return null;
    }

    return (
        <div className="min-h-screen w-full flex bg-[#111827] text-[#E5E7EB]">
            {/* Hamburger Menu for Mobile */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-lg bg-[#1f2937] text-white"
                    aria-label="Open sidebar"
                >
                    <Menu size={24}/>
                </button>
            </div>

            {/* Sidebar component */}
            <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />

            <main className="flex-1 p-8 md:ml-64 transition-all duration-300">
                <h1 className="text-4xl font-bold mb-8 gradient-text text-white">My Account</h1>
                <div className="bg-gray-800/30 p-8 rounded-xl border border-white/10 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-6 text-white">Subscription Details</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Current Plan:</span>
                            <span className="font-bold text-white">{userInfo.subscription_plan}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className="font-bold text-green-400">{userInfo.subscription_active ? 'Active' : 'Inactive'}</span>
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
                                    onClick={handleCancelSubscription}
                                    className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Cancel Subscription
                                </button>
                            </>
                        ) : (
                            <Link href="/pricing" className="bg-[#38BDF8] text-black font-bold py-2 px-4 rounded-lg text-center">
                                Upgrade Plan
                            </Link>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}