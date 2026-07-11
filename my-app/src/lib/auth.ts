import type { StrapiUser } from "./api";

// Storage keys used for the frontend login session.
const TOKEN_KEY = "userToken";
const USER_KEY  = "userData";
const REMEMBER_KEY = "rememberMe";

// Finds where the current session is stored: localStorage for remembered login,
// or sessionStorage for a browser-session-only login.
function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    if (localStorage.getItem(TOKEN_KEY))  return localStorage;
    if (sessionStorage.getItem(TOKEN_KEY)) return sessionStorage;
    return null;
  } catch { return null; }
}

// Save the JWT in the selected browser storage.
export function saveToken(token: string, remember = true): void {
  try {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_KEY, String(remember));
  } catch { /* private/SSR mode */ }
}

// Read the saved JWT, if the user has an active frontend session.
export function getToken(): string | null {
  try {
    return getStorage()?.getItem(TOKEN_KEY) ?? null;
  } catch { return null; }
}

// Save the logged-in user's profile alongside the token.
export function saveUser(user: StrapiUser, remember = true): void {
  try {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(USER_KEY, JSON.stringify(user));
  } catch { /* ignore */ }
}

// Parse the saved user object for AuthContext hydration.
export function getUser(): StrapiUser | null {
  try {
    const raw = getStorage()?.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StrapiUser) : null;
  } catch { return null; }
}

// Clear both storage locations so logout is complete regardless of remember mode.
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
