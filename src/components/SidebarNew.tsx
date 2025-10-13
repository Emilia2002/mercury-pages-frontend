"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Zap,
    TrendingUp,
    Globe,
    Search,
    Bell,
    Settings,
    Plus,
    Link,
    Copy,
    Filter,
    BarChart3,
    FileText,
    Target,
    Briefcase,
    Database,
    Crown,
    LogOut,
    HelpCircle,
    ChevronRight,
    Sparkles,
    ShoppingBag,
    Eye,
    ExternalLink,
    Rocket,
    Brain,
    Palette,
    Share2,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Menu,
    X, MessageCircleIcon
} from "lucide-react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/contexts/AuthContext";

export default function Sidebar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const auth = useAuth();

    const handleLogout = () => {
        auth.logout();
    };

    const router = useRouter();
    return (
        <>
            {/* Buton meniu mobil - vizibil pe ecrane mici */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 text-white backdrop-blur-xl bg-slate-900/40 p-2 rounded-full"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Suprapunere pentru meniul mobil */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            <div
                className={`
                    lg:col-span-2
                    backdrop-blur-xl bg-slate-900/40 border border-cyan-500/20 rounded-3xl p-6 pb-6 h-full flex flex-col shadow-2xl shadow-cyan-500/10
                    fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:relative lg:translate-x-0
                `}
            >
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-4 right-4 lg:hidden text-white p-2 rounded-full"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="space-y-6 flex-1">
                    <div className="text-center mt-8 lg:mt-0">
                        <div className="flex items-center justify-center mb-2">
                            <Rocket className="h-8 w-8 text-cyan-400 mr-2" />
                            <h1 className="text-xl font-bold text-white bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                                Mercury Pages
                            </h1>
                        </div>
                        <p className="text-slate-300 text-sm">AI-Powered Page Generator</p>
                    </div>

                    <div>
                        <h4 className="text-cyan-300 text-sm font-semibold uppercase tracking-wider mb-3">Main Menu</h4>
                        <nav className="space-y-2">
                            {[
                                { icon: BarChart3, label: "Dashboard",  active: false, href: "/crm-dashboard" },
                                { icon: FileText, label: "My Pages", href: "/my-pages" },
                                { icon: Target, label: "Ad Generator", href: "/ad-generator" },
                                { icon: TrendingUp, label: "Shopify Integration", href: "/integrations-shopify" },
                            ].map((item, index) => (
                                <Button
                                    key={index}
                                    onClick={() => item.href ? router.push(item.href) : null}
                                    className={`w-full justify-start text-base text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-200 transition-all duration-300 ease-out hover:scale-[1.02] h-11 group p-3 rounded-lg ${
                                        item.active
                                            ? "bg-cyan-500/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                                            : ""
                                    }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-5 w-5 ${item.active ? "text-cyan-300" : "group-hover:text-cyan-300"}`}
                                    />
                                    {item.label}
                                </Button>
                            ))}
                        </nav>

                        {/*<nav className="space-y-2">*/}
                        {/*    {[*/}
                        {/*        { icon: MessageCircleIcon, label: "AI Assistant" },*/}
                        {/*    ].map((item, index) => (*/}
                        {/*        <Button*/}
                        {/*            key={index}*/}
                        {/*            className="w-full justify-start text-base text-slate-200 hover:bg-purple-500/10 hover:text-purple-200 transition-all duration-300 ease-out hover:scale-[1.02] h-11 group p-3 rounded-lg"*/}
                        {/*        >*/}
                        {/*            <item.icon className="mr-3 h-5 w-5 group-hover:text-purple-300" />*/}
                        {/*            {item.label}*/}
                        {/*        </Button>*/}
                        {/*    ))}*/}
                        {/*</nav>*/}
                    </div>


                    <div>
                        <h4 className="text-pink-300 text-sm font-semibold uppercase tracking-wider mb-3">Settings</h4>
                        <nav className="space-y-2">
                            {[
                                { icon: Settings, label: "Preferences" },
                            ].map((item, index) => (
                                <Button
                                    key={index}
                                    className="w-full justify-start text-base text-slate-200 hover:bg-pink-500/10 hover:text-pink-200 transition-all duration-300 ease-out hover:scale-[1.02] h-11 group p-3 rounded-lg"
                                    onClick={() => router.push('/account') }
                                >
                                    <item.icon className="mr-3 h-5 w-5 group-hover:text-pink-300" />
                                    {item.label}
                                </Button>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="flex-shrink-0 space-y-2 pt-2 border-t border-slate-700/50">
                    <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-4 shadow-lg shadow-purple-500/20">
                        <div className="text-center space-y-3">
                            <div>
                                <p className="text-slate-300 text-sm">Unlimited AI generations</p>
                            </div>
                            <Button

                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300 ease-out hover:scale-[1.02] text-sm font-medium shadow-lg shadow-purple-500/30 p-2 rounded-lg"
                                onClick={() =>router.push('/pricing') }
                            >
                                Upgrade Now
                                <ChevronRight className="ml-2 h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Button
                            className="w-full justify-start text-base text-slate-300 hover:bg-slate-700/30 hover:text-white transition-all duration-300 ease-out hover:scale-[1.02] p-3 rounded-lg"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
