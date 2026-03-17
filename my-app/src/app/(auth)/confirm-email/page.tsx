"use client";

import { useEffect, useState, JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// Handles the "Verify My Email" button click from the confirmation email.
// URL format: /confirm-email?email=<encoded_email>&code=<6digit_otp>
// Calls our /api/otp/verify directly — no Strapi token redirect needed.
export default function ConfirmEmailPage(): JSX.Element {
  const router          = useRouter();
  const searchParams    = useSearchParams();
  const { setAuthData } = useAuth();

  const [status,   setStatus]   = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const email = searchParams.get("email");
    const code  = searchParams.get("code");

    if (!email || !code) {
      setStatus("error");
      setErrorMsg("Invalid confirmation link. Please enter your code manually.");
      return;
    }

    verifyOtp(decodeURIComponent(email), code)
      .then(({ jwt, user }) => {
        setAuthData(jwt, user);
        sessionStorage.removeItem("pendingEmail");
        setStatus("success");
        // Redirect to dashboard after a short success flash.
        setTimeout(() => router.push("/dashboard/user"), 1500);
      })
      .catch((err: Error) => {
        setStatus("error");
        setErrorMsg(err.message ?? "Verification failed. The link may have expired.");
      });
  }, [searchParams, setAuthData, router]);

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-5 py-16 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-8 text-center">

        {status === "loading" && (
          <>
            <div className="w-14 h-14 mx-auto mb-5 rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />
            <h1 className="text-xl font-extrabold text-green-900">Verifying your email…</h1>
            <p className="text-sm text-gray-500 mt-2">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-green-900">Email Verified!</h1>
            <p className="text-sm text-gray-500 mt-2">Redirecting you to your dashboard…</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-red-700">Verification Failed</h1>
            <p className="text-sm text-gray-500 mt-2 mb-6">{errorMsg}</p>
            <a href="/otp-verification"
              className="inline-block px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">
              Enter Code Manually
            </a>
          </>
        )}

      </div>
    </main>
  );
}
