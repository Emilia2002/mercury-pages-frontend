"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Zap,
  BrainCircuit,
  Sparkles,
  Target,
  CheckCircle,
  MousePointerClick,
  Star,
  Wand2,
  Rocket,
  FileText,
  PackageCheck
} from "lucide-react"
import { useState, useEffect } from "react"

const SparklesOverlay = () => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        {[...Array(50)].map((_, i) => (
            <div
                key={i}
                className={`absolute rounded-full animate-pulse ${
                    i % 3 === 0
                        ? "w-1 h-1 bg-cyan-400/30"
                        : i % 3 === 1
                            ? "w-2 h-2 bg-purple-400/20"
                            : "w-1.5 h-1.5 bg-cyan-300/25"
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 5}s`,
                }}
            />
        ))}
      </div>
  )
}

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentMetric, setCurrentMetric] = useState(0)
  const router = useRouter();

  const metrics = [
    { value: "< 2 Min", label: "Generation Time" },
    { value: "3+", label: "Platforms Supported" },
    { value: "4", label: "AD generator formats" },
    { value: "1-Click", label: "Shopify Export" },
  ];


  useEffect(() => {
    setIsVisible(true)
    const metricInterval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length)
    }, 2000)

    return () => {
      clearInterval(metricInterval)
    }
  }, [])

  return (
      <div className="min-h-screen w-full relative isolate bg-slate-950 text-white">
        <SparklesOverlay />
        <Header />

        <main>
          {/* Hero Section - Full Width */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="container mx-auto px-6 py-20 relative z-10">
              <div className="max-w-6xl mx-auto">
                {/* Main hero content */}
                <div className="text-center mb-16">
                  <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/40 rounded-full px-6 py-3 mb-8 transition-all duration-1000 hover:scale-105 hover:border-cyan-400/60 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-sm font-medium text-white">Start generating fast Product Pages</span>
                    <div className="flex ml-2">
                      {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>

                  <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-balance transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <span className="text-cyan-400 font-bold">Go From a Link to a Live Product Page in Seconds</span>
                  </h1>

                  <p className={`text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    Paste any product link and let our <span className="text-white font-semibold">AI tool</span> craft high-converting Shopify pages while optimizing your entire business strategy.
                  </p>

                  <div className={`max-w-3xl mx-auto mb-16 transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
                      <input type="text" placeholder="Paste your AliExpress, Amazon, or Shopify link here..." className="flex-grow bg-transparent text-base px-6 py-4 focus:outline-none placeholder-gray-400 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50" />
                      <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      onClick={() => router.push('/signup')}>
                        <BrainCircuit className="w-5 h-5" />
                        Generate with AI
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <p className="text-sm text-gray-400">✨ Free trial • No credit card required • 2-minute setup</p>
                    </div>
                  </div>
                </div>

                <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 transition-all duration-1000 delay-800 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                  {metrics.map((metric, index) => (
                      <div key={index} className={`text-center p-6 rounded-2xl border transition-all duration-500 hover:scale-110 cursor-pointer ${currentMetric === index ? "bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30 scale-105 shadow-lg shadow-cyan-500/20" : "bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50"}`}>
                        <div className="text-2xl lg:text-3xl font-bold text-white mb-2">{metric.value}</div>
                        <div className="text-sm text-white">{metric.label}</div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* What We Do Section */}
          <section className="bg-slate-950">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wide">WHAT WE DO</span>
                <h2 className="text-4xl font-bold mt-4 text-white">Transform Any Product Link Into Sales-Ready Pages</h2>
                <p className="text-xl text-gray-300 mt-4 max-w-3xl mx-auto">Mercury Pages uses advanced AI to extract product information from any URL and creates optimized Shopify pages that convert visitors into customers.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-slate-800/30 p-8 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MousePointerClick className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Universal Product Import</h3>
                  <p className="text-gray-300">Import products from different platforms including Amazon, AliExpress, eBay, and more with just a URL.</p>
                </div>
                <div className="bg-slate-800/30 p-8 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BrainCircuit className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">AI Content Generation</h3>
                  <p className="text-gray-300">Our AI creates compelling product titles, descriptions, and benefits.</p>
                </div>
                <div className="bg-slate-800/30 p-8 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Smart Ad Generator</h3>
                  <p className="text-gray-300">Generate 12 conversion-optimized ads for Facebook, Instagram, Stories, and Google Display automatically.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section - Redesigned to match Hero */}
          <section id="benefits" className="relative overflow-hidden py-20">
            <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-12">
                <span className="text-[#64ffda] font-semibold">BENEFITS</span>
                <h2 className="text-4xl font-bold mt-2 text-white">Everything You Need to Launch Faster</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-slate-800/30 backdrop-blur-sm p-8 rounded-xl border border-white/10">
                  <Zap className="w-10 h-10 text-[#64ffda] mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-white">Launch at Light Speed</h3>
                  <p className="text-gray-400">Go from product idea to a live Shopify page in under 2 minutes. Stop wasting time on manual work and start selling faster.</p>
                </div>
                <div className="bg-slate-800/30 backdrop-blur-sm p-8 rounded-xl border border-white/10">
                  <Wand2 className="w-10 h-10 text-[#64ffda] mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-white">Captivate with AI Copywriting</h3>
                  <p className="text-gray-400">Our AI, trained on top-converting brands, writes persuasive descriptions that turn visitors into customers.</p>
                </div>
                <div className="bg-slate-800/30 backdrop-blur-sm p-8 rounded-xl border border-white/10">
                  <Rocket className="w-10 h-10 text-[#64ffda] mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-white">Elevate Your Brand</h3>
                  <p className="text-gray-400">Create stunning, professional-quality pages that build trust and make your brand look incredible, instantly.</p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section - Redesigned to match Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br py-20">
            <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-12">
                <span className="text-[#64ffda] font-semibold">HOW IT WORKS</span>
                <h2 className="text-4xl font-bold mt-2 text-white">From Link to Launch in 3 Swift Steps</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8 text-center relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-12">
                  <svg width="100%" height="2">
                    <line x1="0" y1="1" x2="100%" y2="1" strokeWidth="2" strokeDasharray="8 8" className="stroke-gray-700" />
                  </svg>
                </div>
                <div className="flex flex-col items-center p-6 z-10">
                  <div className="bg-[#64ffda] text-[#0a192f] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <MousePointerClick size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">1. Paste Link</h3>
                  <p className="text-gray-400">Provide any product URL.</p>
                </div>
                <div className="flex flex-col items-center p-6 z-10">
                  <div className="bg-[#64ffda] text-[#0a192f] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">2. Generate Content</h3>
                  <p className="text-gray-400">Our AI crafts a title, description, and benefits in seconds.</p>
                </div>
                <div className="flex flex-col items-center p-6 z-10">
                  <div className="bg-[#64ffda] text-[#0a192f] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <PackageCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">3. Export to Shopify</h3>
                  <p className="text-gray-400">Launch your new, high-converting page with a single click.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20">
            <div className="container mx-auto px-6">
              <div className="items-center bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-8 md:p-12 rounded-2xl border border-purple-500/20">
                <div>
                  <span className="text-[#64ffda] font-semibold">CREATE OUTSTANDING ADS</span>
                  <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-white">From Product to Profit-Ready Ads in 30 Seconds</h2>
                  <p className="text-gray-400 text-lg mb-6">Skip the design headaches. Our Smart Ad Generator creates 12 conversion-optimized ads automatically - 3 variations each for Instagram posts, Facebook ads, Stories, and Google Display. Just pick your product and download ready-to-launch campaigns.</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" /> Auto-generates 3 headlines per format
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" /> Multiple visual templates (square, vertical, landscape)
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" /> Export as PNG using advanced rendering
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" /> Platform-optimized CTAs and copy
                    </li>
                  </ul>
                </div>
                {/*<div className="bg-gray-900/50 rounded-lg relative h-72 md:h-96 lg:h-[500px] overflow-hidden">*/}
                {/*  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20"></div>*/}
                {/*  <div className="absolute inset-0 flex items-center justify-center">*/}
                {/*    <div className="text-center">*/}
                {/*      <img src="/ad-generator-preview.jpg" alt="Ad Generator Preview" className="absolute inset-0 w-full h-full object-cover" />*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*</div>*/}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-20">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <span className="text-[#64ffda] font-semibold">PRICING</span>
                <h2 className="text-4xl font-bold mt-2 text-white">Simple Plans for Ambitious Brands</h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Craftsman Plan */}
                <div className="bg-gray-800/30 p-8 rounded-xl border border-white/10 flex flex-col">
                  <h3 className="text-2xl font-bold mb-2 text-white">Craftsman</h3>
                  <p className="text-gray-400 mb-6">For getting started and launching your first products.</p>
                  <p className="text-5xl font-bold mb-6 text-white">€0<span className="text-lg font-normal text-gray-400">/mo</span></p>
                  <ul className="space-y-4 text-gray-300 mb-8">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#34D399] mr-2"/>5 Product Pages / month
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#34D399] mr-2"/>AI-Generated Product Descriptions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#34D399] mr-2"/>Built-In Ad Generator for Facebook,
                      Instagram, Google, Pinterest and TikTok
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#34D399] mr-2"/>SEO Optimization for Product Pages
                    </li>
                  </ul>
                  <Link href="/signup"
                        className="mt-auto w-full text-center bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors">
                    Choose Plan
                  </Link>
                </div>
                {/* Artisan Plan */}
                <div
                    className="bg-[#64ffda] text-[#0a192f] p-8 rounded-xl border-2 border-[#F472B6] relative flex flex-col scale-105 shadow-2xl shadow-[#64ffda]/20">
                  <span className="absolute top-0 -translate-y-1/2 bg-[#F472B6] text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                  <h3 className="text-2xl font-bold mb-2">Artisan</h3>
                  <p className="text-gray-800 mb-6">For growing brands that test and launch regularly.</p>
                  <p className="text-5xl font-bold mb-6">€39<span className="text-lg font-normal text-gray-800">/mo</span></p>
                  <ul className="space-y-4 mb-8 text-gray-800">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2" />Unlimited Product Pages
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2" />AI-Generated Product Descriptions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2" />Built-In Ad Generator for Facebook,
                      Instagram, Google, Pinterest and TikTok
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2" />SEO Optimization for Product Pages
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#0a192f] mr-2" />Priority AI Processing
                    </li>
                  </ul>
                  <Link href="/signup" className="mt-auto w-full text-center bg-[#0a192f] text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors">
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="py-20">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <span className="text-[#64ffda] font-semibold">FAQ</span>
                <h2 className="text-4xl font-bold mt-2 text-white">Frequently Asked Questions</h2>
                <p className="text-xl text-gray-400 mt-4">Everything you need to know about Mercury Pages</p>
              </div>
              <div className="space-y-6 max-w-4xl mx-auto">
                {[
                  { question: "How does Mercury Pages extract product information from links?", answer: "Our advanced AI technology analyzes product URLs from over 100+ platforms including Amazon, AliExpress, eBay, and more. It extracts key details like product names, descriptions, images, and specifications to create comprehensive Shopify-ready pages." },
                  { question: "How long does it take to create a product page?", answer: "Mercury Pages can generate a complete product page in under 30 seconds. Simply paste your product link, and our AI will create optimized titles, descriptions, and content that's ready to publish to your Shopify store." },
                  { question: "Is there a limit to how many products I can import?", answer: "The Craftsman plan includes 5 product pages per month, perfect for getting started. The Artisan plan offers unlimited product pages, ideal for growing businesses that need to scale their product catalog quickly." },
                  { question: "What happens to my data?", answer: "Your data is completely secure and encrypted. We never share your information with third parties." },
                  { question: "Can I cancel my subscription anytime?", answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. If you cancel, you'll continue to have access to your plan features until the end of your current billing period." },
                ].map((faq, index) => (
                    <div key={index} className="bg-gray-800/30 p-8 rounded-xl border border-white/10">
                      <h3 className="font-bold text-lg text-white mb-4">{faq.question}</h3>
                      <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                    </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer/>
      </div>
  )
}