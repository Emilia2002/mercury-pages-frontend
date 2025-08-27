// FILE: src/components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="border-t border-white/10 mt-20">
            <div className="container mx-auto px-8 py-12 grid md:grid-cols-4 gap-8">
                <div className="flex flex-col gap-4">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                        <Zap className="w-6 h-6 text-[#38BDF8]" />
                        <span>Mercury Pages</span>
                    </Link>
                    <p className="text-gray-400 text-sm">Deliver product pages at divine speed.</p>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Product</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Company</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><Link href="#" className="hover:text-white">Contact</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Legal</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="text-center py-4 border-t border-white/10 text-gray-500 text-sm">
                © {new Date().getFullYear()} Mercury Pages. All rights reserved.
            </div>
        </footer>
    );
};