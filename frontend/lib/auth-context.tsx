"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { authApi, rolesApi, usersApi } from "./api"
import { ApiError, clearToken, setToken as persistToken } from "./api-client"
import type { User } from "./types"

export interface AuthUser extends User {
  roleName: string
}

const PROFILE_KEY = "comet_profile"

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
  isTechnicien: boolean
  canWrite: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function resolveProfile(username: string): Promise<AuthUser> {
  const result = await usersApi.search({ search: username, limit: 20 })
  const match =
    result.data.find((u) => u.username === username) ?? result.data[0]

  if (!match) {
    throw new ApiError(
      "Impossible de récupérer le profil de l'utilisateur",
      404
    )
  }

  let roleName = "Utilisateur"
  try {
    const role = await rolesApi.get(match.role_id)
    roleName = role.name
  } catch {
    // keep default label if role lookup fails
  }

  return { ...match, roleName }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = window.localStorage.getItem(PROFILE_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        window.localStorage.removeItem(PROFILE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const { access_token } = await authApi.login(username, password)
    persistToken(access_token)
    const profile = await resolveProfile(username)
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    setUser(profile)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    window.localStorage.removeItem(PROFILE_KEY)
    setUser(null)
    router.push("/login")
  }, [router])

  useEffect(() => {
    const handleUnauthorized = () => logout()
    window.addEventListener("comet:unauthorized", handleUnauthorized)
    return () =>
      window.removeEventListener("comet:unauthorized", handleUnauthorized)
  }, [logout])

  const isAdmin = user?.roleName === "Admin"
  const isTechnicien = user?.roleName === "Technicien"

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin,
        isTechnicien,
        canWrite: isAdmin || isTechnicien,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function roleLabel(roleName: string | undefined): string {
  switch (roleName) {
    case "Admin":
      return "Administrateur"
    case "Technicien":
      return "Technicien"
    default:
      return "Consultant"
  }
}
