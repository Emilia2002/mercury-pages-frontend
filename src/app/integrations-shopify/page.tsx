"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
    const auth = useAuth();
    const [storeUrl, setStoreUrl] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const [isConnecting, setIsConnecting] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState("")
    const [expandedStep, setExpandedStep] = useState<string | null>(null)

    const handleConnectShopify = async () => {
        if (!storeUrl || !accessToken) {
            alert("Please enter both your store URL and access token.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/users/me/shopify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ store_url: storeUrl, access_token: accessToken }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || `HTTP Error: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }

            alert("Shopify credentials saved successfully!");
        } catch (error) {
            console.error("Error saving credentials:", error);
            alert(`Failed to connect to Shopify.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen relative overflow-hidden bg-slate-950">
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
            <div className="absolute inset-0 z-10 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/50 rounded-full blur-3xl animate-pulse-slow" />
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
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
                            Shopify Integration
                        </h1>
                        <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto">
                            Connect your Shopify store in a few simple steps to enable automatic product syncing and direct ad exports.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                        {/* Setup Instructions */}
                        <div className="space-y-4">
                            <Card className="bg-slate-900/40 backdrop-blur-xl border border-pink-500/20 rounded-3xl p-6 shadow-lg shadow-pink-500/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Store className="w-5 h-5 text-purple-400" />
                                        Setup Instructions
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
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
                                        bg-slate-900/40 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6 transition-all duration-300
                                        ${expandedStep === step.id ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' : 'hover:border-purple-500/30'}
                                    `}
                                    >
                                        <div
                                            className="flex items-start gap-4 cursor-pointer"
                                            onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-white text-lg flex items-center gap-2">
                                                        <step.icon className="w-4 h-4 text-pink-300" />
                                                        {step.title}
                                                    </CardTitle>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
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
                                                <CardDescription className="text-slate-400 mt-1">
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
                            <Card className="bg-slate-900/40 backdrop-blur-xl border border-pink-500/20 rounded-3xl p-6 shadow-lg shadow-pink-500/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Store className="w-5 h-5 text-purple-400" />
                                        Connect Your Store
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Enter the credentials you copied from Shopify.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {!isConnected ? (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white">Store URL</label>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="your-store-name.myshopify.com"
                                                        value={storeUrl}
                                                        onChange={(e) => setStoreUrl(e.target.value)}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    e.g., your-store-name.myshopify.com (without https://)
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white">Admin API Access Token</label>
                                                <div className="relative">
                                                    <Input
                                                        type="password"
                                                        placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                        value={accessToken}
                                                        onChange={(e) => setAccessToken(e.target.value)}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                                                    />
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {connectionError && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                                                    >
                                                        <AlertCircle className="w-4 h-4 text-red-400" />
                                                        <p className="text-sm text-red-400">{connectionError}</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <Button
                                                onClick={handleConnectShopify}
                                                disabled={!storeUrl || !accessToken || isConnecting}
                                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md shadow-purple-500/20"
                                            >
                                                {isConnecting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Connecting...
                                                    </>
                                                ) : (
                                                    "Connect Store"
                                                )}
                                            </Button>
                                        </>
                                    ) : (
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-center space-y-4"
                                        >
                                            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                                                <CheckCircle className="w-8 h-8 text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">Successfully Connected!</h3>
                                                <p className="text-slate-300">Your Shopify store is now integrated with Mercury Pages.</p>
                                            </div>
                                            <Badge className="bg-green-500/20 text-green-100 border-green-500/30">{storeUrl}</Badge>
                                            <Button
                                                variant="outline"
                                                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                                                onClick={() => {
                                                    setIsConnected(false)
                                                    setStoreUrl("")
                                                    setAccessToken("")
                                                }}
                                            >
                                                Disconnect
                                            </Button>
                                        </motion.div>
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
