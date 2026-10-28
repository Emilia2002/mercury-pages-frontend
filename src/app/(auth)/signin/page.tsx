'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowUpRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.');
    if (!password.trim()) return setError('Please enter your password.');
    setIsLoading(true);
    try {
      const formData = new URLSearchParams({ username: email, password });
      const response = await fetch(`${API_BASE_URL}/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData.toString() });
      if (!response.ok) throw new Error('Incorrect email or password.');
      const data = await response.json();
      auth.login(data.access_token);
      router.push('/crm-dashboard');
    } catch { setError('Incorrect email or password. Please try again.'); } finally { setIsLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#f7f5f2] px-5 py-5 text-[#17141b] md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[#ded9d5] bg-white shadow-[0_24px_80px_rgba(37,25,42,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#211329] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 size-80 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-violet-500/30 blur-3xl" />
          <Link href="/" className="relative z-10 text-lg font-semibold tracking-[-0.04em]">mercury<span className="text-fuchsia-300">.</span></Link>
          <div className="relative z-10 max-w-md">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-200">The page engine for modern commerce</p>
            <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.06em]">Make every product feel like a best seller.</h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/65">Generate a sharper storefront, stronger creative, and a cleaner path from first click to checkout.</p>
          </div>
          <p className="relative z-10 text-xs text-white/45">Built for the next generation of independent brands.</p>
        </section>
        <section className="flex flex-col justify-center p-7 sm:p-12">
          <div className="mb-10 flex items-center justify-between lg:hidden"><Link href="/" className="text-lg font-semibold tracking-[-0.04em]">mercury<span className="text-fuchsia-600">.</span></Link><Sparkles className="size-5 text-fuchsia-600" /></div>
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-9"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-600">Welcome back</p><h2 className="text-4xl font-semibold tracking-[-0.06em]">Sign in to Mercury</h2><p className="mt-3 text-sm leading-6 text-[#746d75]">Your next high-converting page is waiting.</p></div>
            {error && <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="size-4" />{error}</div>}
            <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
              <label className="flex flex-col gap-2 text-sm font-medium">Email address<input id="email-address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brand.com" className="h-12 rounded-xl border border-[#d9d4d1] bg-[#fbfaf9] px-4 outline-none transition focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10" /></label>
              <label className="flex flex-col gap-2 text-sm font-medium">Password<div className="relative"><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-[#d9d4d1] bg-[#fbfaf9] px-4 pr-12 outline-none transition focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-[#8a828b]">{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></div></label>
              <button disabled={isLoading} className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#211329] text-sm font-semibold text-white transition hover:bg-fuchsia-700 disabled:opacity-60">{isLoading ? 'Signing in…' : 'Continue'}<ArrowUpRight className="size-4" /></button>
            </form>
            <p className="mt-7 text-center text-sm text-[#746d75]">Don&apos;t have an account? <Link href="/signup" className="font-semibold text-fuchsia-700">Create one</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
