"use client";

import { useState, useMemo, JSX } from "react";
import { useAuth } from "@/context/AuthContext";

interface Message { type: "error" | "success"; text: string }
type StrengthLevel = "none" | "weak" | "medium" | "strong";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

function getPasswordStrength(p: string): { level: StrengthLevel; label: string } {
  if (!p) return { level: "none", label: "" };
  let s = 0;
  if (p.length >= 8)                        s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p))  s++;
  if (/\d/.test(p))                         s++;
  if (/[^a-zA-Z0-9]/.test(p))              s++;
  if (s <= 1) return { level: "weak",   label: "Weak password"   };
  if (s === 2) return { level: "medium", label: "Medium strength" };
  return              { level: "strong", label: "Strong password"  };
}

function inputCls(): string {
  return "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500";
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

export default function ChangePasswordPage(): JSX.Element {
  const { token } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message,         setMessage]         = useState<Message | null>(null);
  const [loading,         setLoading]         = useState(false);

  const strength   = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const barWidth   = strength.level === "none" ? "w-0" : strength.level === "weak" ? "w-1/3" : strength.level === "medium" ? "w-2/3" : "w-full";
  const barColor   = strength.level === "weak" ? "bg-red-500" : strength.level === "medium" ? "bg-amber-500" : strength.level === "strong" ? "bg-green-600" : "bg-gray-200";
  const labelColor = strength.level === "weak" ? "text-red-500" : strength.level === "medium" ? "text-amber-600" : strength.level === "strong" ? "text-green-700" : "text-gray-400";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (currentPassword === newPassword) {
      setMessage({ type: "error", text: "New password must be different from your current password." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          password:             newPassword,
          passwordConfirmation: confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to change password.");

      setMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    // Full height centered layout matching other dashboard pages
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
              <input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className={inputCls()}
              />
            </div>

            <div>
              <FieldLabel htmlFor="new">New Password</FieldLabel>
              <input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong new password"
                className={inputCls()}
              />
              {newPassword && (
                <div className="mt-2">
                  <p className={`text-xs font-semibold ${labelColor}`}>{strength.label}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                    <div className={`h-full ${barColor} ${barWidth} transition-all`} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <FieldLabel htmlFor="confirm">Confirm New Password</FieldLabel>
              <input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className={inputCls()}
              />
              {confirmPassword && (
                <p className={`mt-1.5 text-xs font-semibold ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                  {newPassword === confirmPassword ? "Passwords match ✓" : "Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
