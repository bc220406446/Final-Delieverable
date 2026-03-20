"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, JSX } from "react";
import { verifyOtp, resendOtp, getMe } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Message { type: "error" | "success"; text: string }

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

export default function OtpVerificationPage(): JSX.Element {
  const router          = useRouter();
  const { setAuthData } = useAuth();

  const [otp,          setOtp]          = useState<string[]>(["", "", "", "", "", ""]);
  const [message,      setMessage]      = useState<Message | null>(null);
  const [loading,      setLoading]      = useState<boolean>(false);
  const [resending,    setResending]    = useState<boolean>(false);
  const [countdown,    setCountdown]    = useState<number>(60);
  // ── FIX: pendingEmail is state, populated in useEffect after mount ──────────
  // Reading sessionStorage directly at render time causes a server/client
  // mismatch (hydration error) because the server always gets "" while the
  // client gets the stored email. Moving it into useEffect fixes this.
  const [pendingEmail, setPendingEmail] = useState<string>("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Runs only on the client after mount — safe to read sessionStorage here.
  useEffect(() => {
    const stored = sessionStorage.getItem("pendingEmail") ?? "";
    setPendingEmail(stored);
  }, []);

  // Countdown timer for resend cooldown.
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleChange(index: number, value: string): void {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>): void {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otp];
    pasted.split("").forEach((d, i) => { if (i < 6) updated[i] = d; });
    setOtp(updated);
    const next = updated.findIndex((d) => !d);
    inputRefs.current[next === -1 ? 5 : next]?.focus();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setMessage(null);

    const code = otp.join("");
    if (code.length < 6) {
      setMessage({ type: "error", text: "Please enter all 6 digits." });
      return;
    }
    if (!pendingEmail) {
      setMessage({ type: "error", text: "Session expired. Please register again." });
      return;
    }

    setLoading(true);
    try {
      const { jwt, user } = await verifyOtp(pendingEmail, code);
      // Fetch full user with profileImage populated before saving to context
      const fullUser = await getMe(jwt);
      setAuthData(jwt, fullUser ?? user);
      sessionStorage.removeItem("pendingEmail");
      setMessage({ type: "success", text: "Email verified! Redirecting to dashboard…" });
      setTimeout(() => router.push("/dashboard/user"), 1000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Invalid code. Please try again." });
      setLoading(false);
    }
  }

  async function handleResend(): Promise<void> {
    if (countdown > 0 || resending || !pendingEmail) return;
    setResending(true);
    setMessage(null);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    try {
      await resendOtp(pendingEmail);
      setMessage({ type: "success", text: "A new 6-digit code has been sent to your email." });
      setCountdown(60);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to resend. Please try again." });
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-16 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-6 md:p-8">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-green-900">Verify Your Email</h1>
          <p className="text-sm text-gray-500 mt-1">
            We sent a 6-digit code to{" "}
            {pendingEmail
              ? <strong className="text-gray-700">{pendingEmail}</strong>
              : "your email address"
            }.{" "}
            Enter it below or click the link in the email.
          </p>
        </div>

        <MessageBanner message={message} />

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-3 text-center">
              Enter 6-digit code
            </label>
            <div className="flex justify-center gap-2.5">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-11 h-12 text-center text-base font-extrabold rounded-xl border border-gray-200 outline-none transition text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Verifying…" : "Verify Code"}
          </button>

          <div className="flex items-center justify-between text-xs font-semibold">
            <Link href="/login" className="text-green-700 hover:underline">Back to Login</Link>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-green-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? "Sending…" : countdown > 0 ? `Resend (${countdown}s)` : "Resend Code"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-xs text-gray-400 leading-relaxed">
          You can also click the <strong>Verify My Email</strong> button in the email to verify instantly without entering a code.
        </p>
      </div>
    </main>
  );
}
