// FILE: src/app/account/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '@/components/SidebarNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, CreditCard, Gauge, Mail, ShieldCheck, Sparkles, Store, X } from 'lucide-react';

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
        return <div className="flex min-h-screen items-center justify-center bg-[#fcfafd] text-sm text-[#766b80]">Loading your account...</div>;
    }

    if (!auth.isAuthenticated || !userInfo) return null;

    const pageLimit = userInfo.pages_limit_month || 0;
    const usagePercent = pageLimit ? Math.min(100, Math.round((userInfo.pages_generated_month / pageLimit) * 100)) : 0;

    return (
        <div className="min-h-screen bg-[#fcfafd] text-[#21182b]">
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="min-w-0 flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:py-12">
                        <header className="mb-8 flex flex-col gap-5 border-b border-[#eae2f0] pb-8 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e83ead]">Workspace settings</p>
                                <h1 className="mt-2 font-[var(--font-playfair)] text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">My account</h1>
                                <p className="mt-3 max-w-xl text-base leading-7 text-[#766b80]">Keep your plan, usage, and store connection in one place.</p>
                            </div>
                            <Badge className={userInfo.subscription_active ? 'w-fit border-0 bg-[#e6f6f0] px-3 py-1.5 text-[#1f7f5a]' : 'w-fit border-0 bg-[#fce8ec] px-3 py-1.5 text-[#a52f4a]'}>
                                {userInfo.subscription_active ? <Check data-icon="inline-start" /> : <X data-icon="inline-start" />} {userInfo.subscription_active ? 'Plan active' : 'Plan inactive'}
                            </Badge>
                        </header>

                        <section className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
                            <Card className="overflow-hidden border-0 bg-[#21182b] text-white shadow-xl shadow-[#6425c7]/10">
                                <CardHeader className="relative pb-5">
                                    <div className="absolute -right-12 -top-16 size-48 rounded-full bg-[#e83ead]/20 blur-3xl" />
                                    <div className="relative flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-[#f0b6e2]">Current plan</p>
                                            <CardTitle className="mt-2 text-3xl capitalize">{userInfo.subscription_plan}</CardTitle>
                                            <CardDescription className="mt-2 text-[#d9cedd]">Built for brands launching with momentum.</CardDescription>
                                        </div>
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10"><Sparkles /></div>
                                    </div>
                                </CardHeader>
                                <CardContent className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3 text-sm text-[#e7ddea]"><CreditCard data-icon="inline-start" /> Billing is managed securely through Stripe.</div>
                                    {userInfo.subscription_active ? <Button onClick={handleManageSubscription} className="bg-white text-[#21182b] hover:bg-[#f7e4f3]">Manage billing</Button> : <Button asChild className="bg-[#e83ead] text-white hover:bg-[#d92d9e]"><Link href="/pricing">View plans</Link></Button>}
                                </CardContent>
                            </Card>

                            <Card className="border-[#eae2f0] bg-white shadow-sm">
                                <CardHeader className="pb-3"><CardTitle className="text-lg">Monthly usage</CardTitle><CardDescription>Your generated storefront pages</CardDescription></CardHeader>
                                <CardContent>
                                    <div className="flex items-end justify-between"><span className="text-4xl font-semibold tracking-[-0.05em]">{userInfo.pages_generated_month}</span><span className="mb-1 text-sm text-[#766b80]">{pageLimit ? `of ${pageLimit}` : 'pages'}</span></div>
                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f1e7fa]"><div className="h-full rounded-full bg-gradient-to-r from-[#e83ead] to-[#6425c7]" style={{ width: `${pageLimit ? usagePercent : 12}%` }} /></div>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-[#766b80]"><Gauge data-icon="inline-start" /> {pageLimit ? `${usagePercent}% of your monthly allowance` : 'Usage resets monthly'}</div>
                                </CardContent>
                            </Card>
                        </section>

                        <section className="mt-5 grid gap-5 md:grid-cols-2">
                            <Card className="border-[#eae2f0] bg-white shadow-sm"><CardHeader><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#f7e4f3] text-[#8e267e]"><Mail /></div><div><CardTitle className="text-lg">Profile</CardTitle><CardDescription>Your Mercury Pages login</CardDescription></div></div></CardHeader><CardContent><p className="font-medium">{userInfo.email}</p><p className="mt-1 text-sm text-[#766b80]">{userInfo.is_verified ? 'Verified account' : 'Email verification pending'}</p></CardContent></Card>
                            <Card className="border-[#eae2f0] bg-white shadow-sm"><CardHeader><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#e6f6f0] text-[#1f7f5a]"><Store /></div><div><CardTitle className="text-lg">Shopify connection</CardTitle><CardDescription>Ready when you are</CardDescription></div></div></CardHeader><CardContent><p className="truncate font-medium">{userInfo.shopify_store_url || 'No store connected'}</p><div className="mt-3 flex items-center gap-2 text-sm text-[#1f7f5a]"><ShieldCheck data-icon="inline-start" /> Credentials protected</div><Button asChild variant="outline" className="mt-5 w-full"><Link href="/integrations-shopify">Manage Shopify connection</Link></Button></CardContent></Card>
                        </section>

                        {userInfo.subscription_active && <div className="mt-8 flex justify-end"><Button variant="ghost" onClick={handleCancelSubscription} className="text-[#a52f4a] hover:bg-[#fce8ec] hover:text-[#a52f4a]">Cancel subscription</Button></div>}
                    </div>
                </main>
            </div>
        </div>
    );
}
