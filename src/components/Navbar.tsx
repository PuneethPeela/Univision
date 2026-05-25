"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/compare', label: 'Compare' },
  { href: '/predict', label: 'Predict' },
  { href: '/discussions', label: 'Discuss' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-xl bg-surface-900/70 border-b border-white/5 transition-all duration-300">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-geist font-bold text-cyan neon-text tracking-wide">
          UNIVISION
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === link.href ? 'text-cyan' : 'text-muted hover:text-onSurface'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* AI Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan/10 border border-cyan/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span className="text-[10px] text-cyan font-semibold uppercase tracking-wider">AI Active</span>
          </div>

          {status === 'authenticated' ? (
            <div className="flex items-center gap-3">
              <Link href="/saved" className="text-sm text-muted hover:text-cyan transition-colors">
                Saved
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-sm text-muted hover:text-cyan transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-cyan/20 flex items-center justify-center text-cyan text-xs font-bold border border-cyan/30">
                  {session.user?.name?.[0] || '?'}
                </div>
                <span className="hidden lg:inline">{session.user?.name || 'User'}</span>
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-4 py-1.5 bg-cyan text-surface-900 text-sm font-semibold rounded-lg hover:shadow-[0_0_12px_rgba(0,244,254,0.3)] transition-all"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-onSurface focus:outline-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-surface-800/95 backdrop-blur-xl">
          <ul className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
                    pathname === link.href
                      ? 'text-cyan bg-cyan/10'
                      : 'text-muted hover:text-onSurface hover:bg-white/5'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-white/5 pt-2 mt-2">
              {status === 'authenticated' ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/saved"
                    className="block py-2 px-3 rounded-lg text-sm text-muted hover:text-onSurface"
                    onClick={() => setMobileOpen(false)}
                  >
                    Saved Colleges
                  </Link>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="text-left py-2 px-3 rounded-lg text-sm text-muted hover:text-red-400 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="block py-2 px-3 bg-cyan text-surface-900 text-sm font-semibold rounded-lg text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
