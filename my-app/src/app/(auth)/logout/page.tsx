"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, JSX } from "react";
import { useAuth } from "@/context/AuthContext";

// Renders the logout confirmation page and performs client-side sign-out cleanup.
export default function LogoutPage(): JSX.Element {
  const { logout } = useAuth();

  // Calls context logout (clears localStorage + resets global auth state)
  // and prevents back-navigation to authenticated screens.
  useEffect(() => {
    logout();

    try {
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = () => window.history.pushState(null, "", window.location.href);
    } catch { /* ignore */ }

    return () => {
      try { window.onpopstate = null; } catch { /* ignore */ }
    };
  }, [logout]);

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-16 bg-gray-50">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-6 md:p-8 text-center">

        {/* Success icon section indicating logout completion. */}
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Image
            src="/icons/actionComplete.svg"
            width={40}
            height={40}
            alt="Signed out"
            priority
          />
        </div>

        {/* Confirmation text related to the completed sign-out action. */}
        <h1 className="text-2xl font-extrabold text-green-900">Signed Out</h1>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          You have successfully signed out of your account.
          <br />
          We hope to see you again soon!
        </p>

        {/* Follow-up auth actions for returning users or new registration. */}
        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition text-center"
          >
            Log In Again
          </Link>

          <div className="flex items-center text-sm text-gray-400">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4">OR</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <Link
            href="/register"
            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:border-green-600 hover:text-green-700 hover:bg-gray-50 transition text-center"
          >
            Create New Account
          </Link>
        </div>
      </section>
    </main>
  );
}
