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
    }
    setIsLoading(false);
  }, []);

  // Called after successful login or register to persist and broadcast auth state.
  const setAuthData = useCallback((jwt: string, userData: StrapiUser): void => {
    saveToken(jwt);
    saveUser(userData);
    setToken(jwt);
    setUser(userData);
  }, []);

  // Clears all auth state — call this from any logout action.
  const logout = useCallback((): void => {
    clearAuth();
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
