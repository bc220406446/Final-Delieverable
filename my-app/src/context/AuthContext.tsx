"use client";

import {
  createContext, useContext, useEffect,
  useState, useCallback, type ReactNode, type JSX,
} from "react";
import type { StrapiUser } from "@/lib/api";
import { getToken, getUser, saveToken, saveUser, clearAuth } from "@/lib/auth";

// Auth state is stored in browser storage for the UI and mirrored into a cookie so Next.js proxy can protect routes before pages render.
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

// Shape of the data and actions that every component receives from useAuth().
interface AuthContextValue {
  user:            StrapiUser | null;
  token:           string | null;
  isLoading:       boolean;
  setAuthData:     (token: string, user: StrapiUser, remember?: boolean) => Promise<void>;
  logout:          () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user,      setUser]      = useState<StrapiUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On first load, restore the saved login session and refresh the auth cookie.
  useEffect(() => {
    async function hydrate() {
      const storedToken = getToken();
      const storedUser  = getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        // Wait for the cookie before marking auth ready.
        await setAuthCookie(storedToken, true);
      } else {
        // Remove any old cookie when no saved session exists.
        await clearAuthCookie();
      }

      setIsLoading(false);
    }

    hydrate();
  }, []);

  // Called after login/register to save the JWT, user data, and proxy cookie.
  const setAuthData = useCallback(async (
    jwt: string, userData: StrapiUser, remember = true
  ): Promise<void> => {
    saveToken(jwt, remember);
    saveUser(userData, remember);
    setToken(jwt);
    setUser(userData);
    await setAuthCookie(jwt, remember);
  }, []);

  // Logout clears browser storage, React state, and the cookie used by proxy.
  const logout = useCallback(async (): Promise<void> => {
    clearAuth();
    setToken(null);
    setUser(null);
    await clearAuthCookie();
  }, []);

  // Components can use this simple flag instead of checking token manually.
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, setAuthData, logout, isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  // This makes incorrect usage obvious during development.
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
