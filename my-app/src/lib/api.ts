// Core API client for communicating with Strapi backend.
// All auth and data requests go through this file.

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

// Shape of a Strapi API error response.
interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
  };
}

// Generic fetch wrapper that attaches auth token and handles Strapi error format.
async function strapiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    const err = data as StrapiError;
    throw new Error(err?.error?.message ?? "Something went wrong. Please try again.");
  }

  return data as T;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role: {
    id: number;
    name: string;
    type: string;
  };
  // Custom fields added to the User content-type in Strapi
  fullName?: string;
  location?: string;
}

export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}

export interface RegisterPayload {
  username: string;   // We use email as username for simplicity
  email: string;
  password: string;
  fullName: string;
  location: string;
}

export interface LoginPayload {
  identifier: string; // email or username
  password: string;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

// Registers a new user via Strapi's built-in /auth/local/register endpoint.
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return strapiRequest<AuthResponse>("/api/auth/local/register", {
    method: "POST",
    body: JSON.stringify({
      username: payload.email, // use email as username
      email: payload.email,
      password: payload.password,
      // Strapi passes extra fields to the user model if they exist
      fullName: payload.fullName,
      location: payload.location,
    }),
  });
}

// Logs in an existing user via Strapi's /auth/local endpoint.
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return strapiRequest<AuthResponse>("/api/auth/local", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Sends a forgot-password email via Strapi's built-in email reset.
export async function forgotPassword(email: string): Promise<{ ok: boolean }> {
  return strapiRequest<{ ok: boolean }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Resets password using the code from the reset email.
export async function resetPassword(
  code: string,
  password: string,
  passwordConfirmation: string
): Promise<AuthResponse> {
  return strapiRequest<AuthResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ code, password, passwordConfirmation }),
  });
}

// Sends the email confirmation OTP/link (Strapi built-in).
export async function sendEmailConfirmation(email: string): Promise<{ sent: boolean }> {
  return strapiRequest<{ sent: boolean }>("/api/auth/send-email-confirmation", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Confirms the user's email using the token from the confirmation email.
export async function confirmEmail(confirmationToken: string): Promise<AuthResponse> {
  const res = await fetch(
    `${STRAPI_URL}/api/auth/email-confirmation?confirmation=${confirmationToken}`
  );
  if (!res.ok) {
    const data = (await res.json()) as StrapiError;
    throw new Error(data?.error?.message ?? "Email confirmation failed.");
  }
  return res.json() as Promise<AuthResponse>;
}

// Fetches the currently authenticated user's profile.
export async function getMe(token: string): Promise<StrapiUser> {
  return strapiRequest<StrapiUser>("/api/users/me?populate=role", {}, token);
}
