import Link from "next/link";
import Image from "next/image";
import { JSX } from "react";

// Renders the auth layout header with branding and quick navigation back to home.
export default function AuthHeader(): JSX.Element {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-5 py-3.5">

        {/* Branding section linking to the public home page. */}
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-extrabold text-green-700"
        >
          <Image
            src="/icons/logo.svg"
            width={30}
            height={30}
            alt="Community Skills Exchange Logo"
            priority
          />
          {/* Brand name text supporting logo identity in auth screens. */}
          <span className="text-base font-extrabold text-green-700">Community Skills Exchange</span>
        </Link>

        {/* Navigation action returning users from auth pages to home. */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 transition"
        >
          {/* Compact icon used for smaller breakpoints in the return action. */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 lg:hidden"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {/* Text label paired with icon on supported screen sizes. */}
          <span className="hidden sm:inline">Return to Home</span>
        </Link>

      </nav>
    </header>
  );
}