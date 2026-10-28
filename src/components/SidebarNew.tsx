"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  ChevronRight,
  FileText,
  LogOut,
  Menu,
  Rocket,
  Settings,
  ShoppingBag,
  Target,
  TrendingUp,
  X,
} from "lucide-react"

const mainItems = [
  { icon: BarChart3, label: "Dashboard", href: "/crm-dashboard" },
  { icon: FileText, label: "My Pages", href: "/my-pages" },
  { icon: Target, label: "Ad Generator", href: "/ad-generator" },
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

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-[#e7dfea] bg-[#fffdfb] px-5 py-6 shadow-[12px_0_40px_rgba(77,33,91,0.04)]">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#f1e5f4] text-[#8e267e]">
          <Rocket className="size-5" />
        </div>
        <div>
          <p className="font-serif text-xl font-semibold tracking-[-0.03em] text-[#2b1834]">Mercury</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a18aa9]">Pages studio</p>
        </div>
      </div>

      <div className="flex-1">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#aa97b0]">Workspace</p>
        <nav className="flex flex-col gap-1.5" aria-label="Workspace navigation">
          {mainItems.map((item) => {
            const active = pathname === item.href
            return (
              <Button
                key={item.href}
                variant="ghost"
                onClick={() => navigate(item.href)}
                className={`h-11 w-full justify-start rounded-xl px-3 text-sm transition-colors ${active ? "bg-[#f5eaf5] font-semibold text-[#8e267e] shadow-sm" : "text-[#725d78] hover:bg-[#faf5fa] hover:text-[#8e267e]"}`}
              >
                <item.icon className="mr-3 size-[18px]" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        <p className="mb-3 mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#aa97b0]">Account</p>
        <Button
          variant="ghost"
          onClick={() => navigate("/account")}
          className={`h-11 w-full justify-start rounded-xl px-3 text-sm ${pathname === "/account" ? "bg-[#f5eaf5] font-semibold text-[#8e267e]" : "text-[#725d78] hover:bg-[#faf5fa] hover:text-[#8e267e]"}`}
        >
          <Settings className="mr-3 size-[18px]" />
          Preferences
        </Button>
      </div>

      <div className="rounded-2xl border border-[#ead7ec] bg-gradient-to-br from-[#fbf1fb] to-[#f8f4ff] p-4">
        <p className="text-sm font-semibold text-[#3a2241]">Ready to scale?</p>
        <p className="mt-1 text-xs leading-5 text-[#8b718e]">Unlock unlimited generations and faster exports.</p>
        <Button onClick={() => navigate("/pricing")} className="mt-4 h-9 w-full rounded-lg bg-[#8e267e] text-xs text-white hover:bg-[#752068]">
          Upgrade plan <ChevronRight className="ml-1 size-3.5" />
        </Button>
      </div>

      <Button variant="ghost" onClick={() => auth.logout()} className="mt-3 h-10 justify-start rounded-xl px-3 text-sm text-[#8b718e] hover:bg-[#faf5fa] hover:text-[#8e267e]">
        <LogOut className="mr-3 size-[18px]" />
        Log out
      </Button>
    </aside>
  )

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="fixed left-4 top-4 z-40 rounded-xl border-[#ead7ec] bg-[#fffdfb] text-[#8e267e] lg:hidden" aria-label="Open navigation">
        <Menu className="size-5" />
      </Button>
      {isMobileMenuOpen && <button className="fixed inset-0 z-40 bg-[#2b1834]/20 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close navigation overlay" />}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:relative lg:z-auto lg:block ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="absolute right-3 top-3 z-10 text-[#8b718e] lg:hidden" aria-label="Close navigation"><X className="size-5" /></Button>
        {sidebar}
      </div>
    </>
  )
}
