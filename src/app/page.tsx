"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, ChevronDown, ChevronRight, Image as ImageIcon, Layers as Layers3, Sparkles, Wand as Wand2, Zap, Globe, ShoppingBag, Eye, Pencil, Rocket, Star, Palette, Monitor, Smartphone } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

const directions = [
  {
    name: "Editorial luxury",
    category: "Skincare",
    color: "from-[#f8d8ee] to-[#f1e7fa]",
    accent: "#6425c7",
    image: "https://images.pexels.com/photos/7317033/pexels-photo-7317033.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description: "Refined typography, generous whitespace, soft neutral tones.",
  },
  {
    name: "Modern minimal",
    category: "Home goods",
    color: "from-[#ebe7f5] to-[#f9f8fc]",
    accent: "#21182b",
    image: "https://images.pexels.com/photos/20557234/pexels-photo-20557234.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description: "Warm colors, contextual photography, understated layouts.",
  },
  {
    name: "Bold & expressive",
    category: "Accessories",
    color: "from-[#f5b6df] to-[#d8c3f4]",
    accent: "#e83ead",
    image: "https://images.pexels.com/photos/29502931/pexels-photo-29502931.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description: "Close-up imagery, confident typography, dramatic layouts.",
  },
]

const features = [
  {
    icon: Globe,
    title: "Smart product extraction",
    description: "Paste any product URL. Mercury pulls the title, images, variants, specs, and pricing — then structures it all into a coherent page.",
    color: "text-[#e83ead]",
    bg: "bg-[#f7e4f3]",
  },
  {
    icon: Palette,
    title: "Category-aware design",
    description: "Skincare gets editorial whitespace. Electronics gets clean spec tables. Fashion gets large imagery. The layout adapts to what you sell.",
    color: "text-[#6425c7]",
    bg: "bg-[#efe6fa]",
  },
  {
    icon: Pencil,
    title: "Visual page editor",
    description: "Drag to reorder sections, edit text inline, swap images, and adjust colors. Every element is yours to shape before you publish.",
    color: "text-[#e83ead]",
    bg: "bg-[#f7e4f3]",
  },
  {
    icon: ShoppingBag,
    title: "Shopify-ready export",
    description: "Push your polished product page directly to Shopify with a single click. No copy-paste, no reformatting, no friction.",
    color: "text-[#1f9d6f]",
    bg: "bg-[#e6f6f0]",
  },
  // {
  //   icon: Wand2,
  //   title: "Ad creative studio",
  //   description: "Turn any product into launch-ready ads across social, story, and display formats. Export as images, ready to run.",
  //   color: "text-[#6425c7]",
  //   bg: "bg-[#efe6fa]",
  // },
  {
    icon: Zap,
    title: "Brand-aware AI",
    description: "Mercury learns your visual identity and applies it consistently — so every page feels like it came from the same studio.",
    color: "text-[#e83ead]",
    bg: "bg-[#f7e4f3]",
  },
  {
    icon: ImageIcon,
    title: "Product page AI Image generator",
    description: "Generate AI Images directly in the product page editor.",    color: "text-[#e83ead]",
    bg: "bg-[#f7e4f3]",
  },

]

const steps = [
  {
    number: "01",
    title: "Paste a product URL",
    body: "Mercury extracts the useful details — images, variants, specifications, and product facts — without you lifting a finger.",
    icon: Globe,
  },
  {
    number: "02",
    title: "Choose a design direction",
    body: "Set the visual mood based on your product category. Mercury applies a considered design system with the right typography, spacing, and color palette.",
    icon: Palette,
  },
  {
    number: "03",
    title: "Polish in the editor",
    body: "Drag sections into the perfect order, edit copy, swap images, and fine-tune colors. What you see is exactly what you get.",
    icon: Pencil,
  },
  {
    number: "04",
    title: "Launch and export",
    body: "Publish your page and export to Shopify — all from the same workspace.",
    icon: Rocket,
  },
]

const stats = [
  { value: "10x", label: "Faster page creation" },
  { value: "9", label: "Distinct design presets" },
  { value: "1-click", label: "Shopify export" },
  { value: "100%", label: "Editable, always" },
]

const testimonials = [
  {
    quote: "We went from blank canvas to a polished product page in under five minutes. The editor is the best I've used for this kind of work.",
    author: "Studio founder",
    role: "Skincare brand",
  },
  {
    quote: "Mercury understood that a ceramic mug and a leather bag need completely different layouts. That intelligence is what sets it apart.",
    author: "Creative director",
    role: "Home & lifestyle",
  },
  {
    quote: "The Shopify export alone saved my team hours every week.",
    author: "Ecommerce lead",
    role: "Fashion accessories",
  },
]

const faqs = [
  ["What is Mercury Pages?", "Mercury Pages is an AI creative workspace that turns product information into polished storefronts, product stories, and launch-ready campaign concepts — then gives you a visual editor to refine everything before publishing."],
  ["Do I need design or copywriting experience?", "Not at all. Mercury creates a considered first draft for you, choosing the layout, typography, and visual direction based on what you're selling. You then get simple controls to refine the look, voice, and content."],
  ["How does the page editor work?", "The editor has three panels: a section list on the left where you drag to reorder, a live preview in the center, and a property inspector on the right. You can add, duplicate, hide, and delete sections; edit all text and images; adjust colors and typography; and see changes update live."],
  ["Can I edit everything before publishing?", "Yes. Every page is fully yours to shape — section order, copy, images, colors, fonts, spacing, and calls to action. Nothing is locked behind a paywall or fixed template."],
  ["Does it integrate with Shopify?", "Yes. Connect your store once, then export any generated product page to Shopify with a single click. Product title, description, images, variants, and pricing all sync automatically."],
  ["What kind of products work best?", "Mercury is designed for modern commerce across skincare, fashion, home goods, food, accessories, electronics, fitness, and luxury. It adapts its design approach based on the product category — so a serum page looks different from a sneaker page."],
  ["What's included in the free plan?", "Five product pages per month, AI-generated descriptions and SEO optimization. No credit card required to get started."],
  ["Is my data secure?", "Your product data and pages are stored securely with row-level access control. Only you can see and edit your own pages. We never share your data with third parties."],
]

const showcaseImages = [
  {
    url: "https://images.pexels.com/photos/7317074/pexels-photo-7317074.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    label: "Skincare",
    title: "Editorial skincare with generous whitespace",
  },
  {
    url: "https://images.pexels.com/photos/8346043/pexels-photo-8346043.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    label: "Fashion",
    title: "Fashion with large, confident imagery",
  },
  {
    url: "https://images.pexels.com/photos/15440777/pexels-photo-15440777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    label: "Home & lifestyle",
    title: "Home goods with warm, contextual layouts",
  },
  {
    url: "https://images.pexels.com/photos/3750640/pexels-photo-3750640.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    label: "Accessories",
    title: "Accessories with close-up, dramatic framing",
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
}

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-80px" },
  transition: { staggerChildren: 0.08 },
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#eae2f0] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
      >
        <span className="text-lg font-semibold tracking-[-0.03em] text-[#21182b]">{question}</span>
        <ChevronDown className={`size-5 shrink-0 text-[#e83ead] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 leading-7 text-[#766b80]">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fcfafd] text-[#21182b]">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-20 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
          <div className="pointer-events-none absolute -right-24 -top-32 size-[34rem] rounded-full bg-[#f2eafe] blur-3xl" />
          <div className="pointer-events-none absolute left-[-12rem] top-[28rem] size-[24rem] rounded-full bg-[#f9d9ee]/50 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e7c9e6] bg-white px-3.5 py-2 text-xs font-semibold text-[#6425c7] shadow-sm">
                <Sparkles className="size-3.5" /> The adaptive AI creative workspace
              </div>
              <h1 className="max-w-2xl text-5xl font-bold leading-[1.02] tracking-[-0.06em] sm:text-6xl lg:text-[5.25rem]">
                Turn a product link into a{" "}
                <span className="bg-gradient-to-r from-[#e83ead] to-[#6425c7] bg-clip-text text-transparent">world-class</span>{" "}
                storefront.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#766b80]">
                Mercury Pages turns raw product information into a polished page, a clear story, and a complete set of launch-ready creative — then lets you refine every detail in a visual editor before you publish.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#21182b] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#21182b]/10 transition hover:-translate-y-0.5 hover:bg-[#6425c7]">
                  Create your first page <ArrowRight className="size-4" />
                </Link>
                <Link href="#workflow" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#eae2f0] bg-white px-6 py-3.5 text-sm font-semibold text-[#21182b] transition hover:border-[#d6b9df]">
                  See how it works <ChevronRight className="size-4" />
                </Link>
              </div>
              <p className="mt-5 text-xs text-[#9b8da2]">Free to explore · No credit card required</p>
            </motion.div>

            {/* Hero preview card */}
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-[#e83ead]/15 to-[#6425c7]/15 blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white bg-white p-3 shadow-2xl shadow-[#6425c7]/15">
                <div className="flex items-center justify-between border-b border-[#f0e9f1] px-3 pb-3 text-xs text-[#9b8da2]">
                  <span className="font-semibold text-[#21182b]">Mercury studio</span>
                  <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#1f9d6f] animate-pulse" /> Live preview</span>
                </div>
                <div className="relative mt-3 overflow-hidden rounded-[1.2rem] bg-[#f9f2f8] p-6 sm:p-9">
                  <div className="absolute -right-10 -top-10 size-40 rounded-full bg-[#e8c6ee] blur-2xl" />
                  <div className="relative flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#766b80]">
                    <span>Maison No. 04</span>
                    <span>New collection</span>
                  </div>
                  <div className="relative mt-16 max-w-xs">
                    <p className="text-xs font-semibold text-[#e83ead]">THE DAILY RITUAL</p>
                    <h3 className="mt-2 text-4xl font-semibold leading-none tracking-[-0.06em] text-[#21182b]">Quietly made for every day.</h3>
                    <p className="mt-4 text-sm leading-6 text-[#766b80]">A considered edit of essentials designed to make the ordinary feel intentional.</p>
                    <button className="mt-6 rounded-full bg-[#21182b] px-4 py-2 text-xs font-semibold text-white">Explore the collection</button>
                  </div>
                  <div className="relative mt-12 grid grid-cols-3 gap-2">
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <img src="https://images.pexels.com/photos/18708750/pexels-photo-18708750.jpeg?auto=compress&cs=tinysrgb&h=200&w=200" alt="Skincare product" className="h-full w-full object-cover" />
                    </div>
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <img src="https://images.pexels.com/photos/16233812/pexels-photo-16233812.jpeg?auto=compress&cs=tinysrgb&h=200&w=200" alt="Cosmetic serum" className="h-full w-full object-cover" />
                    </div>
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <img src="https://images.pexels.com/photos/15005105/pexels-photo-15005105.jpeg?auto=compress&cs=tinysrgb&h=200&w=200" alt="Premium product" className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -bottom-7 -left-7 hidden w-48 rounded-2xl border border-[#eadcf0] bg-white p-4 shadow-xl sm:block"
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#f7e4f3] text-[#e83ead]"><Wand2 className="size-3.5" /></span>
                  AI direction found
                </div>
                <p className="mt-3 text-xs leading-5 text-[#766b80]">Editorial, tactile, quietly confident</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.65 }}
                className="absolute -right-5 top-1/3 hidden w-44 rounded-2xl border border-[#eadcf0] bg-white p-4 shadow-xl lg:block"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#21182b]">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#efe6fa] text-[#6425c7]"><Layers3 className="size-3.5" /></span>
                  7 sections
                </div>
                <p className="mt-2 text-xs leading-5 text-[#766b80]">Hero, benefits, gallery, specs, story, reviews, CTA</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-y border-[#eae2f0] bg-white px-6 py-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 text-sm text-[#766b80]">
            <span className="font-semibold text-[#21182b]">One workspace for the full launch</span>
            <span className="flex items-center gap-2"><ImageIcon className="size-4 text-[#e83ead]" /> Product pages</span>
            {/*<span className="flex items-center gap-2"><Layers3 className="size-4 text-[#6425c7]" /> Ad concepts</span>*/}
            <span className="flex items-center gap-2"><Sparkles className="size-4 text-[#e83ead]" /> Brand-aware AI</span>
            <span className="flex items-center gap-2"><ShoppingBag className="size-4 text-[#1f9d6f]" /> Shopify export</span>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 py-16 lg:px-10">
          <motion.div {...stagger} className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="rounded-2xl border border-[#eae2f0] bg-white p-6 text-center shadow-sm">
                <p className="text-3xl font-bold tracking-[-0.04em] text-[#21182b] sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-xs font-medium text-[#766b80]">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Features grid */}
        <section id="features" className="px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeInUp} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e83ead]">Everything in one place</p>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">A complete creative pipeline, not just a page builder.</h2>
              <p className="mt-5 text-lg leading-8 text-[#766b80]">From the first product URL — Mercury handles extraction, design, editing, and export so you can focus on the story.</p>
            </motion.div>
            <motion.div {...stagger} className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-2">
              {features.map((feature) => (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="rounded-3xl border border-[#eae2f0] bg-white p-7 shadow-sm transition hover:shadow-[0_18px_50px_rgba(77,33,91,0.06)]">
                  <div className={`flex size-12 items-center justify-center rounded-2xl ${feature.bg} ${feature.color}`}>
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-[#21182b]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#766b80]">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Workflow steps */}
        <section id="workflow" className="px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeInUp} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e83ead]">From source to story</p>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">A better starting point for every product.</h2>
              <p className="mt-5 text-lg leading-8 text-[#766b80]">Skip the blank canvas. Mercury gives you an intelligent first draft, then the control to make it unmistakably yours.</p>
            </motion.div>
            <motion.div {...stagger} className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <motion.div key={step.number} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="group relative rounded-3xl border border-[#eae2f0] bg-white p-7 shadow-sm transition hover:border-[#d6b9df] hover:shadow-[0_18px_50px_rgba(77,33,91,0.06)]">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold tracking-[-0.04em] text-[#eae2f0] transition group-hover:text-[#e83ead]">{step.number}</span>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#f9f2f8] text-[#6425c7]">
                      <step.icon className="size-5" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-[#21182b]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#766b80]">{step.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Design direction showcase with real images */}
        <section id="studio" className="bg-[#21182b] px-6 py-24 text-white lg:px-10">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeInUp} className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f3a9dc]">Adaptive by design</p>
                <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Different products deserve different points of view.</h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-[#d6c2de]">Mercury analyzes your product category, price point, and imagery to choose the right layout, typography, and color palette — so a serum never looks like a sneaker.</p>
              </div>
              <Link href="/signup" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#f3b7df] transition hover:text-white">Explore the workspace <ArrowRight className="size-4" /></Link>
            </motion.div>
            <motion.div {...stagger} className="mt-14 grid gap-5 md:grid-cols-3">
              {directions.map((direction, index) => (
                <motion.div key={direction.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${direction.color} p-5`}>
                  <div className="relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-2xl">
                    <img src={direction.image} alt={direction.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    <div className="relative flex justify-between text-xs font-semibold text-white">
                      <span>{direction.category}</span>
                      <span>0{index + 1}</span>
                    </div>
                    <div className="relative">
                      <h3 className="text-2xl font-semibold tracking-[-0.05em] text-white">{direction.name}</h3>
                      <p className="mt-2 text-sm text-white/80">{direction.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Showcase gallery */}
        <section id="showcase" className="px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeInUp} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e83ead]">Real products, real pages</p>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">See what Mercury generates.</h2>
              <p className="mt-5 text-lg leading-8 text-[#766b80]">Each category gets its own design language — from typography to spacing to color palette. Here is a look at what comes out of the box.</p>
            </motion.div>
            <motion.div {...stagger} className="mt-14 grid gap-5 sm:grid-cols-2">
              {showcaseImages.map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }} className="group relative overflow-hidden rounded-3xl border border-[#eae2f0] shadow-sm">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={item.url} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#21182b]/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">{item.label}</span>
                      <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-white">{item.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Editor preview section */}
        <section id="editor" className="bg-white px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e83ead]">The editor</p>
                <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Drag, edit, preview. Ship it.</h2>
                <p className="mt-5 text-lg leading-8 text-[#766b80]">A real visual editor with three panels: a section list you can drag to reorder, a live preview that updates instantly, and a property inspector for every detail.</p>
                <ul className="mt-8 space-y-4">
                  {[
                    { icon: Layers3, text: "Drag-and-drop section reordering with visual handles" },
                    { icon: Pencil, text: "Inline text editing and image replacement for every section" },
                    { icon: Palette, text: "Full control over colors, typography, spacing, and layout" },
                    { icon: Eye, text: "Desktop and mobile preview modes" },
                    { icon: Sparkles, text: "Add, duplicate, hide, and delete sections at any time" },
                  ].map((item, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#f7e4f3] text-[#e83ead]"><item.icon className="size-3.5" /></span>
                      <span className="text-sm leading-6 text-[#766b80]">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-[#21182b] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#21182b]/10 transition hover:-translate-y-0.5 hover:bg-[#6425c7]">
                  Try the editor <ArrowRight className="size-4" />
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#e83ead]/10 to-[#6425c7]/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl border border-[#eae2f0] bg-white shadow-2xl shadow-[#6425c7]/10">
                  {/* Editor mockup */}
                  <div className="flex items-center justify-between border-b border-[#eae2f0] bg-[#f9f2f8] px-4 py-3">
                    <span className="text-xs font-semibold text-[#21182b]">Mercury Editor</span>
                    <div className="flex items-center gap-1 rounded-lg border border-[#eae2f0] bg-white p-0.5">
                      <span className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-medium text-[#21182b] shadow-sm"><Monitor className="size-3" /> Desktop</span>
                      <span className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#aa97b0]"><Smartphone className="size-3" /> Mobile</span>
                    </div>
                  </div>
                  <div className="flex h-[340px]">
                    {/* Left panel */}
                    <div className="w-32 border-r border-[#eae2f0] bg-white p-2">
                      <div className="space-y-1.5">
                        {["Hero", "Benefits", "Gallery", "Specs", "Story", "CTA"].map((name, i) => (
                          <div key={name} className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium ${i === 1 ? "bg-[#f7e4f3] text-[#8e267e]" : "text-[#766b80]"}`}>
                            <span className="size-1 rounded-full bg-current opacity-40" />
                            {name}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Center preview */}
                    <div className="flex-1 overflow-hidden bg-[#f5f0f3] p-4">
                      <div className="rounded-lg bg-white p-4 shadow-sm">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-[#e83ead]">THE DAILY RITUAL</p>
                        <h4 className="mt-2 text-base font-bold text-[#21182b]">Quietly made for every day.</h4>
                        <p className="mt-2 text-[10px] leading-4 text-[#766b80]">A considered edit of essentials designed to make the ordinary feel intentional.</p>
                        <div className="mt-3 grid grid-cols-3 gap-1.5">
                          <div className="aspect-square rounded bg-gradient-to-br from-[#f4cce3] to-[#e8d9f7]" />
                          <div className="aspect-square rounded bg-gradient-to-br from-[#dfd7f0] to-[#f6efe9]" />
                          <div className="aspect-square rounded bg-gradient-to-br from-[#f0c5da] to-[#d5c8eb]" />
                        </div>
                      </div>
                    </div>
                    {/* Right panel */}
                    <div className="w-28 border-l border-[#eae2f0] bg-white p-2">
                      <p className="text-[9px] font-semibold text-[#21182b]">Benefits</p>
                      <div className="mt-2 space-y-2">
                        <div className="rounded border border-[#eae2f0] px-2 py-1.5">
                          <p className="text-[8px] text-[#766b80]">Title</p>
                          <div className="mt-1 h-3 rounded bg-[#f9f2f8]" />
                        </div>
                        <div className="rounded border border-[#eae2f0] px-2 py-1.5">
                          <p className="text-[8px] text-[#766b80]">Columns</p>
                          <div className="mt-1 h-3 rounded bg-[#f9f2f8]" />
                        </div>
                        <div className="rounded border border-[#eae2f0] px-2 py-1.5">
                          <p className="text-[8px] text-[#766b80]">Background</p>
                          <div className="mt-1 flex gap-1">
                            <div className="size-3 rounded bg-[#fcfafd] border border-[#eae2f0]" />
                            <div className="size-3 rounded bg-white border border-[#eae2f0]" />
                            <div className="size-3 rounded bg-[#21182b]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeInUp} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e83ead]">What people say</p>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Built for people who care about the details.</h2>
            </motion.div>
            <motion.div {...stagger} className="mt-14 grid gap-5 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="rounded-3xl border border-[#eae2f0] bg-white p-7 shadow-sm">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 text-[#e83ead]" fill="#e83ead" />)}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-[#21182b]">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-6 border-t border-[#eae2f0] pt-4">
                    <p className="text-sm font-semibold text-[#21182b]">{testimonial.author}</p>
                    <p className="text-xs text-[#766b80]">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 py-24 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <motion.div {...fadeInUp}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e83ead]">Good to know</p>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Questions, answered.</h2>
              <p className="mt-5 max-w-sm text-lg leading-8 text-[#766b80]">Everything you need to know before turning your next product into a point of view.</p>
              <Link href="/signup" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#6425c7] transition hover:text-[#e83ead]">
                Get started for free <ArrowRight className="size-4" />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="rounded-3xl border border-[#eae2f0] bg-white px-6">
              {faqs.map(([question, answer]) => <FaqItem key={question} question={question} answer={answer} />)}
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-24 lg:px-10">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mx-auto flex max-w-4xl flex-col items-center rounded-[2rem] bg-gradient-to-br from-[#f6e1f1] to-[#eee6fa] px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#6425c7] shadow-sm"><Sparkles className="size-5" /></span>
            <h2 className="mt-6 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Make the first impression count.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#766b80]">Build the page your product deserves, then keep shaping it until it feels like your brand.</p>
            <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e83ead] to-[#6425c7] px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-[#6425c7]/20 transition hover:-translate-y-0.5">
              Start creating for free <ArrowRight className="size-4" />
            </Link>
            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#766b80]">
              <span className="flex items-center gap-1"><Check className="size-3 text-[#6425c7]" /> Guided workflow</span>
              <span className="flex items-center gap-1"><Check className="size-3 text-[#6425c7]" /> Shopify-ready export</span>
              <span className="flex items-center gap-1"><Check className="size-3 text-[#6425c7]" /> Edit before you publish</span>
              <span className="flex items-center gap-1"><Check className="size-3 text-[#6425c7]" /> No credit card needed</span>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
