"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { api, setToken, clearToken, getToken, ApiError } from "./api"
import type { RoleName } from "./types"

const PROFILE_KEY = "comet_profile"

export interface AuthProfile {
  userId: number | null
  username: string
  role: RoleName
  firstName?: string
  lastName?: string
  email?: string
  roleId?: number
}

interface AuthContextValue {
  profile: AuthProfile | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  can: (roles: RoleName[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function decodeJwt(token: string): { sub?: string; exp?: number } | null {
  try {
    const payload = token.split(".")[1]
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json)
  } catch {
    return null
  }
}

async function detectRole(): Promise<RoleName> {
  // No /auth/me endpoint exists — probe existing endpoints by permission.
  try {
    await api.getUsers()
    return "Admin"
  } catch (e) {
    if (!(e instanceof ApiError) || (e.status !== 403 && e.status !== 401)) {
      // network or other error — assume lowest privilege but keep going
    }
  }
  try {
    await api.getRepairs()
    return "Technicien"
  } catch {
    // ignore
  }
  return "Consultant"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    const decoded = decodeJwt(token)
    if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
      clearToken()
      window.localStorage.removeItem(PROFILE_KEY)
      setLoading(false)
      return
    }
    const stored = window.localStorage.getItem(PROFILE_KEY)
    if (stored) {
      try {
        setProfile(JSON.parse(stored))
      } catch {
        /* ignore */
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password)
    setToken(res.access_token)
    const decoded = decodeJwt(res.access_token)
    const userId = decoded?.sub ? Number.parseInt(decoded.sub, 10) : null

    const role = await detectRole()

    let firstName: string | undefined
    let lastName: string | undefined
    let email: string | undefined
    let roleId: number | undefined

    if (role === "Admin" && userId != null) {
      try {
        const me = await api.getUser(userId)
        firstName = me.first_name
        lastName = me.last_name
        email = me.email
        roleId = me.role_id
      } catch {
        /* ignore */
      }
    }

    const newProfile: AuthProfile = {
      userId,
      username,
      role,
      firstName,
      lastName,
      email,
      roleId,
    }
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile))
    setProfile(newProfile)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    window.localStorage.removeItem(PROFILE_KEY)
    setProfile(null)
    window.location.href = "/login"
  }, [])

  const can = useCallback(
    (roles: RoleName[]) => (profile ? roles.includes(profile.role) : false),
    [profile],
  )

  return (
    <AuthContext.Provider value={{ profile, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
