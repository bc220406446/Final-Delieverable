"use client";

import Link from "next/link";
import { useState, JSX } from "react";

// Defines the feedback message shape used by both submit logic and the alert banner.
interface Message { type: "error" | "success"; text: string }

// Returns the shared Tailwind classes for auth form inputs in this page.
function inputCls(): string {
  return [
    "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900",
    "placeholder-gray-400 outline-none transition bg-white",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
  ].join(" ");
}

// Shows submission feedback for the forgot-password request flow.
function MessageBanner({ message }: { message: Message | null }): JSX.Element | null {
  if (!message) return null;
  return (
    <div
      className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
        message.type === "error"
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-green-50 border-green-200 text-green-700"
      }`}
      role="alert"
    >
      {message.text}
    </div>
  );
}

// Renders the forgot-password page and handles reset-link request state.
export default function ForgotPasswordPage(): JSX.Element {
  const [email,   setEmail]   = useState<string>("");
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Handles form submission, validates email, and simulates reset-link request feedback.
  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address." });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage({
        type: "success",
        text: "If an account exists for this email, a reset link has been sent. Please check your inbox (and spam).",
      });
    }, 900);
  }

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-16 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-6 md:p-8">

        {/* Intro section explaining email-based password recovery flow. */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-green-900">Forgot Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email and we&apos;ll send you a password reset link.
          </p>
        </div>

        <MessageBanner message={message} />

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">

          {/* Email input section for the account recovery address. */}
          <div>
            <label htmlFor="email" className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
              Email Address
            </label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com" className={inputCls()} />
          </div>

          {/* Submit action for sending the reset-link request. */}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Sending…" : "Send Reset Link"}
          </button>

          {/* Navigation links related to auth flow recovery alternatives. */}
          <div className="flex items-center justify-between text-xs font-semibold pt-1">
            <Link href="/login"    className="text-green-700 hover:underline">Back to Login</Link>
            <Link href="/register" className="text-green-700 hover:underline">Create an Account</Link>
          </div>
        </form>

        <p className="mt-5 text-xs text-gray-400 leading-relaxed">
          Tip: If you don&apos;t receive an email, check your spam folder or try again with the correct email.
        </p>
      </div>
    </main>
  );
}