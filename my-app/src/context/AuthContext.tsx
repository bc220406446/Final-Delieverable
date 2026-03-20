"use client";

// Global auth context — wraps the entire app so any component can read
// the current user and call login/logout without prop-drilling.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type JSX,
} from "react";

import type { StrapiUser } from "@/lib/api";
import { getToken, getUser, saveToken, saveUser, clearAuth } from "@/lib/auth";

// ── Cookie helpers (for middleware — Edge runtime can't read localStorage) ────
// We set a lightweight cookie that middleware can check without the full JWT.
function setAuthCookie(token: string): void {
  // HttpOnly not possible from JS — this cookie is just for middleware routing.
  // The real auth token stays in localStorage.
  document.cookie = `csep_token=${token}; path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
}
function clearAuthCookie(): void {
  document.cookie = "csep_token=; path=/; SameSite=Lax; Max-Age=0";
}

interface AuthContextValue {
  user:          StrapiUser | null;
  token:         string | null;
  isLoading:     boolean;
  setAuthData:   (token: string, user: StrapiUser) => void;
  logout:        () => void;
  isAuthenticated: boolean;
  isAdmin:       boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Hydrates auth state from localStorage on first render.
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user,      setUser]      = useState<StrapiUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount, restore auth state from localStorage.
  useEffect(() => {
    const storedToken = getToken();
    const storedUser  = getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setAuthCookie(storedToken); // refresh cookie in case it expired
    }
    setIsLoading(false);
  }, []);

  // Called after successful login or register to persist and broadcast auth state.
  const setAuthData = useCallback((jwt: string, userData: StrapiUser): void => {
    saveToken(jwt);
    saveUser(userData);
    setToken(jwt);
    setUser(userData);
    setAuthCookie(jwt);   // let middleware know user is logged in
  }, []);

  // Clears all auth state — call this from any logout action.
  const logout = useCallback((): void => {
    clearAuth();
    clearAuthCookie();    // remove middleware cookie
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = user?.role?.type === "admin" || user?.role?.name?.toLowerCase() === "admin";

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setAuthData, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to consume auth context anywhere in the app.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
