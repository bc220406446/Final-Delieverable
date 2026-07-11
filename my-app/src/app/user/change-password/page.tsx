"use client";

import { useState, useMemo, JSX } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPasswordStrength } from "@/lib/passwordStrength";
import PasswordInput from "@/app/components/shared/PasswordInput";
import FormLabel from "@/app/components/shared/FormLabel";
import MessageBanner, { FormMessage } from "@/app/components/shared/MessageBanner";
import PasswordStrength from "@/app/components/shared/PasswordStrength";
import PasswordMatch from "@/app/components/shared/PasswordMatch";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

// Shared input class builder for consistent account form styling.
function inputCls(): string {
  return "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500";
}

export default function ChangePasswordPage(): JSX.Element {
  const { token } = useAuth();

  // Form state for the current password, new password, confirmation, and feedback message.
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message,         setMessage]         = useState<FormMessage | null>(null);
  const [loading,         setLoading]         = useState(false);

  // Recalculate password strength only when the new password changes.
  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  // Validates password rules, then submits the change-password request to Strapi.
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
      // Send the validated password change request with the user's auth token.
      const res = await fetch(`${STRAPI_URL}/api/auth/change-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ currentPassword, password: newPassword, passwordConfirmation: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to change password.");

      setMessage({ type: "success", text: "Password changed successfully!" });
      // Clear password fields after a successful update.
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

          {/* Change-password form requires current password plus matching new-password fields. */}
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">

            <div>
              <FormLabel htmlFor="current">Current Password</FormLabel>
              <PasswordInput
                id="current"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className={inputCls()}
                revealLabel="current password"
              />
            </div>

            <div>
              <FormLabel htmlFor="new">New Password</FormLabel>
              <PasswordInput
                id="new"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong new password"
                className={inputCls()}
                revealLabel="new password"
              />
              <PasswordStrength password={newPassword} />
            </div>

            <div>
              <FormLabel htmlFor="confirm">Confirm New Password</FormLabel>
              <PasswordInput
                id="confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className={inputCls()}
                revealLabel="confirm password"
              />
              <PasswordMatch password={newPassword} confirm={confirmPassword} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-1">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
