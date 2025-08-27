'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Wand2, User, LogOut, Zap, X, Menu } from 'lucide-react';

interface SidebarProps {
    isSidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ isSidebarOpen, setSidebarOpen }: SidebarProps) => {
    const auth = useAuth();
    const pathname = usePathname();

    const navLinks = [
        { href: "/dashboard", icon: LayoutDashboard, label: "My Pages" },
        { href: "/dashboard/brand-voice", icon: Wand2, label: "Brand Voice" },
        { href: "/account", icon: User, label: "Account" },
    ];

    const handleLinkClick = () => {
        if (isSidebarOpen) {
            setSidebarOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 w-64 z-50 transition-transform duration-300 ease-in-out
                flex flex-col bg-[#1f2937] border-r border-white/10 p-4
                md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Mobile Top Bar with Toggle */}
                <div className="flex items-center justify-between mb-6 md:hidden">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold" onClick={handleLinkClick}>
                        <Zap className="w-6 h-6 text-primary" />
                        <span>Mercury Pages</span>
                    </Link>
                    <button
                        className="text-gray-400 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Logo (for desktop) */}
                <div className="hidden md:flex px-4 pt-4 mb-8">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold" onClick={handleLinkClick}>
                        <Zap className="w-8 h-8 text-primary" />
                        <span>Mercury Pages</span>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 flex flex-col gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={handleLinkClick}
                                className={`
                                    flex items-center gap-3 px-4 py-2 rounded-lg relative transition
                                    ${isActive
                                    ? 'bg-primary/10 text-primary font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }
                                `}
                            >
                                <link.icon size={20} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="mt-auto pt-4 border-t border-white/10">
                    <button
                        onClick={() => { auth.logout(); handleLinkClick(); }}
                        className="w-full flex items-center gap-3 px-4 py-2 mt-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
