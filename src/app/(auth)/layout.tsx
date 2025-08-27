// FILE: src/app/(auth)/layout.tsx
import React from 'react';
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="bg-[#111827] min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage:
                     "url('abstract-smooth-soap-bubble-black-background.png')"}}
        >
            <div className="absolute inset-0 bg-background/70"></div>

            <div className="relative w-full max-w-md p-8 space-y-8 bg-[#111827] rounded-xl border border-white/10 shadow-2xl shadow-primary/10">
                {children}
            </div>
        </div>
    );
}