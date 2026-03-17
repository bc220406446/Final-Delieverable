"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api";

interface Message { type: "error" | "success"; text: string }
type StrengthLevel = "none" | "weak" | "medium" | "strong";

function getPasswordStrength(password: string): { level: StrengthLevel; label: string } {
  if (!password) return { level: "none", label: "" };
  let score = 0;
  if (password.length >= 8)                              score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password))                               score++;
  if (/[^a-zA-Z0-9]/.test(password))                    score++;
  if (score <= 1) return { level: "weak",   label: "Weak password"   };
  if (score === 2) return { level: "medium", label: "Medium strength" };
  return              { level: "strong", label: "Strong password"  };
}

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
    <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
      message.type === "error"
        ? "bg-red-50 border-red-200 text-red-700"
        : "bg-green-50 border-green-200 text-green-700"
    }`} role="alert">
      {message.text}
    </div>
  );
}

// Handles the reset-password link from the email.
// URL format: /reset-password?code=<strapi_reset_code>
export default function ResetPasswordPage(): JSX.Element {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [code,            setCode]            = useState<string>("");
  const [password,        setPassword]        = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message,         setMessage]         = useState<Message | null>(null);
  const [loading,         setLoading]         = useState<boolean>(false);
  const [done,            setDone]            = useState<boolean>(false);

  // Read the reset code from the URL on mount — avoids hydration mismatch.
  useEffect(() => {
    const c = searchParams.get("code") ?? "";
    if (!c) {
      setMessage({ type: "error", text: "Invalid or missing reset link. Please request a new one." });
    }
    setCode(c);
  }, [searchParams]);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const barWidth   = strength.level === "none" ? "w-0" : strength.level === "weak" ? "w-1/3" : strength.level === "medium" ? "w-2/3" : "w-full";
  const barColor   = strength.level === "weak"   ? "bg-red-500"   : strength.level === "medium" ? "bg-amber-500"  : strength.level === "strong" ? "bg-green-600" : "bg-gray-200";
  const labelColor = strength.level === "weak"   ? "text-red-500" : strength.level === "medium" ? "text-amber-600": strength.level === "strong" ? "text-green-700": "text-gray-400";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setMessage(null);

    if (!code) {
      setMessage({ type: "error", text: "Invalid reset link. Please request a new one." });
      return;
    }
    if (!password || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in both password fields." });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(code, password, confirmPassword);
      setDone(true);
      setMessage({ type: "success", text: "Password reset successfully! Redirecting to login…" });
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Reset failed. The link may have expired. Please request a new one.",
      });
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-16 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-6 md:p-8">

        {/* Success state */}
        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-green-900">Password Reset!</h1>
            <p className="text-sm text-gray-500 mt-2">Redirecting you to login…</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-green-900">Reset Password</h1>
              <p className="text-sm text-gray-500 mt-1">Enter your new password below.</p>
            </div>

            <MessageBanner message={message} />

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">

              {/* New password */}
              <div>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className={inputCls()}
                  disabled={!code || loading}
                />
                {password && (
                  <div className="mt-2">
                    <p className={`text-xs font-semibold ${labelColor}`}>{strength.label}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                      <div className={`h-full ${barColor} ${barWidth} transition-all`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <FieldLabel htmlFor="confirm">Confirm New Password</FieldLabel>
                <input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className={inputCls()}
                  disabled={!code || loading}
                />
                {/* Live match indicator */}
                {confirmPassword && (
                  <p className={`mt-1.5 text-xs font-semibold ${password === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                    {password === confirmPassword ? "Passwords match ✓" : "Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !code}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>

              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <Link href="/login"          className="text-green-700 hover:underline">Back to Login</Link>
                <Link href="/forgot-password" className="text-green-700 hover:underline">Request New Link</Link>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
