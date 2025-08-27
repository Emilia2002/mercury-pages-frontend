// FILE: src/app/page.tsx
import React from 'react';
import Link from 'next/link';
import { Rocket, Zap, Wand2, ArrowRight, CheckCircle, MousePointerClick, FileText, PackageCheck, BrainCircuit } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function LandingPage() {
  return (
      <div className="min-h-screen w-full bg-[#111827] text-[#E5E7EB]">
        <Header />
        <main className="container mx-auto px-8 py-14">
          {/* Hero Section */}
          <section className="text-center py-35 lg:py-28 px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight gradient-text">
              Go From a Link to a Live Product Page in Seconds.
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              Stop wasting hours on repetitive tasks. Paste any product AliExpress product link and let our AI craft a high-converting Shopify page for you.
            </p>
            {/* Corrected: Use flex-col on mobile, flex-row on larger screens */}
            <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4 md:gap-2 bg-gray-800/50 border border-white/20 rounded-lg p-2 shadow-lg">
              <input
                  type="text"
                  placeholder="Paste your AliExpress, Amazon, or Shopify link here..."
                  className="flex-grow bg-transparent text-sm md:text-base px-4 py-2 md:py-0 focus:outline-none"
              />
              {/* Corrected: Make the button full-width on mobile and shrink on desktop */}
              <Link href="/dashboard" className="w-full md:w-auto bg-[#38BDF8] text-black font-bold py-3 px-6 rounded-md flex items-center justify-center gap-2 glow-on-hover">
                <span>Generate</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* Benefits Section */}
          <section id="benefits" className="py-20">
            <div className="text-center mb-12">
              <span className="text-[#38BDF8] font-semibold">BENEFITS</span>
              <h2 className="text-4xl font-bold mt-2">Everything You Need to Launch Faster</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="bg-gray-800/30 p-8 rounded-xl border border-white/10">
                <Zap className="w-10 h-10 text-[#38BDF8] mb-4" />
                <h3 className="text-2xl font-bold mb-2">Launch at Light Speed</h3>
                <p className="text-gray-400">Go from product idea to a live Shopify page in under 2 minutes. Stop wasting time on manual work and start selling faster.</p>
              </div>
              <div className="bg-gray-800/30 p-8 rounded-xl border border-white/10">
                <Wand2 className="w-10 h-10 text-[#38BDF8] mb-4" />
                <h3 className="text-2xl font-bold mb-2">Captivate with AI Copywriting</h3>
                <p className="text-gray-400">Our AI, trained on top-converting brands, writes persuasive descriptions that turn visitors into customers.</p>
              </div>
              <div className="bg-gray-800/30 p-8 rounded-xl border border-white/10">
                <Rocket className="w-10 h-10 text-[#38BDF8] mb-4" />
                <h3 className="text-2xl font-bold mb-2">Elevate Your Brand</h3>
                <p className="text-gray-400">Create stunning, professional-quality pages that build trust and make your brand look incredible, instantly.</p>
              </div>
              {/* --- NEW FEATURE HIGHLIGHT --- */}
              <div className="bg-gray-800/30 p-8 rounded-xl border border-white/10">
                <BrainCircuit className="w-10 h-10 text-[#38BDF8] mb-4" />
                <h3 className="text-2xl font-bold mb-2">Train Your AI Brand Voice</h3>
                <p className="text-gray-400">Define your brand's unique tone, and our AI will generate content that is a perfect match for your business style.</p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20">
            <div className="text-center mb-12">
              <span className="text-[#38BDF8] font-semibold">HOW IT WORKS</span>
              <h2 className="text-4xl font-bold mt-2">From Link to Launch in 3 Swift Steps</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-12">
                <svg width="100%" height="2">
                  <line x1="0" y1="1" x2="100%" y2="1" strokeWidth="2" strokeDasharray="8 8" className="stroke-gray-700"/>
                </svg>
              </div>
              <div className="flex flex-col items-center p-6 z-10">
                <div className="bg-[#38BDF8] text-black rounded-full w-16 h-16 flex items-center justify-center mb-4"><MousePointerClick size={32}/></div>
                <h3 className="text-xl font-bold mb-2">1. Paste Link</h3>
                <p className="text-gray-400">Provide any product URL from AliExpress.</p>
              </div>
              <div className="flex flex-col items-center p-6 z-10">
                <div className="bg-[#38BDF8] text-black rounded-full w-16 h-16 flex items-center justify-center mb-4"><FileText size={32}/></div>
                <h3 className="text-xl font-bold mb-2">2. Generate Content</h3>
                <p className="text-gray-400">Our AI crafts a title, description, and benefits in seconds.</p>
              </div>
              <div className="flex flex-col items-center p-6 z-10">
                <div className="bg-[#38BDF8] text-black rounded-full w-16 h-16 flex items-center justify-center mb-4"><PackageCheck size={32}/></div>
                <h3 className="text-xl font-bold mb-2">3. Export to Shopify</h3>
                <p className="text-gray-400">Launch your new, high-converting page with a single click.</p>
              </div>
            </div>
          </section>

          {/* --- AI BRAND VOICE FEATURE SECTION (ENHANCED & RESPONSIVE) --- */}
          <section className="py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center bg-gray-800/30 p-8 md:p-12 rounded-2xl border border-white/10">
              {/* Text content on the left */}
              <div>
                <span className="text-accent font-semibold">YOUR UNIQUE ADVANTAGE</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Train Your AI Brand Voice</h2>
                <p className="text-gray-400 text-lg mb-6">
                  Don't settle for generic text. With Mercury Pages, you can teach our AI your brand's unique personality. Provide examples, define your tone, and our AI will generate content that is a perfect match for your business, every single time.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400"/> Maintain brand consistency across all products.</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400"/> Build a stronger connection with your customers.</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400"/> Stand out from the competition with unique copy.</li>
                </ul>
              </div>

              {/* Image container on the right (now larger and responsive) */}
              <div className="bg-gray-900/50 rounded-lg relative h-72 md:h-96 lg:h-[500px] overflow-hidden">
                <img
                    src="/elevate-your-brand.png" // Assumes the image is in your `public` folder
                    alt="AI Brand Voice Demonstration"
                    className="absolute inset-0 w-full h-full object-cover"
                />

              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-20">
            <div className="text-center mb-12">
              <span className="text-[#38BDF8] font-semibold">PRICING</span>
              <h2 className="text-4xl font-bold mt-2">Simple Plans for Ambitious Brands</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Craftsman Plan */}
              <div className="bg-gray-800/30 p-8 rounded-xl border border-white/10 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">Craftsman</h3>
                <p className="text-gray-400 mb-6">For getting started and launching your first products.</p>
                <p className="text-5xl font-bold mb-6">€0<span className="text-lg font-normal text-gray-400">/mo</span></p>
                <ul className="space-y-4 text-gray-300 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#34D399] mr-2"/>Unlimited
                    Shopify Stores
                  </li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#34D399] mr-2"/>5 Product
                    Pages / month
                  </li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#34D399] mr-2"/>1 AI Brand Voice Profile
                  </li>

                </ul>
                <Link href="/signup"
                      className="mt-auto w-full text-center bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors">Choose Plan</Link>
              </div>

              {/* Artisan Plan (Highlighted) */}
              <div className="bg-[#38BDF8] text-black p-8 rounded-xl border-2 border-[#F472B6] relative flex flex-col scale-105 shadow-2xl shadow-[#38bdf8]/20">
                <span className="absolute top-0 -translate-y-1/2 bg-[#F472B6] text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                <h3 className="text-2xl font-bold mb-2">Artisan</h3>
                <p className="text-gray-800 mb-6">For growing brands that test and launch regularly.</p>
                <p className="text-5xl font-bold mb-6">€39<span className="text-lg font-normal text-gray-800">/mo</span></p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-black mr-2" />Unlimited Shopify Stores</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-black mr-2" />Unlimited Product Pages</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-black mr-2" />AI Brand Voice Profiles</li>
                </ul>
                <Link href="/signup" className="mt-auto w-full text-center bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors glow-on-hover">Start Free Trial</Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
  );
}