"use client";

import type { UserRole } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextValue {
  token: string | null;
  role: UserRole | null;
  isAdmin: boolean;
  setAuth: (token: string, role: UserRole) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role") as UserRole | null;
    if (storedToken) setToken(storedToken);
    if (storedRole) setRole(storedRole);
  }, []);

  const setAuth = (newToken: string, newRole: UserRole) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, isAdmin: role === "admin", setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
