"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  email: string;
  name: string;
  role: string;
  organizationId: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: async () => false, logout: () => {}, loading: true });

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "admin@afrilogistics.com": { password: "admin123", user: { email: "admin@afrilogistics.com", name: "Admin Kimani", role: "admin", organizationId: "default-org" } },
  "driver@afrilogistics.com": { password: "driver123", user: { email: "driver@afrilogistics.com", name: "James Mwangi", role: "driver", organizationId: "default-org" } },
  "dispatcher@afrilogistics.com": { password: "dispatch123", user: { email: "dispatcher@afrilogistics.com", name: "Fatima Al-Hassan", role: "dispatcher", organizationId: "default-org" } },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("afrilogistics_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const entry = DEMO_USERS[email];
    if (entry && entry.password === password) {
      setUser(entry.user);
      localStorage.setItem("afrilogistics_user", JSON.stringify(entry.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("afrilogistics_user");
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
