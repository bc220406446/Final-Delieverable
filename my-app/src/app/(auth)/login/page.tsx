"use client";
import { JSX, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser, getMe } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Message { type: "error" | "success"; text: string }

function inputCls(): string {
  return [
    "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900",
    "placeholder-gray-400 outline-none transition bg-white",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
  ].join(" ");
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }): JSX.Element {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
      {children}
    </label>
  );
}

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

function OrDivider(): JSX.Element {
  return (
    <div className="flex items-center text-sm text-gray-400">
      <div className="flex-1 border-t border-gray-200" />
      <span className="px-4">OR</span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  );
}

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const { setAuthData, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [email,      setEmail]      = useState<string>("");
  const [password,   setPassword]   = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [message,    setMessage]    = useState<Message | null>(null);
  const [loading,    setLoading]    = useState<boolean>(false);

  // Calls Strapi /auth/local, saves JWT + user, then routes based on role.
  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { jwt, user } = await loginUser({ identifier: email, password });

      // Fetch full user with profileImage + bio + location populated.
      // The raw login response doesn't include relations.
      const fullUser = await getMe(jwt);
      setAuthData(jwt, fullUser ?? user);

      setMessage({ type: "success", text: "Login successful! Redirecting…" });

      // Route admin users to admin dashboard, regular users to user dashboard.
      const destination =
        (fullUser ?? user).role?.type === "admin" || (fullUser ?? user).role?.name?.toLowerCase() === "admin"
          ? "/dashboard/admin"
          : "/dashboard/user";

      setTimeout(() => router.push(destination), 1000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Login failed. Please try again." });
      setLoading(false);
    }

    void rememberMe; // rememberMe can extend token TTL in a future iteration
  }

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-16 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-6 md:p-8">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-green-900">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Login to access your account</p>
        </div>

        <MessageBanner message={message} />

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">

          <div>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com" className={inputCls()} />
          </div>

          <div>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" className={inputCls()} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-gray-600 select-none cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-green-600" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-xs font-semibold text-green-700 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Logging in…" : "Login"}
          </button>

          <OrDivider />

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-green-700 font-semibold hover:underline">Register now</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
