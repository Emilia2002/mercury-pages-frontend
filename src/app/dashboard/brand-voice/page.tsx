// FILE: src/app/dashboard/brand-voice/page.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, BrainCircuit, Save, Share2, Instagram, MessageCircle, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AnalysisResult {
    keywords: string[];
    social_platforms: string[];
    sample_post: string;
}

export default function BrandVoicePage() {
    const auth = useAuth();
    const [description, setDescription] = useState('');
    const [exampleText, setExampleText] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const router = useRouter()

    const handleAnalyze = async () => {
        if (!description || !auth.token) return;
        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            const response = await fetch(`${API_BASE_URL}/brand-voice/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ description }),
            });

            if (response.status === 403) {
                alert("Monthly page generation limit reached. Please upgrade your plan.");
                router.push('/pricing');
            }

            if (!response.ok && response.status !== 403) throw new Error('AI analysis failed.');
            const data = await response.json();
            setAnalysis(data);
        } catch (error) {
            console.error("Error analyzing brand voice:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!description || !analysis || !auth.token) return;
        setIsSaving(true);
        try {
            await fetch(`${API_BASE_URL}/users/me/brand-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`,
                },
                body: JSON.stringify({
                    description,
                    example_text: exampleText,
                    keywords: analysis.keywords
                }),
            });


            alert("Brand profile saved successfully!");
        } catch (error) {
            console.error("Error saving brand profile:", error);
            alert("Error saving profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="space-y-10">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
                    <Wand2 size={36} />
                    AI Brand Voice Trainer
                </h1>
                <p className="text-gray-400">
                    Teach the AI to write in your style. The more context you provide, the better the results.
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/30 p-6 rounded-xl border border-white/10"
            >
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                    <Sparkles className="text-primary" /> 1. Describe Your Brand
                </h2>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Example: We sell streetwear for creative young adults. The tone should be relaxed, witty, and use modern slang."
                    className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary text-gray-200"
                />
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !description}
                    className="mt-4 bg-primary text-primary-foreground font-bold py-2 px-6 rounded-lg glow-on-hover flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <BrainCircuit size={20} />
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Brand Voice'}
                </button>
            </motion.div>

            <AnimatePresence>
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        {/* Cuvinte Cheie */}
                        <div className="bg-gray-800/30 p-6 rounded-xl border border-primary/50">
                            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                                <Sparkles className="text-accent" /> Your Brand's Personality
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {analysis?.keywords?.map((keyword, index) => (
                                    <motion.span
                                        key={keyword}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="bg-accent/20 text-accent font-semibold px-4 py-1 rounded-full"
                                    >
                                        {keyword}
                                    </motion.span>
                                ))}
                            </div>
                        </div>

                        {/* Sugestii Social Media */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-800/30 p-6 rounded-xl border border-white/10">
                                <h2 className="text-2xl sm:text-xl font-semibold mb-4 flex items-center gap-3">
                                    <Share2 className="text-primary" /> Recommended Platforms
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {analysis?.social_platforms?.map((platform, index) => (
                                        <motion.span
                                            key={platform}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: (analysis.keywords?.length || 0 + index) * 0.1 }}
                                            className="bg-primary/20 text-primary font-semibold px-4 py-1 rounded-full flex items-center gap-2"
                                        >
                                            <Instagram size={16} /> {platform}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-800/30 p-6 rounded-xl border border-white/10">
                                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                                    <MessageCircle className="text-primary"/> Sample Post
                                </h2>
                                <div className="relative">
                                    <p className="text-gray-300 bg-gray-900 p-4 rounded-md break-words whitespace-normal">
                                        {analysis?.sample_post}
                                    </p>
                                    <button onClick={() => copyToClipboard(analysis.sample_post)}
                                            className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded-md hover:bg-gray-600">
                                        <Copy size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Secțiunea 3: Exemplu de Text și Salvare */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: 0.2}}
                className="bg-gray-800/30 p-6 rounded-xl border border-white/10"
            >
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                    <Sparkles className="text-primary" /> 2. Provide an Example (Optional)
                </h2>
                <textarea
                    value={exampleText}
                    onChange={(e) => setExampleText(e.target.value)}
                    placeholder="Paste a text sample you like, from your site or another brand you admire. This helps the AI understand your style."
                    className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary text-gray-200"
                />
                <button
                    onClick={handleSaveProfile}
                    disabled={isSaving || !description}
                    className="mt-4 bg-green-600 text-white font-bold py-3 px-8 rounded-lg glow-on-hover flex items-center gap-2 disabled:opacity-50"
                >
                    <Save size={20} />
                    {isSaving ? 'Saving...' : 'Save Brand Profile'}
                </button>
            </motion.div>
        </div>
    );
}
