// FILE: src/app/layout.tsx
import './globals.css';
import { Poppins } from 'next/font/google';
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

export const metadata = {
    title: 'Mercury Pages | AI Product Page Generator',
    description: 'Deliver product pages at divine speed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${poppins.className} bg-[#111827] text-[#E5E7EB] antialiased`}>
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}