"use client";

import Link from "next/link";
import { useState, useMemo, JSX } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";
import { getPasswordStrength } from "@/lib/passwordStrength";
import PasswordInput from "@/app/components/shared/PasswordInput";
import FormLabel from "@/app/components/shared/FormLabel";
import MessageBanner, { FormMessage } from "@/app/components/shared/MessageBanner";
import PasswordStrength from "@/app/components/shared/PasswordStrength";
import PasswordMatch from "@/app/components/shared/PasswordMatch";

function inputCls(hasError = false): string {
  return [
    "w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900",
    "placeholder-gray-400 outline-none transition bg-white",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
    hasError ? "border-red-400" : "border-gray-200",
  ].join(" ");
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

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const [fullName,          setFullName]          = useState("");
  const [email,             setEmail]             = useState("");
  const [location,          setLocation]          = useState("");
  const [password,          setPassword]          = useState("");
  const [confirmPassword,   setConfirmPassword]   = useState("");
  const [agree,             setAgree]             = useState(false);
  const [message,           setMessage]           = useState<FormMessage | null>(null);
  const [loading,           setLoading]           = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setMessage(null);

    if (!agree) {
      setMessage({ type: "error", text: "Please accept the Terms & Conditions." });
      return;
    }
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword || !location.trim()) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }
    if (!strength.valid) {
      setMessage({ type: "error", text: "Password does not meet requirements." });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await registerUser({ username: email, email, password, fullName, location });
      sessionStorage.setItem("pendingEmail", email);
      setMessage({ type: "success", text: "Account created! Redirecting to OTP verification..." });
      setTimeout(() => router.push("/otp-verification"), 900);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Registration failed. Please try again.",
      });
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-16 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full p-6 md:p-8">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-green-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join our community today</p>
        </div>

        <MessageBanner message={message} />

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">

          <div>
            <FormLabel htmlFor="fullName">Full Name</FormLabel>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className={inputCls()}
            />
          </div>

          <div>
            <FormLabel htmlFor="email">Email Address</FormLabel>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className={inputCls()}
            />
          </div>

          <div>
            <FormLabel htmlFor="location">Location</FormLabel>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className={inputCls()}
            />
          </div>

          <div>
            <FormLabel htmlFor="password">Password</FormLabel>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className={inputCls()}
            />
            <PasswordStrength password={password} />
          </div>

          <div>
            <FormLabel htmlFor="confirm">Confirm Password</FormLabel>
            <PasswordInput
              id="confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={inputCls()}
              revealLabel="confirm password"
            />
            <PasswordMatch password={password} confirm={confirmPassword} />
          </div>

          <label className="flex items-start gap-3 text-xs text-gray-600 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-green-600"
            />
            <span>
              I agree to the{" "}
              <Link href="/policies" className="text-green-700 font-semibold hover:underline">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/policies" className="text-green-700 font-semibold hover:underline">
                Privacy Policy
              </Link>.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <OrDivider />

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-green-700 font-semibold hover:underline">
              Login here
            </Link>
          </p>

        </form>
      </div>
    </main>
  );
}
