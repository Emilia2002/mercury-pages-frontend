// FILE: src/components/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Correct the import path if necessary

export const Header = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="py-4 px-8 flex justify-between items-center sticky top-0 z-50 backdrop-blur-lg border-b border-white/10">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
                <Zap className="w-7 h-7 text-[#38BDF8]" />
                <span>Mercury Pages</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
                <Link href="/#benefits" className="text-gray-300 hover:text-white transition-colors">Benefits</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
                {/* Conditionally render links based on authentication status */}
                {isLoading ? (
                    <div className="text-gray-400">...</div>
                ) : isAuthenticated ? (
                    <>
                        <Link href="/crm-dashboard" className="bg-[#38BDF8] text-black font-bold py-2 px-4 rounded-lg glow-on-hover">
                            My Account
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/signin" className="text-gray-300 hover:text-white transition-colors">Login</Link>
                        <Link href="/signup" className="bg-[#38BDF8] text-black font-bold py-2 px-4 rounded-lg glow-on-hover">
                            Get Started Free
                        </Link>
                    </>
                )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
                <button onClick={toggleMenu} className="text-white">
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            <div className={`fixed inset-0 top-[76px] bg-black/90 backdrop-blur-md z-40 transition-transform transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
                <nav className="flex flex-col items-center gap-6 py-8">
                    <Link href="/#benefits" className="text-gray-300 text-lg hover:text-white transition-colors" onClick={toggleMenu}>Benefits</Link>
                    <Link href="/pricing" className="text-gray-300 text-lg hover:text-white transition-colors" onClick={toggleMenu}>Pricing</Link>
                    {isLoading ? (
                        <div className="text-gray-400 text-lg">...</div>
                    ) : isAuthenticated ? (
                        <Link href="/crm-dashboard" className="bg-[#38BDF8] text-black font-bold py-3 px-6 rounded-lg glow-on-hover text-lg" onClick={toggleMenu}>
                            My Account
                        </Link>
                    ) : (
                        <>
                            <Link href="/signin" className="text-gray-300 text-lg hover:text-white transition-colors" onClick={toggleMenu}>Login</Link>
                            <Link href="/signup" className="bg-[#38BDF8] text-black font-bold py-3 px-6 rounded-lg glow-on-hover text-lg" onClick={toggleMenu}>
                                Get Started Free
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};