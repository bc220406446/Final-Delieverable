// Core API client for communicating with Strapi backend.

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

interface StrapiError {
  error: { status: number; name: string; message: string };
}

async function strapiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res  = await fetch(`${STRAPI_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const err = data as StrapiError;
    throw new Error(err?.error?.message ?? "Something went wrong. Please try again.");
  }
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role: { id: number; name: string; type: string };
  fullName?: string;
  location?: string;
}

export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  location: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

// Registers a new user. The Strapi extension automatically sends the OTP email.
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return strapiRequest<AuthResponse>("/api/auth/local/register", {
    method: "POST",
    body: JSON.stringify({
      username: payload.email,
      email:    payload.email,
      password: payload.password,
      fullName: payload.fullName,
      location: payload.location,
    }),
  });
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return strapiRequest<AuthResponse>("/api/auth/local", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(email: string): Promise<{ ok: boolean }> {
  return strapiRequest<{ ok: boolean }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  code: string, password: string, passwordConfirmation: string
): Promise<AuthResponse> {
  return strapiRequest<AuthResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ code, password, passwordConfirmation }),
  });
}

export async function getMe(token: string): Promise<StrapiUser> {
  return strapiRequest<StrapiUser>("/api/users/me?populate=role", {}, token);
}

export async function updateUser(
  id: number,
  data: Partial<Pick<StrapiUser, "fullName" | "location" | "username">>,
  token: string
): Promise<StrapiUser> {
  return strapiRequest<StrapiUser>(
    `/api/users/${id}`,
    { method: "PUT", body: JSON.stringify(data) },
    token
  );
}

// ─── Custom OTP API ───────────────────────────────────────────────────────────

// Resends the OTP email to the given address (called from OTP page resend button).
export async function resendOtp(email: string): Promise<{ ok: boolean }> {
  return strapiRequest<{ ok: boolean }>("/api/otp/send", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Verifies the 6-digit code and returns a JWT + confirmed user on success.
export async function verifyOtp(email: string, code: string): Promise<AuthResponse> {
  return strapiRequest<AuthResponse>("/api/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

// Confirms email via the token from the link in the email (used by /confirm-email page).
export async function confirmEmailToken(token: string): Promise<{ jwt: string; user: StrapiUser }> {
  const res = await fetch(
    `${STRAPI_URL}/api/auth/email-confirmation?confirmation=${token}`
  );
  if (!res.ok) {
    const data = (await res.json()) as StrapiError;
    throw new Error(data?.error?.message ?? "Email confirmation failed.");
  }
  return res.json();
}