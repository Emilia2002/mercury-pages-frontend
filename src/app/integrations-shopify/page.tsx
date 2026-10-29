"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle,
    AlertCircle,
    Loader2,
    Lock,
    Store,
    AppWindow,
    Code,
    Settings,
    LayoutDashboard,
    KeyRound,
    ChevronsDown,
    ChevronsUp,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "@/components/SidebarNew"
import { useAuth } from "@/contexts/AuthContext"

const onboardingSteps = [
    {
        title: "Log in to Shopify",
        description: "Access your store's admin panel and navigate to the Settings page.",
        id: "step-1",
        image: "/shopify-step1-login.png",
        icon: Lock,
    },
    {
        title: "Go to Apps",
        description: "From the sidebar, go to 'Apps and sales channels' to manage integrations.",
        id: "step-2",
        image: "/shopify-step2-apps.png",
        icon: AppWindow,
    },
    {
        title: "Manage Private Apps",
        description: "Click 'Develop apps' to create and manage your private apps.",
        id: "step-3",
        image: "/shopify-step3-private-apps.png",
        icon: Code,
    },
    {
        title: "Create a New App",
        description: "Create a new app and give it a descriptive name like 'Mercury Pages'.",
        id: "step-4",
        image: "/shopify-step4-create-app.png",
        icon: LayoutDashboard,
    },
    {
        title: "Configure API Scopes",
        description: "Grant the app 'read_products' and 'write_products' permissions to sync your data.",
        id: "step-5",
        image: "/shopify-step5-api-scopes.png",
        icon: Settings,
    },
    {
        title: "Install the App",
        description: "Click 'Install app' to complete the process and generate credentials.",
        id: "step-6",
        image: "/shopify-step6-install.png",
        icon: CheckCircle,
    },
    {
        title: "Copy Credentials",
        description: "Copy the Admin API access token and store URL for the final step.",
        id: "step-7",
        image: "/shopify-step7-copy-credentials.png",
        icon: KeyRound,
    },
]

export default function ShopifyIntegrationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auth = useAuth();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const [storeUrl, setStoreUrl] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState("");
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const normalizeShopDomain = (value: string) => value.trim().replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();

    useEffect(() => {
        const status = searchParams.get('status');
        const callbackError = searchParams.get('error') || searchParams.get('message');
        const shop = searchParams.get('shop');

        if (status === 'success' || status === 'connected') {
            setIsConnected(true);
            setStoreUrl(shop ? normalizeShopDomain(shop) : '');
            setStatusMessage('Shopify connected successfully. Your store is ready for export.');
            router.replace('/integrations-shopify');
        } else if (callbackError) {
            setConnectionError(callbackError);
        }
    }, [router, searchParams]);

    const handleConnectShopify = async () => {
        const normalizedShop = normalizeShopDomain(storeUrl);
        if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(normalizedShop)) {
            setConnectionError('Enter a valid Shopify domain, such as your-store.myshopify.com.');
            return;
        }

        if (!auth.token) {
            setConnectionError('Please sign in before connecting Shopify.');
            return;
        }

        setConnectionError('');
        setIsConnecting(true);
        const returnTo = searchParams.get('returnTo');
        const params = new URLSearchParams({ shop: normalizedShop });
        if (returnTo?.startsWith('/')) params.set('returnTo', returnTo);
        const startUrl = `${API_BASE_URL}/auth/shopify/start?${params.toString()}`;

        console.log('[v0] Starting Shopify OAuth:', { startUrl, shop: normalizedShop });

        try {
            const response = await fetch(startUrl, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            const responseText = await response.text();
            console.log('[v0] Shopify OAuth start response:', {
                status: response.status,
                body: responseText,
            });

            if (!response.ok) {
                throw new Error(`Shopify OAuth start failed (${response.status}): ${responseText}`);
            }

            const { authorization_url: authorizationUrl } = JSON.parse(responseText) as {
                authorization_url?: string;
            };
            if (!authorizationUrl) {
                throw new Error('Shopify OAuth response did not include an authorization URL.');
            }

            window.location.assign(authorizationUrl);
        } catch (error) {
            console.error('[v0] Shopify OAuth start error:', error);
            setConnectionError(error instanceof Error ? error.message : 'Unable to start Shopify connection.');
            setIsConnecting(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#fcfafd]">
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#fcfafd] via-white to-[#f7e4f3]/40" />
            <div className="absolute inset-0 z-10 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#f7e4f3] rounded-full blur-3xl animate-pulse-slow" />
            </div>

            <div className="relative z-20 flex h-screen">
                <Sidebar />
                <div className="flex-1 w-full h-full overflow-y-auto p-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className="flex items-center justify-center gap-3 text-4xl sm:text-5xl font-bold tracking-[-0.06em] text-[#21182b] mb-3">
                            <img src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/shopify/default.svg" alt="Shopify" className="size-10" />
                            Shopify Integration
                        </h1>
                        <p className="text-[#766b80] text-lg sm:text-xl max-w-2xl mx-auto">
                            Connect your Shopify store in a few simple steps to enable automatic product syncing and direct ad exports.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                        {/* Setup Instructions */}
                        <div className="space-y-4">
                            <Card className="bg-white/90 backdrop-blur-xl border border-[#eae2f0] rounded-3xl p-6 shadow-lg shadow-[#6425c7]/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Store className="w-5 h-5 text-purple-400" />
                                        Setup Instructions
                                    </CardTitle>
                                    <CardDescription className="text-slate-600">
                                        Follow these steps inside your Shopify admin panel.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            {onboardingSteps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                >
                                    <Card
                                        className={`
                                        bg-white/90 backdrop-blur-xl border border-[#eae2f0] rounded-2xl p-6 transition-all duration-300
                                        ${expandedStep === step.id ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' : 'hover:border-purple-500/30'}
                                    `}
                                    >
                                        <div
                                            className="flex items-start gap-4 cursor-pointer"
                                            onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <step.icon className="w-4 h-4 text-pink-300" />
                                                        {step.title}
                                                    </CardTitle>
                                                    <Button variant="ghost" size="icon" className="text-slate-600">
                                                        <AnimatePresence mode="wait">
                                                            {expandedStep === step.id ? (
                                                                <motion.div
                                                                    key="up"
                                                                    initial={{ rotate: 180, opacity: 0 }}
                                                                    animate={{ rotate: 0, opacity: 1 }}
                                                                    exit={{ rotate: 180, opacity: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <ChevronsUp className="w-5 h-5" />
                                                                </motion.div>
                                                            ) : (
                                                                <motion.div
                                                                    key="down"
                                                                    initial={{ rotate: -180, opacity: 0 }}
                                                                    animate={{ rotate: 0, opacity: 1 }}
                                                                    exit={{ rotate: -180, opacity: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <ChevronsDown className="w-5 h-5" />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </Button>
                                                </div>
                                                <CardDescription className="text-slate-600 mt-1">
                                                    {step.description}
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedStep === step.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="pt-4 mt-4 border-t border-white/10 overflow-hidden"
                                                >
                                                    <div className="rounded-lg overflow-hidden border border-white/10">
                                                        <img
                                                            src={step.image}
                                                            alt={step.title}
                                                            className="w-full h-auto object-cover"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Connection Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <Card className="bg-white/90 backdrop-blur-xl border border-[#eae2f0] rounded-3xl p-6 shadow-lg shadow-[#6425c7]/5">
                                <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Store className="w-5 h-5 text-purple-400" />
                                            Connect Your Store
                                        </CardTitle>
                                        <CardDescription className="text-slate-600">
                                            Authorize Mercury Pages securely in your Shopify admin.
                                        </CardDescription>
                                        {connectionError && (
                                            <div role="alert" className="mt-6 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                                <AlertCircle size={20} aria-hidden="true" />
                                                <span className="text-sm">{connectionError}</span>
                                            </div>
                                        )}
                                        {statusMessage && (
                                            <div role="status" className="mt-6 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                                                <CheckCircle size={20} aria-hidden="true" />
                                                <span className="text-sm">{statusMessage}</span>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {!isConnected ? (
                                            <>
                                                <div className="space-y-2">
                                                    <label htmlFor="shop-domain" className="text-sm font-medium">Shopify store domain</label>
                                                    <Input id="shop-domain" placeholder="your-store-name.myshopify.com" value={storeUrl} onChange={(event) => setStoreUrl(event.target.value)} autoComplete="url" />
                                                    <p className="text-xs text-slate-500">We&apos;ll redirect you to Shopify to approve access. No access token is needed.</p>
                                                </div>
                                                <Button onClick={handleConnectShopify} disabled={!storeUrl || isConnecting} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-md shadow-purple-500/20 hover:from-purple-600 hover:to-pink-600">
                                                    {isConnecting ? <><Loader2 data-icon="inline-start" className="animate-spin" /> Connecting to Shopify...</> : 'Connect Shopify'}
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-center">
                                                <div className="flex size-16 items-center justify-center rounded-full bg-green-100"><CheckCircle className="size-8 text-green-600" /></div>
                                                <div><h3 className="text-lg font-semibold">Shopify connected</h3><p className="text-slate-600">Your store is ready for product page exports.</p></div>
                                                {storeUrl && <Badge className="border-green-200 bg-green-50 text-green-700">{storeUrl}</Badge>}
                                                <Button variant="outline" asChild><a href="/page-editor">Continue to your page</a></Button>
                                            </div>
                                        )}
                                    </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
