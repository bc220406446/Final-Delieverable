// Renders the admin dashboard header with responsive navigation actions.
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Dashboard",             href: "/dashboard/admin/" },
  { label: "Manage Users",          href: "/dashboard/admin/manage-users" },
  { label: "Manage Skills",         href: "/dashboard/admin/manage-skills" },
  { label: "Manage Categories",     href: "/dashboard/admin/manage-categories" },
  { label: "View Abuse Reports",    href: "/dashboard/admin/view-abuse-reports" },
  { label: "Manage Static Content", href: "/dashboard/admin/manage-static-content" },
];

type AdminHeaderProps = {
  adminName?: string;
};

export default function AdminHeader({ adminName = "Administrator" }: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto flex justify-between items-center px-5 py-4">

          {/* Branding section linking admins back to the public home page. */}
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-green-900">
            <Image
              src="/icons/logo.svg"
              width={32}
              height={32}
              className="w-8 h-8"
              alt="Community Skills Exchange Logo"
              priority
            />
            <span className="text-base font-extrabold text-green-700">Community Skills Exchange</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Welcome text - md+ only */}
            <span className="hidden md:inline text-sm text-gray-600">
              Welcome, <span className="font-semibold text-gray-900">{adminName}</span>
            </span>

            {/* Return to Home - sm+ only */}
            <Link
              href="/"
              className="hidden sm:inline-flex border border-green-600 text-green-700 px-4 py-2 rounded-md hover:bg-green-50 transition text-sm font-semibold"
            >
              Return to Home
            </Link>

            {/* Logout action shown on larger breakpoints for quick session exit. */}
            <Link
              href="/logout"
              className="hidden sm:inline-flex bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-sm font-semibold"
            >
              Logout
            </Link>

            {/* Hamburger - visible on mobile/tablet, hidden on lg (sidebar takes over) */}
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6"  x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer panel - slides in from the right */}
          <div
            ref={menuRef}
            className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col lg:hidden"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-extrabold text-gray-900">{adminName}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6"  x2="6"  y2="18" />
                  <line x1="6"  y1="6"  x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map(({ label, href }) => {
                  const active =
                    pathname === href ||
                    (href !== "/dashboard/admin/" && pathname.startsWith(href));
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition ${
                          active
                            ? "bg-green-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom actions */}
            <div className="px-3 py-4 border-t border-gray-100 flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center border border-green-600 text-green-700 px-4 py-2.5 rounded-xl hover:bg-green-50 transition text-sm font-semibold"
              >
                Return to Home
              </Link>
              <Link
                href="/logout"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition text-sm font-semibold"
              >
                Logout
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}