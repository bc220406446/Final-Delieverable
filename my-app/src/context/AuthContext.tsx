"use client";

import {
  createContext, useContext, useEffect,
  useState, useCallback, type ReactNode, type JSX,
} from "react";
import type { StrapiUser } from "@/lib/api";
import { getToken, getUser, saveToken, saveUser, clearAuth } from "@/lib/auth";

// ── Cookie helpers ────────────────────────────────────────────────────────────
// Sets/clears csep_token cookie via a Next.js API route so middleware can read it.

async function setAuthCookie(token: string, remember: boolean): Promise<void> {
  try {
    await fetch("/api/auth/set-cookie", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, remember }),
    });
  } catch { /* non-critical */ }
}

async function clearAuthCookie(): Promise<void> {
  try {
    await fetch("/api/auth/set-cookie", { method: "DELETE" });
  } catch { /* non-critical */ }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user:            StrapiUser | null;
  token:           string | null;
  isLoading:       boolean;
  setAuthData:     (token: string, user: StrapiUser, remember?: boolean) => Promise<void>;
  logout:          () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin:         boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user,      setUser]      = useState<StrapiUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hydrate from storage on mount - await cookie refresh before marking ready.
  useEffect(() => {
    async function hydrate() {
      const storedToken = getToken();
      const storedUser  = getUser();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        // Await cookie set so middleware is ready before isLoading → false
        await setAuthCookie(storedToken, true);
      } else {
        // No stored session - clear any stale cookie from a previous session
        await clearAuthCookie();
      }
      setIsLoading(false);
    }
    hydrate();
  }, []);

  // Called after login/register - awaitable so callers can wait for cookie.
  const setAuthData = useCallback(async (
    jwt: string, userData: StrapiUser, remember = true
  ): Promise<void> => {
    saveToken(jwt, remember);
    saveUser(userData, remember);
    setToken(jwt);
    setUser(userData);
    await setAuthCookie(jwt, remember); // wait for cookie before returning
  }, []);

  // Clears all auth state and cookie.
  const logout = useCallback(async (): Promise<void> => {
    clearAuth();
    setToken(null);
    setUser(null);
    await clearAuthCookie(); // wait for cookie to be cleared
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = !!(
    user?.role?.type === "admin" ||
    user?.role?.name?.toLowerCase() === "admin"
  );

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, setAuthData, logout, isAuthenticated, isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
