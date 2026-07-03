"use client";

import { useState, useMemo, JSX } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPasswordStrength } from "@/lib/passwordStrength";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

interface Message { type: "error" | "success"; text: string }

function inputCls(): string {
  return "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500";
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
    <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
      message.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
    }`} role="alert">{message.text}</div>
  );
}

function StrengthBar({ password }: { password: string }): JSX.Element | null {
  const s = getPasswordStrength(password);
  if (!password) return null;
  const widthMap = { none: "w-0", weak: "w-1/4", medium: "w-2/4", strong: "w-3/4", "very-strong": "w-full" };
  const colorMap = { none: "", weak: "bg-red-500", medium: "bg-amber-500", strong: "bg-green-500", "very-strong": "bg-green-600" };
  const labelMap = { none: "", weak: "text-red-500", medium: "text-amber-600", strong: "text-green-600", "very-strong": "text-green-700" };
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
            <li key={e} className="text-xs text-red-500 flex items-center gap-1">{e}</li>
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

export default function ChangePasswordPage(): JSX.Element {
  const { token } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message,         setMessage]         = useState<Message | null>(null);
  const [loading,         setLoading]         = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword)
                                              { setMessage({ type: "error", text: "Please fill in all fields." }); return; }
    if (!strength.valid)                      { setMessage({ type: "error", text: "New password does not meet requirements." }); return; }
    if (newPassword !== confirmPassword)      { setMessage({ type: "error", text: "New passwords do not match." }); return; }
    if (currentPassword === newPassword)      { setMessage({ type: "error", text: "New password must be different from your current password." }); return; }

    setLoading(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/auth/change-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ currentPassword, password: newPassword, passwordConfirmation: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to change password.");

      setMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-green-900">Change Password</h1>
          <p className="text-sm text-gray-500 mt-1">Update your account password below.</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
          <MessageBanner message={message} />

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">

            <div>
              <FieldLabel htmlFor="current">Current Password</FieldLabel>
              <div className="relative">
                <input id="current" type={showCurrentPassword ? "text" : "password"} value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password" className={`${inputCls()} pr-10`} />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="new">New Password</FieldLabel>
              <div className="relative">
                <input id="new" type={showNewPassword ? "text" : "password"} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a strong new password" className={`${inputCls()} pr-10`} />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <StrengthBar password={newPassword} />
            </div>

            <div>
              <FieldLabel htmlFor="confirm">Confirm New Password</FieldLabel>
              <div className="relative">
                <input id="confirm" type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password" className={`${inputCls()} pr-10`} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <PasswordMatch password={newPassword} confirm={confirmPassword} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-1">
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
