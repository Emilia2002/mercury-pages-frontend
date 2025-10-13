// FILE: src/app/(auth)/signin/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {AlertCircle, Eye, EyeOff, Zap} from 'lucide-react';
import {GoogleLogin, googleLogout} from "@react-oauth/google";

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const auth = useAuth();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!isValidEmail(email)) {
                setError('Please enter a valid email address.');
                return;
            }

            if (!password.trim()) {
                setError("Please enter your password.");
                return;
            }

            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(`${API_BASE_URL}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error('Incorrect email or password.');
            }

            const data = await response.json();
            auth.login(data.access_token);
            router.push('/crm-dashboard');
        } catch (err) {
            setError("Incorrect email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const handleGoogleLogin = async (credentialResponse: any) => {
        const IdToken = credentialResponse.credential;
        if (IdToken) {
            try {
                const response = await fetch(`${API_BASE_URL}/google-login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({id_token: IdToken}),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error('Google login failed');
                }

                const data = await response.json();
                auth.login(data.access_token);
                router.push('/crm-dashboard');
            } catch (err) {
                setError("An unknown error occurred during Google login. Please try again.");
                googleLogout();
            }
        }
    };

    return (
        <>
            <div className="text-center">
                <Zap className="w-10 h-10 text-white mx-auto mb-4" />
                <h2 className="text-3xl font-bold gradient-text text-white">Welcome Back</h2>
                <p className="text-gray-400">Sign in to continue to your dashboard.</p>
            </div>
            {error && (
                <div className="mt-6 flex items-center gap-2 bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-md">
                    <AlertCircle size={20} />
                    <span className="text-sm">{error}</span>
                </div>
            )}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Email address"
                    />
                </div>
                <div className="relative">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                    >
                        {showPassword ? <Eye size={18}/> : <EyeOff size={18}/>}
                    </button>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-white rounded-md shadow-sm text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary glow-on-hover disabled:opacity-50 text-white"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </div>
                {/*<div className="flex items-center justify-center">*/}
                {/*<GoogleLogin onSuccess={handleGoogleLogin} onError={() => console.log("Login failed")}/>*/}
                {/*</div>*/}
            </form>
            <p className="mt-4 text-center text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-medium text-primary hover:text-primary/90">
                    Sign Up
                </Link>
            </p>
        </>
    );
}