"use client";

import Link from "next/link";
import { useState, useMemo, JSX } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";
import { getPasswordStrength } from "@/lib/passwordStrength";

interface Message { type: "error" | "success"; text: string }

function inputCls(hasError = false): string {
  return [
    "w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900",
    "placeholder-gray-400 outline-none transition bg-white",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
    hasError ? "border-red-400" : "border-gray-200",
  ].join(" ");
}

function EyeIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
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

function StrengthBar({ password }: { password: string }): JSX.Element | null {
  const s = getPasswordStrength(password);
  if (!password) return null;

  const widthMap  = { none: "w-0", weak: "w-1/4", medium: "w-2/4", strong: "w-3/4", "very-strong": "w-full" };
  const colorMap  = { none: "", weak: "bg-red-500", medium: "bg-amber-500", strong: "bg-green-500", "very-strong": "bg-green-600" };
  const labelMap  = { none: "", weak: "text-red-500", medium: "text-amber-600", strong: "text-green-600", "very-strong": "text-green-700" };

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${labelMap[s.level]}`}>{s.label}</span>
        <span className="text-xs text-gray-400">{s.score}/7</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colorMap[s.level]} ${widthMap[s.level]}`} />
      </div>
      {s.errors.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {s.errors.map((e) => (
            <li key={e} className="text-xs text-red-500 flex items-center gap-1">
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PasswordMatch({ password, confirm }: { password: string; confirm: string }): JSX.Element | null {
  if (!confirm) return null;
  const match = password === confirm;
  return (
    <p className={`mt-1.5 text-xs font-semibold ${match ? "text-green-600" : "text-red-500"}`}>
      {match ? "Passwords match" : "Passwords do not match"}
    </p>
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

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const [fullName,          setFullName]          = useState("");
  const [email,             setEmail]             = useState("");
  const [location,          setLocation]          = useState("");
  const [password,          setPassword]          = useState("");
  const [confirmPassword,   setConfirmPassword]   = useState("");
  const [agree,             setAgree]             = useState(false);
  const [message,           setMessage]           = useState<Message | null>(null);
  const [loading,           setLoading]           = useState(false);
  const [showPassword,      setShowPassword]      = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      setMessage({ type: "success", text: "Account created! Redirecting to OTP verification…" });
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

          {/* Full Name */}
          <div>
            <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className={inputCls()}
            />
          </div>

          {/* Email */}
          <div>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className={inputCls()}
            />
          </div>

          {/* Location */}
          <div>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className={inputCls()}
            />
          </div>

          {/* Password */}
          <div>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className={`${inputCls()} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <StrengthBar password={password} />
          </div>

          {/* Confirm Password */}
          <div>
            <FieldLabel htmlFor="confirm">Confirm Password</FieldLabel>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className={`${inputCls()} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <PasswordMatch password={password} confirm={confirmPassword} />
          </div>

          {/* Terms checkbox */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating…" : "Create Account"}
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