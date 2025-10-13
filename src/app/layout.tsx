import './globals.css';
import { Poppins } from 'next/font/google';
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import {GoogleOAuthProvider}  from "@react-oauth/google";

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
});

const CLIENT_ID = "26856400342-efo7b6dbhtfktefstohcqs9he4kg707k.apps.googleusercontent.com"

export const metadata = {
    title: 'Mercury Pages | AI Product Page Generator',
    description: 'Deliver product pages at divine speed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${poppins.className} bg-[#111827] text-[#E5E7EB] antialiased`}>
        <AuthProvider>
            <GoogleOAuthProvider clientId={(CLIENT_ID)}>
            {children}
            </GoogleOAuthProvider>
        </AuthProvider>
        </body>
        </html>
    );
}