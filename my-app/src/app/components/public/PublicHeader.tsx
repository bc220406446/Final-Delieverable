// Renders the public site header with navigation and auth entry points.
"use client";

import { useState, useEffect, JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/",         label: "Home"     },
  { href: "/about",    label: "About"    },
  { href: "/faqs",     label: "FAQs"     },
  { href: "/policies", label: "Policies" },
];

// Dashboard icon button — goes to user dashboard if logged in, else login page.
function DashboardButton(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  function handleClick() {
    if (isLoading) return;
    router.push(isAuthenticated ? "/dashboard/user" : "/login"); // admin uses Strapi admin panel directly
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center border border-green-600 text-green-700 hover:bg-green-50 rounded-xl px-2.5 py-2 transition"
      aria-label="Dashboard"
      title={isAuthenticated ? "Go to Dashboard" : "Login to access Dashboard"}
    >
      <Image src="/icons/dashboard.svg" width={20} height={20} alt="Dashboard" />
    </button>
  );
}

// Logout button — clears auth state then redirects to /logout confirmation page.
function LogoutButton({ className, children }: { className: string; children: React.ReactNode }): JSX.Element {
  const { logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();              // clears localStorage + cookie (awaitable now)
    router.push("/logout");      // show confirmation page
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}

// Slide-in mobile navigation menu.
function MobileMenu(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent): void { if (e.key === "Escape") setOpen(false); }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="md:hidden inline-flex flex-col items-center justify-center gap-1.25 w-10 h-10 rounded-xl border-2 border-green-600 hover:bg-green-50 transition"
      >
        <span className="block w-5 h-0.5 bg-green-600 rounded-full" />
        <span className="block w-5 h-0.5 bg-green-600 rounded-full" />
        <span className="block w-5 h-0.5 bg-green-600 rounded-full" />
      </button>

      {/* Backdrop */}
      <div aria-hidden="true" onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-in drawer */}
      <div role="dialog" aria-modal="true" aria-label="Navigation menu"
        className={`md:hidden fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Image src="/icons/logo.svg" width={24} height={24} alt="CSE Logo" />
            <span className="text-sm font-extrabold text-green-700">Community Skills Exchange</span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close menu"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav body */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2 px-1">Navigation</p>
          <ul className="flex flex-col gap-0.5 mb-6">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition">
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Dashboard link */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2 px-1">Dashboard</p>
            <Link
              href={isAuthenticated ? "/dashboard/user" : "/login"}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
            >
              {isAuthenticated ? "My Dashboard" : "Login to Dashboard"}
            </Link>
          </div>
        </nav>

        {/* Auth buttons */}
        <div className="px-4 py-5 border-t border-gray-100 flex flex-col gap-2.5">
          {!isLoading && (
            isAuthenticated ? (
              <LogoutButton className="w-full text-center bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-sm py-2.5 rounded-xl transition">
                Logout
              </LogoutButton>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="w-full text-center border border-gray-200 hover:border-green-600 hover:text-green-700 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition">
                  Login
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition">
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </>
  );
}

// Main public header.
export default function Header(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-5 py-3.5">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 text-base font-extrabold text-green-700">
          <Image src="/icons/logo.svg" width={30} height={30} alt="Community Skills Exchange Logo" priority />
          <span>Community Skills Exchange</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-600">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="hover:text-green-700 transition">{label}</Link>
            </li>
          ))}
        </ul>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2">
          <DashboardButton />
          {/* Wait for localStorage hydration before showing auth buttons */}
          {!isLoading && (
            isAuthenticated ? (
              <LogoutButton className="inline-flex items-center justify-center border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-sm px-4 py-2.5 rounded-xl transition">
                Logout
              </LogoutButton>
            ) : (
              <>
                <Link href="/login"
                  className="inline-flex items-center justify-center border border-gray-200 hover:border-green-600 hover:text-green-700 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition">
                  Login
                </Link>
                <Link href="/register"
                  className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition">
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile hamburger */}
        <MobileMenu />
      </nav>
    </header>
  );
}
