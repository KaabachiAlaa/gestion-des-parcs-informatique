"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { apiFetch, ApiError, clearToken, getToken, setToken } from "./api"
import type { AppRole, SessionUser, User } from "./types"

interface AuthContextValue {
  user: SessionUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  can: (action: Action) => boolean
}

type Action =
  | "manage_materials"
  | "manage_repairs"
  | "manage_requests"
  | "manage_users"
  | "view_repairs"

const SESSION_KEY = "comet_session"

const AuthContext = createContext<AuthContextValue | null>(null)

// Detect the role by probing role-gated endpoints.
// /users/ -> Admin only ; /repairs/ -> Admin + Technicien ; else Consultant.
async function detectRole(): Promise<AppRole> {
  try {
    await apiFetch("/users/", { method: "GET" })
    return "admin"
  } catch (e) {
    if (!(e instanceof ApiError) || (e.status !== 403 && e.status !== 401)) {
      // network/other error — assume lowest privilege but continue
    }
  }
  try {
    await apiFetch("/repairs/", { method: "GET" })
    return "technician"
  } catch {
    /* fall through */
  }
  return "consultant"
}

// Try to enrich session with profile info (only admins can read /users/).
async function loadProfile(userId: number): Promise<Partial<SessionUser>> {
  try {
    const u = await apiFetch<User>(`/users/${userId}`, { method: "GET" })
    return {
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
    }
  } catch {
    return {}
  }
}

function decodeUserId(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const sub = payload?.sub
    const id = typeof sub === "string" ? Number.parseInt(sub, 10) : Number(sub)
    return Number.isFinite(id) ? id : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const bootstrap = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    // Restore cached session first for instant UI.
    const cached = window.localStorage.getItem(SESSION_KEY)
    if (cached) {
      try {
        setUser(JSON.parse(cached))
      } catch {
        /* ignore */
      }
    }
    const id = decodeUserId(token)
    if (id === null) {
      clearToken()
      setLoading(false)
      return
    }
    try {
      const role = await detectRole()
      const profile = role === "admin" ? await loadProfile(id) : {}
      const session: SessionUser = { id, role, ...profile }
      setUser(session)
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      /* keep cached session */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiFetch<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    })
    setToken(res.access_token)
    const id = decodeUserId(res.access_token)
    const role = await detectRole()
    const profile = role === "admin" && id !== null ? await loadProfile(id) : {}
    const session: SessionUser = {
      id: id ?? 0,
      role,
      username,
      ...profile,
    }
    setUser(session)
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }, [])

  const logout = useCallback(() => {
    clearToken()
    window.localStorage.removeItem(SESSION_KEY)
    setUser(null)
    window.location.href = "/login"
  }, [])

  const can = useCallback(
    (action: Action) => {
      if (!user) return false
      switch (action) {
        case "manage_materials":
          return user.role === "admin" || user.role === "technician"
        case "manage_repairs":
          return user.role === "admin" || user.role === "technician"
        case "view_repairs":
          return user.role === "admin" || user.role === "technician"
        case "manage_requests":
          return user.role === "admin" || user.role === "technician"
        case "manage_users":
          return user.role === "admin"
        default:
          return false
      }
    },
    [user],
  )

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
