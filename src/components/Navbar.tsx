"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'HOME' },
  { href: '/predict', label: 'MATCH' },
  { href: '/explore', label: 'EXPLORE' },
  { href: '/compare', label: 'COMPARE' },
  { href: '/dashboard', label: 'TRACK' },
  { href: '/essay-predictor', label: 'ESSAY AI' },
  { href: '/discussions', label: 'DISCUSS' },
];


export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-xl bg-surface-900/70 border-b border-white/5 transition-all duration-300">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-geist font-bold text-cyan neon-text tracking-wide">
          UNIVISION
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href} className="relative py-1">
              <Link
                href={link.href}
                className={`text-[11px] font-bold tracking-widest transition-colors duration-200 ${
                  isActive(link.href) ? 'text-cyan font-extrabold' : 'text-muted hover:text-onSurface'
                }`}
              >
                {link.label}
              </Link>
              {isActive(link.href) && (
                <span className="absolute -bottom-[15px] inset-x-0 h-[2px] bg-cyan shadow-[0_0_8px_rgba(0,244,254,0.8)]" />
              )}
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
            <div className="relative flex items-center gap-3">
              <Link href="/saved" className="text-sm text-muted hover:text-cyan transition-colors font-medium">
                Saved
              </Link>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm text-muted hover:text-cyan transition-colors focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-cyan/20 flex items-center justify-center text-cyan text-xs font-bold border border-cyan/30">
                    {session.user?.name?.[0] || '?'}
                  </div>
                  <span className="hidden lg:inline font-medium">{session.user?.name || 'User'}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-[999]" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-3 w-56 bg-[#111318] rounded-xl shadow-2xl z-[1000] border border-white/10 animate-fadeUp overflow-hidden py-1">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-white/5 bg-white/2.5">

                        <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-onSurface truncate mt-0.5">{session.user?.name || 'Academic Scholar'}</p>
                        <p className="text-[10px] text-muted truncate mt-0.5">{session.user?.email}</p>
                      </div>


                      {/* Items */}
                      <Link
                        href="/dashboard?tab=overview"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted hover:text-cyan hover:bg-white/5 transition-colors font-semibold"
                        onClick={() => setDropdownOpen(false)}
                      >
                        📊 Cockpit Dashboard
                      </Link>
                      <Link
                        href="/dashboard?tab=tracker"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted hover:text-cyan hover:bg-white/5 transition-colors font-semibold"
                        onClick={() => setDropdownOpen(false)}
                      >
                        📋 Application Status
                      </Link>
                      <Link
                        href="/dashboard?tab=profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted hover:text-cyan hover:bg-white/5 transition-colors font-semibold"
                        onClick={() => setDropdownOpen(false)}
                      >
                        👤 Academic Profile
                      </Link>
                      <Link
                        href="/dashboard?tab=settings"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted hover:text-cyan hover:bg-white/5 transition-colors font-semibold"
                        onClick={() => setDropdownOpen(false)}
                      >
                        ⚙️ System Settings
                      </Link>
                      <Link
                        href="/discussions"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted hover:text-cyan hover:bg-white/5 transition-colors font-semibold"
                        onClick={() => setDropdownOpen(false)}
                      >
                        💬 Community Discussions
                      </Link>

                      <div className="border-t border-white/5 mt-1" />
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors font-bold"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
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
                    isActive(link.href)
                      ? 'text-cyan bg-cyan/10 font-bold'
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
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted uppercase tracking-wider px-3 mb-1 font-bold">Cockpit Menu</span>
                  <Link
                    href="/dashboard?tab=overview"
                    className="block py-2 px-3 rounded-lg text-sm text-muted hover:text-onSurface hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    📊 Cockpit Dashboard
                  </Link>
                  <Link
                    href="/dashboard?tab=tracker"
                    className="block py-2 px-3 rounded-lg text-sm text-muted hover:text-onSurface hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    📋 Application Status
                  </Link>
                  <Link
                    href="/dashboard?tab=profile"
                    className="block py-2 px-3 rounded-lg text-sm text-muted hover:text-onSurface hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    👤 Academic Profile
                  </Link>
                  <Link
                    href="/dashboard?tab=settings"
                    className="block py-2 px-3 rounded-lg text-sm text-muted hover:text-onSurface hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    ⚙️ System Settings
                  </Link>
                  <Link
                    href="/saved"
                    className="block py-2 px-3 rounded-lg text-sm text-muted hover:text-onSurface hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    📌 Curated Shortlist
                  </Link>
                  <div className="border-t border-white/5 my-1" />
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setMobileOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    🚪 Sign Out
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
