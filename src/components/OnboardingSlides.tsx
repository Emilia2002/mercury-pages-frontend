'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Link as LinkIcon, Download, CheckCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const steps = [
    {
        title: "Step 1: Find your Store URL",
        description: "To get started, you'll need your Shopify store's URL. It usually looks like your-store-name.myshopify.com.",
        icon: LinkIcon,
        buttonText: "Next",
        id: "step-1"
    },
    {
        title: "Step 2: Install Our App",
        description: "Our app needs to be installed on your store to manage products. You'll be redirected to the Shopify App Store for a one-click install.",
        icon: Download,
        buttonText: "Next",
        id: "step-2"
    },
    {
        title: "Step 3: Connect to Shopify",
        description: "You're all set! Now you can export your AI-generated product pages and assets directly to your store with a single click.",
        icon: CheckCircle,
        buttonText: "Connect to Shopify",
        id: "step-3"
    },
];

const OnboardingSlides = () => {
    const auth = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [storeUrl, setStoreUrl] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    const handleConnectShopify = async () => {
        if (!storeUrl || !accessToken) {
            alert("Please enter both your store URL and access token.");
            return;
        }

        setIsLoading(true);

        console.log("Attempting to connect to Shopify...");
        console.log("Authorization token:", auth.token ? 'Token is present' : 'Token is missing!');
        console.log("Request payload:", { store_url: storeUrl, access_token: accessToken });

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
            router.refresh();
        } catch (error) {
            console.error("Error saving credentials:", error);
            alert(`Failed to connect to Shopify.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const currentStepData = steps[currentStep];
    const IconComponent = currentStepData.icon;

    // Animation variants for the slide transition
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -300 : 300,
            opacity: 0
        })
    };

    return (
        <div className="bg-primary/10 p-6 rounded-xl border border-primary/30 relative overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={currentStep}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    custom={1}
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <h2 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2 text-primary">
                                <ShoppingBag className="text-primary"/>{currentStepData.title}
                            </h2>
                            <p className="text-primary/80 mt-1">{currentStepData.description}</p>
                        </div>
                    </div>

                    {currentStepData.id === "step-3" ? (
                        <div className="mt-6 space-y-4">
                            <input
                                type="text"
                                placeholder="Shopify Shop (example.myshopify.com)"
                                value={storeUrl}
                                onChange={(e) => setStoreUrl(e.target.value)}
                                className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <input
                                type="password"
                                placeholder="Access Token"
                                value={accessToken}
                                onChange={(e) => setAccessToken(e.target.value)}
                                className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <div className="flex justify-between items-center">
                                <motion.button
                                    onClick={handleBack}
                                    className="p-2 rounded-full transition-colors bg-white/10 hover:bg-white/20"
                                    whileHover={{ scale: 1.1 }}
                                    aria-label="Previous step"
                                >
                                    <ArrowLeft size={20} className="text-white"/>
                                </motion.button>
                                <motion.button
                                    onClick={handleConnectShopify}
                                    className="bg-primary px-4 py-2 rounded-lg text-primary-foreground font-semibold"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Connect"}
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 flex items-center justify-between">
                            <motion.button
                                onClick={handleBack}
                                className={`p-2 rounded-full transition-colors ${currentStep === 0 ? 'invisible' : 'bg-white/10 hover:bg-white/20'}`}
                                whileHover={{ scale: 1.1 }}
                                aria-label="Previous step"
                            >
                                <ArrowLeft size={20} className="text-white"/>
                            </motion.button>

                            <motion.div
                                key={currentStep}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, rotate: [0, 360] }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="p-4 rounded-full bg-primary/20"
                            >
                                <IconComponent size={28} className="text-primary"/>
                            </motion.div>

                            <motion.button
                                onClick={handleNext}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                aria-label="Next step"
                            >
                                <ArrowRight size={20} className="text-white"/>
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default OnboardingSlides;