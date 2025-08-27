// FILE: src/app/(auth)/signup/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function SignUpPage() {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ first_name: firstName, email, password }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (responseData.detail && Array.isArray(responseData.detail)) {
                    const firstError = responseData.detail[0];
                    const errorMessage = `${firstError.loc[1]} - ${firstError.msg}`;
                    throw new Error(errorMessage);
                }
                // Dacă este o altă eroare, afișăm mesajul general.
                throw new Error(responseData.detail || 'Registration failed');
            }

            router.push('/signin?registered=true');
        } catch (err) {
            setError("We have encountered a problem. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <div className="text-center">
                <Zap className="w-10 h-10 text-white mx-auto mb-4" />
                <h2 className="text-white text-3xl font-bold gradient-text">Create Your Account</h2>
                <p className="text-white">to start generating pages at divine speed.</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
                <div className="space-y-4">
                    <input
                        id="first-name" name="first-name" type="text" required
                        value={firstName} onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="First Name"
                    />
                    <input
                        id="email-address" name="email" type="email" required
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Email address"
                    />
                    <input
                        id="password" name="password" type="password" required
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Password"
                    />
                    <input
                        id="confirm-password" name="confirm-password" type="password" required
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Confirm Password"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        id="terms" name="terms" type="checkbox"
                        checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                        By registering you agree to our{' '}
                        <Link href="/terms" className="text-primary hover:underline">
                            Terms & Conditions
                        </Link>
                    </label>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-white rounded-md shadow-sm text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary glow-on-hover disabled:opacity-50 text-white"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </div>
            </form>
            <p className="mt-4 text-center text-sm text-white">
                Already have an account?{' '}
                <Link href="/signin" className="font-medium text-primary hover:text-primary/90">
                    Sign In
                </Link>
            </p>
        </>
    );
}