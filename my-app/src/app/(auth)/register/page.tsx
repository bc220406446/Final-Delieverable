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
      message.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
    }`} role="alert">{message.text}</div>
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
  const [fullName,        setFullName]        = useState("");
  const [email,           setEmail]           = useState("");
  const [location,        setLocation]        = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree,           setAgree]           = useState(false);
  const [message,         setMessage]         = useState<Message | null>(null);
  const [loading,         setLoading]         = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setMessage(null);

    if (!agree)                              { setMessage({ type: "error", text: "Please accept the Terms & Conditions." }); return; }
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword || !location.trim())
                                             { setMessage({ type: "error", text: "Please fill in all fields." }); return; }
    if (!strength.valid)                     { setMessage({ type: "error", text: "Password does not meet requirements." }); return; }
    if (password !== confirmPassword)        { setMessage({ type: "error", text: "Passwords do not match." }); return; }

    setLoading(true);
    try {
      // Register but do NOT log in yet - user must verify OTP first.
      // We only store the email so the OTP page can reference it.
      await registerUser({ username: email, email, password, fullName, location });
      sessionStorage.setItem("pendingEmail", email);
      setMessage({ type: "success", text: "Account created! Redirecting to OTP verification…" });
      setTimeout(() => router.push("/otp-verification"), 1200);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Registration failed. Please try again." });
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
            <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe" className={inputCls()} />
          </div>

          <div>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com" className={inputCls()} />
          </div>

          <div>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country" className={inputCls()} />
          </div>

          <div>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password" className={inputCls()} />
            <StrengthBar password={password} />
          </div>

          <div>
            <FieldLabel htmlFor="confirm">Confirm Password</FieldLabel>
            <input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password" className={inputCls()} />
            <PasswordMatch password={password} confirm={confirmPassword} />
          </div>

          <label className="flex items-start gap-3 text-xs text-gray-600 select-none cursor-pointer">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-green-600" />
            <span>
              I agree to the{" "}
              <Link href="/policies" className="text-green-700 font-semibold hover:underline">Terms &amp; Conditions</Link>{" "}
              and{" "}
              <Link href="/policies" className="text-green-700 font-semibold hover:underline">Privacy Policy</Link>.
            </span>
          </label>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Creating…" : "Create Account"}
          </button>

          <OrDivider />

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-green-700 font-semibold hover:underline">Login here</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
