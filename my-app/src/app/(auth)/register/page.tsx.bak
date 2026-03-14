"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, JSX } from "react";

// Defines shared feedback and password-strength types for registration logic.
interface Message { type: "error" | "success"; text: string }
type StrengthLevel = "none" | "weak" | "medium" | "strong";

// Evaluates password quality used by the strength meter in the registration form.
function getPasswordStrength(password: string): { score: number; level: StrengthLevel; label: string } {
  if (!password) return { score: 0, level: "none", label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 1) return { score: 1, level: "weak",   label: "Weak password"     };
  if (score === 2) return { score: 2, level: "medium", label: "Medium strength"   };
  return              { score: 3, level: "strong", label: "Strong password"   };
}

// Returns shared Tailwind classes for register form inputs with optional error border.
function inputCls(hasError = false): string {
  return [
    "w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900",
    "placeholder-gray-400 outline-none transition bg-white",
    "focus:ring-2 focus:ring-green-500 focus:border-green-500",
    hasError ? "border-red-400" : "border-gray-200",
  ].join(" ");
}

// Renders consistent labels for registration input fields.
function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }): JSX.Element {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
      {children}
    </label>
  );
}

// Displays success or validation feedback tied to registration actions.
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

// Separates account-creation action from alternate auth navigation.
function OrDivider(): JSX.Element {
  return (
    <div className="flex items-center text-sm text-gray-400">
      <div className="flex-1 border-t border-gray-200" />
      <span className="px-4">OR</span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  );
}

// Renders the register page and manages account-creation state and validation.
export default function RegisterPage(): JSX.Element {
  const router = useRouter();

  const [fullName,        setFullName]        = useState<string>("");
  const [email,           setEmail]           = useState<string>("");
  const [location,        setLocation]        = useState<string>("");
  const [password,        setPassword]        = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [agree,           setAgree]           = useState<boolean>(false);
  const [message,         setMessage]         = useState<Message | null>(null);
  const [loading,         setLoading]         = useState<boolean>(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  // Small helpers to standardize feedback messages across validation branches.
  function showError(text: string):   void { setMessage({ type: "error",   text }); }
  function showSuccess(text: string): void { setMessage({ type: "success", text }); }

  // Validates registration fields, sets feedback, and routes to OTP verification on success.
  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setMessage(null);

    if (!agree) { showError("Please accept the Terms & Conditions."); return; }
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !location.trim()) {
      showError("Please fill in all fields."); return;
    }
    if (password.length < 8) { showError("Password must be at least 8 characters long."); return; }
    if (password !== confirmPassword) { showError("Passwords do not match."); return; }

    setLoading(true);
    showSuccess("Account created successfully! Redirecting to OTP verification…");
    setTimeout(() => router.push("/otp-verification"), 1200);
  }

  const barWidth  = strength.level === "none" ? "w-0" : strength.level === "weak" ? "w-1/3" : strength.level === "medium" ? "w-2/3" : "w-full";
  const barColor  = strength.level === "weak" ? "bg-red-500" : strength.level === "medium" ? "bg-amber-500" : strength.level === "strong" ? "bg-green-600" : "bg-gray-200";
  const labelColor = strength.level === "weak" ? "text-red-500" : strength.level === "medium" ? "text-amber-600" : strength.level === "strong" ? "text-green-700" : "text-gray-400";

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-16 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full p-6 md:p-8">

        {/* Intro section describing account creation and onboarding entry. */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-green-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join our community today</p>
        </div>

        <MessageBanner message={message} />

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">

          {/* Full name section for user identity details during sign-up. */}
          <div>
            <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe" className={inputCls()} />
          </div>

          {/* Email section used for account credentials and future verification. */}
          <div>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com" className={inputCls()} />
          </div>

          {/* Password section with live strength feedback for secure account setup. */}
          <div>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password" className={inputCls()} />
            {/* Strength indicator related to password quality requirements. */}
            {password && (
              <div className="mt-2">
                <p className={`text-xs font-semibold ${labelColor}`}>{strength.label}</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                  <div className={`h-full ${barColor} ${barWidth} transition-all`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirmation section to ensure password entry consistency. */}
          <div>
            <FieldLabel htmlFor="confirm">Confirm Password</FieldLabel>
            <input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password" className={inputCls()} />
          </div>

          {/* Location section for storing user profile region information. */}
          <div>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country" className={inputCls()} />
          </div>

          {/* Consent section for policies required before account creation. */}
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

          {/* Primary action to create the account and continue onboarding. */}
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