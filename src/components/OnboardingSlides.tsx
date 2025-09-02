'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const steps = [
    {
        title: "Step 1: Log in to Shopify",
        description: "Log in to your Shopify admin panel at your-store-name.myshopify.com. Access Settings.",
        id: "step-1",
        image: "/shopify-step1-login.png",
    },
    {
        title: "Step 2: Go to Apps",
        description: "From the sidebar, navigate to 'Apps ans sales channels' to manage installed apps.",
        id: "step-2",
        image: "/shopify-step2-apps.png",
    },
    {
        title: "Step 3: Manage Private Apps",
        description: "Click 'Develop apps' to access private apps.",
        id: "step-3",
        image: "/shopify-step3-private-apps.png",
    },
    {
        title: "Step 4: Create a New App",
        description: "Click 'Create an app', then give it a name and select a developer.",
        id: "step-4",
        image: "/shopify-step4-create-app.png",
    },
    {
        title: "Step 5: Configure API Scopes",
        description: "Select the API permissions required for managing products and inventory. These should be read and write products",
        id: "step-5",
        image: "/shopify-step5-api-scopes.png",
    },
    {
        title: "Step 6: Install App",
        description: "Install the app on your store to generate API credentials.",
        id: "step-6",
        image: "/shopify-step6-install.png",
    },
    {
        title: "Step 7: Copy API Credentials",
        description: "Copy the Admin API access token and store URL to connect your AI tool.",
        id: "step-7",
        image: "/shopify-step7-copy-credentials.png",
    },
    {
        title: "Step 8: Connect to Our App",
        description: "Paste the store URL and API access token into the onboarding form.",
        id: "step-8",
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
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const currentStepData = steps[currentStep];

    // Framer Motion slide variants
    const variants = {
        enter: { x: 300, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -300, opacity: 0 },
    };

    return (
        <div className="bg-primary/10 p-6 rounded-xl border border-primary/30 relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={currentStep}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="md:w-1/2 text-center md:text-left">
                            <h2 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
                                <ShoppingBag className="text-primary" /> {currentStepData.title}
                            </h2>
                            <p className="text-primary/80">{currentStepData.description}</p>
                        </div>

                        {currentStepData.image && (
                            <motion.img
                                src={currentStepData.image}
                                alt={currentStepData.title}
                                className="md:w-1/2 rounded-lg shadow-lg border border-white/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            />
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-between w-full">
                        <motion.button
                            onClick={handleBack}
                            className={`p-2 rounded-full transition-colors ${currentStep === 0 ? 'invisible' : 'bg-white/10 hover:bg-white/20'}`}
                            whileHover={{ scale: 1.1 }}
                            aria-label="Previous step"
                        >
                            <ArrowLeft size={20} className="text-white" />
                        </motion.button>

                        {currentStepData.id === "step-8" ? (
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
                                <motion.button
                                    onClick={handleConnectShopify}
                                    className="bg-primary px-4 py-2 rounded-lg text-primary-foreground font-semibold w-full"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Connect"}
                                </motion.button>
                            </div>
                        ) : (
                            <motion.button
                                onClick={handleNext}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                aria-label="Next step"
                            >
                                <ArrowRight size={20} className="text-white" />
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default OnboardingSlides;
