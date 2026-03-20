// Client-side auth helpers for storing and reading JWT + user data.
//
// Storage strategy:
//   rememberMe = true  → localStorage  (persists after browser close)
//   rememberMe = false → sessionStorage (cleared when tab/browser closes)

import type { StrapiUser } from "./api";

const TOKEN_KEY = "userToken";
const USER_KEY  = "userData";
const REMEMBER_KEY = "rememberMe";

// Determines which storage to read from based on where the token was saved.
function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    // Check localStorage first, then sessionStorage
    if (localStorage.getItem(TOKEN_KEY))  return localStorage;
    if (sessionStorage.getItem(TOKEN_KEY)) return sessionStorage;
    return null;
  } catch { return null; }
}

// Saves auth data to the appropriate storage based on rememberMe preference.
export function saveToken(token: string, remember = true): void {
  try {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEY, token);
    // Record which storage was used so we can clear the right one on logout
    localStorage.setItem(REMEMBER_KEY, String(remember));
  } catch { /* private/SSR mode */ }
}

export function getToken(): string | null {
  try {
    return getStorage()?.getItem(TOKEN_KEY) ?? null;
  } catch { return null; }
}

export function saveUser(user: StrapiUser, remember = true): void {
  try {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(USER_KEY, JSON.stringify(user));
  } catch { /* ignore */ }
}

export function getUser(): StrapiUser | null {
  try {
    const raw = getStorage()?.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StrapiUser) : null;
  } catch { return null; }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.clear();
  } catch { /* ignore */ }
}

export function isAuthenticated(): boolean { return !!getToken(); }

export function isAdmin(): boolean {
  const user = getUser();
  return user?.role?.type === "admin" || user?.role?.name?.toLowerCase() === "admin";
}
