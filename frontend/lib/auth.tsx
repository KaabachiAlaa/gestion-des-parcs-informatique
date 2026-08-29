"use client";

// Mock authentication / role context. This mirrors the shape the real
// FastAPI JWT auth (`app/routers/auth.py`) would eventually populate, but
// stores everything in memory + localStorage for demo purposes only.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MOCK_USERS } from "@/lib/mock-data";
import type { Role, User } from "@/lib/types";

interface AuthContextValue {
  user: User;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setRole: (role: Role) => void;
}

const STORAGE_KEY = "comet-gpi-session";

function userForRole(role: Role): User {
  return MOCK_USERS.find((u) => u.role === role) ?? MOCK_USERS[0];
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { role: Role; authed: boolean };
        setUser(userForRole(parsed.role));
        setIsAuthenticated(parsed.authed);
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ role: user.role, authed: isAuthenticated }),
    );
  }, [user, isAuthenticated, hydrated]);

  async function login(_username: string, _password: string) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsAuthenticated(true);
  }

  function logout() {
    setIsAuthenticated(false);
  }

  function setRole(role: Role) {
    setUser(userForRole(role));
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, setRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
