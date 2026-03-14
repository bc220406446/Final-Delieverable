// Client-side auth helpers for storing and reading JWT + user data.
// Mirrors the keys the logout page already clears: "userToken" & "userData".

import type { StrapiUser } from "./api";

const TOKEN_KEY = "userToken";
const USER_KEY  = "userData";

// Saves the JWT token to localStorage after login or register.
export function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch { /* private/SSR mode */ }
}

// Reads the stored JWT token, returns null if absent.
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

// Saves user data object to localStorage.
export function saveUser(user: StrapiUser): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch { /* ignore */ }
}

// Reads stored user data, returns null if absent or unparseable.
export function getUser(): StrapiUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StrapiUser) : null;
  } catch {
    return null;
  }
}

// Removes both token and user data — used by logout.
export function clearAuth(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.clear();
  } catch { /* ignore */ }
}

// Returns true if a token is present (basic client-side auth check).
export function isAuthenticated(): boolean {
  return !!getToken();
}

// Returns true if the stored user has an admin role.
export function isAdmin(): boolean {
  const user = getUser();
  return user?.role?.type === "admin" || user?.role?.name?.toLowerCase() === "admin";
}
