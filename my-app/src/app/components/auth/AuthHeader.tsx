import Link from "next/link";
import { JSX } from "react";

export default function AuthHeader(): JSX.Element {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-5 py-3.5">

        <Link
          href="/"
          className="flex items-center gap-2 text-base font-extrabold text-green-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgb(22 161 74)" strokeWidth="2" width={30} height={30} aria-hidden="true">
            <circle cx="12" cy="8" r="3"/>
            <circle cx="6" cy="15" r="3"/>
            <circle cx="18" cy="15" r="3"/>
            <path d="M12 11v4M9 13l-3 2M15 13l3 2"/>
          </svg>
          <span className="text-base font-extrabold text-green-700">Community Skills Exchange</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 transition"
        >
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
          <span className="hidden sm:inline">Return to Home</span>
        </Link>

      </nav>
    </header>
  );
}
