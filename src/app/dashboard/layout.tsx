// FILE: src/app/dashboard/layout.tsx
'use client';

import React, {useState} from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {Menu} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    React.useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            router.push('/signin');
        }
    }, [auth.isLoading, auth.isAuthenticated, router]);

    if (auth.isLoading || !auth.isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="md:flex min-h-screen w-full bg-[#111827] text-[#E5E7EB]">
            {/* Mobile Menu Button */}
            <div className="fixed top-4 left-4 z-50 md:hidden ">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-lg bg-[#1f2937] text-white"
                    aria-label="Open sidebar"
                >
                    <Menu size={24}/>
                </button>
            </div>

            {/* Sidebar component */}
            <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen}/>

            {/* Main Content Area */}
            {/* Corrected: This is now a sibling of Sidebar and uses md:ml-64 */}
            <main className="flex-1 p-4 sm:p-8 md:p-12  transition-all duration-300">
                    {children}
            </main>
        </div>
);
}