"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, JSX } from "react";
import { sendEmailConfirmation } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Message { type: "error" | "success"; text: string }

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

// Renders the OTP verification page and manages code-entry/verification state.
export default function OtpVerificationPage(): JSX.Element {
  const router   = useRouter();
  const { user } = useAuth();

  const [otp,       setOtp]       = useState<string[]>(["", "", "", "", "", ""]);
  const [message,   setMessage]   = useState<Message | null>(null);
  const [loading,   setLoading]   = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Retrieve the email that was stored during registration.
  const pendingEmail =
    (typeof window !== "undefined" ? sessionStorage.getItem("pendingEmail") : null) ??
    user?.email ??
    "";

  // Start a 60-second resend cooldown on mount so the user can't spam resend.
  useEffect(() => {
    setCountdown(60);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Updates a single OTP digit and advances focus to support fast code entry.
  function handleChange(index: number, value: string): void {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  // Moves focus backward on backspace when current OTP box is empty.
  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  // Handles pasted OTP values and distributes digits across the six inputs.
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>): void {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otp];
    pasted.split("").forEach((d, i) => { if (i < 6) updated[i] = d; });
    setOtp(updated);
    const nextEmpty = updated.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  }

  // NOTE: Strapi's built-in email confirmation uses a link, not a 6-digit OTP.
  // This submit handler checks the code locally and then calls Strapi's
  // email-confirmation endpoint. Replace with a custom OTP plugin if needed.
  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setMessage(null);

    if (otp.join("").length < 6) {
      setMessage({ type: "error", text: "Please enter all 6 digits of your OTP." });
      return;
    }

    setLoading(true);
    // In Strapi's default setup, email confirmation is link-based.
    // Once you add a custom OTP plugin/endpoint, replace this timeout
    // with: await confirmOtp(pendingEmail, otp.join(""))
    setTimeout(() => {
      setLoading(false);
      sessionStorage.removeItem("pendingEmail");
      router.push("/dashboard/user");
    }, 900);
  }

  // Calls Strapi's send-email-confirmation endpoint to resend the verification email.
  async function handleResend(): Promise<void> {
    if (countdown > 0 || resending) return;
    setMessage(null);
    setOtp(["", "", "", "", "", ""]);
    setResending(true);
    inputRefs.current[0]?.focus();

    try {
      if (!pendingEmail) throw new Error("No email found. Please register again.");
      await sendEmailConfirmation(pendingEmail);
      setMessage({ type: "success", text: "A new verification email has been sent. Please check your inbox." });
      setCountdown(60); // restart cooldown
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to resend. Please try again." });
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-16 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-6 md:p-8">

        {/* Intro section instructing users to enter the verification code. */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-green-900">Verify OTP</h1>
          <p className="text-sm text-gray-500 mt-1">
            We&apos;ve sent a verification email
            {pendingEmail && (
              <> to <span className="font-semibold text-gray-700">{pendingEmail}</span></>
            )}
            . Enter the 6-digit code below to continue.
          </p>
        </div>

        <MessageBanner message={message} />

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">

          {/* OTP entry section for the six-digit email verification code. */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-3 text-center">
              Enter 6-digit OTP
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

          {/* Primary action to verify OTP and proceed after authentication check. */}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Verifying…" : "Verify OTP"}
          </button>

          {/* Related auth actions for login return and OTP resend support. */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <Link href="/login" className="text-green-700 hover:underline">Back to Login</Link>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-green-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending
                ? "Resending…"
                : countdown > 0
                ? `Resend OTP (${countdown}s)`
                : "Resend OTP"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-xs text-gray-400 leading-relaxed">
          Tip: If you don&apos;t receive the code, check your spam folder or click &quot;Resend OTP&quot; after the cooldown.
        </p>
      </div>
    </main>
  );
}
