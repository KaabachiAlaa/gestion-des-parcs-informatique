"use client"

/**
 * Contexte d'authentification côté frontend — branché sur le backend FastAPI.
 *
 * - `login` appelle POST /auth/login, stocke le JWT puis récupère le profil.
 * - Au montage, si un token valide existe, la session est restaurée via
 *   GET /auth/me (le rôle est résolu via /roles dans authService).
 * - `logout` purge le token et renvoie vers /login.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import type { LoginInput, User } from "@/types"
import { authService } from "@/lib/api/services"
import { clearToken, getToken, isTokenExpired } from "@/lib/api/client"
import { can, type Permission } from "./permissions"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  logout: () => void
  hasPermission: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Restauration de session au chargement.
  useEffect(() => {
    let cancelled = false
    async function restore() {
      if (!getToken() || isTokenExpired()) {
        clearToken()
        if (!cancelled) setIsLoading(false)
        return
      }
      try {
        const profile = await authService.me()
        if (!cancelled) setUser(profile)
      } catch {
        clearToken()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const profile = await authService.login(input)
    setUser(profile)
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    router.push("/login")
  }, [router])

  const hasPermission = useCallback(
    (permission: Permission) => can(user?.role.name, permission),
    [user],
  )

  const value = useMemo(
    () => ({ user, isLoading, login, logout, hasPermission }),
    [user, isLoading, login, logout, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider")
  return ctx
}
