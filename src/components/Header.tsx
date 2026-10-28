'use client';

import Link from 'next/link';
import { Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Header = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const close = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#eae2f0]/80 bg-[#fcfafd]/85 px-6 backdrop-blur-xl lg:px-10">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-[#21182b]" onClick={close}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e83ead] to-[#6425c7] text-white shadow-lg shadow-[#6425c7]/20"><Sparkles className="size-4" /></span>
          <span className="text-lg font-bold tracking-[-0.03em]">Mercury Pages</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#766b80] md:flex">
          <Link href="/#workflow" className="transition hover:text-[#6425c7]">How it works</Link>
          <Link href="/#studio" className="transition hover:text-[#6425c7]">Creative studio</Link>
          <Link href="/pricing" className="transition hover:text-[#6425c7]">Pricing</Link>
          {!isLoading && (isAuthenticated ? <Link href="/crm-dashboard" className="rounded-full bg-[#21182b] px-5 py-2.5 text-white transition hover:bg-[#6425c7]">Open workspace</Link> : <><Link href="/signin" className="transition hover:text-[#6425c7]">Sign in</Link><Link href="/signup" className="rounded-full bg-[#21182b] px-5 py-2.5 text-white transition hover:bg-[#6425c7]">Start creating <span aria-hidden="true">→</span></Link></>)}
        </nav>
        <button aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} className="rounded-lg p-2 text-[#21182b] md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button>
      </div>
      {isMenuOpen && <nav className="flex flex-col gap-5 border-t border-[#eae2f0] py-6 text-sm font-medium text-[#766b80] md:hidden"><Link href="/#workflow" onClick={close}>How it works</Link><Link href="/#studio" onClick={close}>Creative studio</Link><Link href="/pricing" onClick={close}>Pricing</Link>{!isLoading && (isAuthenticated ? <Link href="/crm-dashboard" onClick={close} className="rounded-full bg-[#21182b] px-5 py-3 text-center text-white">Open workspace</Link> : <><Link href="/signin" onClick={close}>Sign in</Link><Link href="/signup" onClick={close} className="rounded-full bg-[#21182b] px-5 py-3 text-center text-white">Start creating</Link></>)}</nav>}
    </header>
  );
};
