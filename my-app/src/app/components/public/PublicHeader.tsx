// Renders the public site header with navigation and auth entry points.
"use client";

import { useState, useRef, useEffect, JSX } from "react";
import Image from "next/image";
import Link from "next/link";

// Modal used to choose dashboard destination by user role.

function DashboardSelector(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center border border-green-600 text-green-700 hover:bg-green-50 rounded-xl px-2.5 py-2 transition"
        aria-label="Dashboard"
        title="Dashboard"
      >
        <Image src="/icons/dashboard.svg" width={20} height={20} alt="Dashboard" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6">
              <h3 className="text-base font-extrabold text-gray-900 mb-1">Go to Dashboard</h3>
              <p className="text-sm text-gray-500 mb-5">
                Select which dashboard you want to access.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard/user"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
                >
                User Dashboard
                </Link>
                <Link
                  href="/dashboard/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border border-green-600 text-green-700 hover:bg-green-50 font-semibold text-sm px-4 py-2.5 rounded-xl transition"
                >
                Admin Dashboard
                </Link>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Slide-in mobile navigation menu.

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faqs", label: "FAQs" },
  { href: "/policies", label: "Policies" },
];

function MobileMenu(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      {/* Hamburger button - visible on mobile only */}
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
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-in drawer from right */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`md:hidden fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Image src="/icons/logo.svg" width={24} height={24} alt="CSE Logo" />
            <span className="text-sm font-extrabold text-green-700">
              Community Skills Exchange
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable nav body */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          {/* Main links */}
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2 px-1">
            Navigation
          </p>
          <ul className="flex flex-col gap-0.5 mb-6">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Dashboards section */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2 px-1">
              Dashboards
            </p>
            <ul className="flex flex-col gap-0.5">
              <li>
                <Link
                  href="/dashboard/user"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                >
                User Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                >
                Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Auth buttons pinned to bottom */}
        <div className="px-4 py-5 border-t border-gray-100 flex flex-col gap-2.5">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="w-full text-center border border-gray-200 hover:border-green-600 hover:text-green-700 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </>
  );
}

// Main public header component.

export default function Header(): JSX.Element {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-5 py-3.5">

        {/* Brand logo and home link */}
        <Link href="/" className="flex items-center gap-2 text-base font-extrabold text-green-700">
          <Image
            src="/icons/logo.svg"
            width={30}
            height={30}
            alt="Community Skills Exchange Logo"
            priority
          />
          <span>Community Skills Exchange</span>
        </Link>

        {/* Desktop nav links - hidden on mobile */}
        <ul className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-600">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="hover:text-green-700 transition">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right actions - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <DashboardSelector />
          <Link
            href="/login"
            className="inline-flex items-center justify-center border border-gray-200 hover:border-green-600 hover:text-green-700 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile hamburger - hidden on desktop */}
        <MobileMenu />
      </nav>
    </header>
  );
}
