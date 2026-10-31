"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ChartBar as BarChart3, ChevronRight, FileText, LayoutTemplate, LogOut, Menu, Rocket, Settings, ShoppingBag, Target, X, Wand as Wand2 } from "lucide-react"

const mainItems = [
  { icon: BarChart3, label: "Dashboard", href: "/crm-dashboard" },
  { icon: FileText, label: "My Pages", href: "/my-pages" },
  { icon: LayoutTemplate, label: "Page Editor", href: "/page-editor" },
  // { icon: Target, label: "Ad Creative Studio", href: "/ad-generator" },
  { icon: ShoppingBag, label: "Shopify Integration", href: "/integrations-shopify" },
]

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const navigate = (href: string) => {
    setIsMobileMenuOpen(false)
    router.push(href)
  }

  useEffect(() => {
    if (pathname === "/page-editor") {
      setIsMobileMenuOpen(false)
    }
  }, [pathname])

  const isPageEditor = pathname === "/page-editor";

  if (isPageEditor) {
    return null; // Do not render the sidebar for the page-editor route
  }

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-[#eae2f0] bg-white px-5 py-6">
      <div className="mb-9 flex items-center gap-3 px-2">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e83ead] to-[#6425c7] text-white shadow-lg shadow-[#e83ead]/20">
          <Rocket className="size-5" />
        </div>
        <div>
          <p className="font-serif text-xl font-semibold tracking-[-0.03em] text-[#21182b]">Mercury</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#aa97b0]">Pages studio</p>
        </div>
      </div>

      <div className="flex-1">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#aa97b0]">Workspace</p>
        <nav className="flex flex-col gap-1" aria-label="Workspace navigation">
          {mainItems.map((item) => {
            const active = pathname === item.href
            const isStudio = item.href === "/ad-generator"
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`group flex h-11 w-full items-center justify-start gap-3 rounded-xl px-3 text-sm transition-all duration-200 ${active ? "bg-gradient-to-r from-[#f7e4f3] to-[#efe6fa] font-semibold text-[#8e267e] shadow-sm" : "text-[#725d78] hover:bg-[#f9f2f8] hover:text-[#21182b]"}`}
              >
                <item.icon className={`size-[18px] transition-colors ${active ? "text-[#e83ead]" : isStudio ? "text-[#6425c7]" : "text-[#aa97b0] group-hover:text-[#8e267e]"}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#aa97b0]">Account</p>
        <button
          onClick={() => navigate("/account")}
          className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm transition-all duration-200 ${pathname === "/account" ? "bg-gradient-to-r from-[#f7e4f3] to-[#efe6fa] font-semibold text-[#8e267e] shadow-sm" : "text-[#725d78] hover:bg-[#f9f2f8] hover:text-[#21182b]"}`}
        >
          <Settings className="size-[18px] text-[#aa97b0]" />
          Preferences
        </button>
      </div>

      {/* Usage indicator */}
      <div className="mb-3 rounded-2xl border border-[#eae2f0] bg-[#f9f2f8] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#21182b]">Monthly generations</p>
          {/*<span className="text-[10px] font-semibold text-[#8e267e]">Free plan</span>*/}
        </div>
        {/*<div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#ead7ec]">*/}
        {/*  <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-[#e83ead] to-[#6425c7]" />*/}
        {/*</div>*/}
        <p className="mt-2 text-[11px] text-[#766b80]">4 of 5 used this month</p>
      </div>

      {/* Upgrade card */}
      <div className="rounded-2xl border border-[#ead7ec] bg-gradient-to-br from-[#21182b] to-[#3a1f47] p-4 text-white">
        <div className="flex items-center gap-2">
          <Wand2 className="size-4 text-[#f3a9dc]" />
          <p className="text-sm font-semibold">Ready to scale?</p>
        </div>
        <p className="mt-1.5 text-xs leading-5 text-[#d6c2de]">Unlock unlimited generations and faster exports.</p>
        <button onClick={() => navigate("/pricing")} className="mt-4 flex h-9 w-full items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#e83ead] to-[#6425c7] text-xs font-semibold text-white transition hover:opacity-90">
          Upgrade plan <ChevronRight className="size-3.5" />
        </button>
      </div>

      <button onClick={() => auth.logout()} className="mt-3 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-[#8b718e] transition hover:bg-[#f9f2f8] hover:text-[#8e267e]">
        <LogOut className="size-[18px]" />
        Log out
      </button>
    </aside>
  )

  return (
    <>
      <button onClick={() => setIsMobileMenuOpen(true)} className="fixed left-4 top-4 z-40 flex size-10 items-center justify-center rounded-xl border border-[#eae2f0] bg-white text-[#8e267e] shadow-sm lg:hidden" aria-label="Open navigation">
        <Menu className="size-5" />
      </button>
      {isMobileMenuOpen && <button className="fixed inset-0 z-40 bg-[#21182b]/20 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close navigation overlay" />}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:relative lg:z-auto lg:block ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <button onClick={() => setIsMobileMenuOpen(false)} className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-lg text-[#8b718e] hover:bg-[#f9f2f8] lg:hidden" aria-label="Close navigation">
          <X className="size-5" />
        </button>
        {sidebar}
      </div>
    </>
  )
}