"use client";

import Link from "next/link";
import { Suspense, useState, useMemo, JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api";
import { getPasswordStrength } from "@/lib/passwordStrength";
import PasswordInput from "@/app/components/shared/PasswordInput";
import FormLabel from "@/app/components/shared/FormLabel";
import MessageBanner, { FormMessage } from "@/app/components/shared/MessageBanner";
import PasswordStrength from "@/app/components/shared/PasswordStrength";
import PasswordMatch from "@/app/components/shared/PasswordMatch";

function inputCls(): string {
  return "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500";
}

const invalidResetMessage: FormMessage = {
  type: "error",
  text: "Invalid or missing reset link. Please request a new one.",
};

function ResetPasswordContent(): JSX.Element {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message,         setMessage]         = useState<FormMessage | null>(null);
  const [loading,         setLoading]         = useState(false);
  const [done,            setDone]            = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const visibleMessage = message ?? (!code ? invalidResetMessage : null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setMessage(null);
    if (!code)                    { setMessage({ type: "error", text: "Invalid reset link." }); return; }
    if (!password || !confirmPassword) { setMessage({ type: "error", text: "Please fill in both fields." }); return; }
    if (!strength.valid)          { setMessage({ type: "error", text: "Password does not meet requirements." }); return; }
    if (password !== confirmPassword) { setMessage({ type: "error", text: "Passwords do not match." }); return; }

    setLoading(true);
    try {
      await resetPassword(code, password, confirmPassword);
      setDone(true);
      setMessage({ type: "success", text: "Password reset successfully! Redirecting to login..." });
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Reset failed. The link may have expired." });
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-16 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-6 md:p-8">
        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-green-900">Password Reset!</h1>
            <p className="text-sm text-gray-500 mt-2">Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-green-900">Reset Password</h1>
              <p className="text-sm text-gray-500 mt-1">Enter your new password below.</p>
            </div>

            <MessageBanner message={visibleMessage} />

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              <div>
                <FormLabel htmlFor="password">New Password</FormLabel>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className={inputCls()}
                  disabled={!code || loading}
                />
                <PasswordStrength password={password} />
              </div>

              <div>
                <FormLabel htmlFor="confirm">Confirm New Password</FormLabel>
                <PasswordInput
                  id="confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className={inputCls()}
                  disabled={!code || loading}
                  revealLabel="confirm password"
                />
                <PasswordMatch password={password} confirm={confirmPassword} />
              </div>

              <button type="submit" disabled={loading || !code}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <Link href="/login"           className="text-green-700 hover:underline">Back to Login</Link>
                <Link href="/forgot-password" className="text-green-700 hover:underline">Request New Link</Link>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage(): JSX.Element {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
