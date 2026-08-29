"use client"

/**
 * Contexte d'authentification côté frontend.
 *
 * Phase actuelle : simule la connexion avec les données mock et persiste
 * l'utilisateur courant dans le localStorage. L'intégration réelle branchera
 * `/auth/login` et `/auth/me` (voir lib/api/config.ts).
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
import type { LoginInput, RoleName, User } from "@/types"
import { users as mockUsers } from "@/lib/mock/data"
import { can, type Permission } from "./permissions"

const SESSION_KEY = "comet_gpi_session"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  logout: () => void
  switchRole: (role: RoleName) => void
  hasPermission: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY)
      if (raw) setUser(JSON.parse(raw) as User)
    } catch {
      /* ignore */
    }
    setIsLoading(false)
  }, [])

  const persist = useCallback((next: User | null) => {
    setUser(next)
    if (next) window.localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    else window.localStorage.removeItem(SESSION_KEY)
  }, [])

  const login = useCallback(
    async ({ username, password }: LoginInput) => {
      // Simulation : validation locale sur les données mock.
      await new Promise((r) => setTimeout(r, 700))
      if (!password) throw new Error("Mot de passe requis.")
      const found =
        mockUsers.find(
          (u) => u.username === username || u.email === username,
        ) ?? mockUsers[0]
      if (!found.is_active) throw new Error("Ce compte est désactivé.")
      persist(found)
    },
    [persist],
  )

  const logout = useCallback(() => {
    persist(null)
    router.push("/login")
  }, [persist, router])

  const switchRole = useCallback(
    (role: RoleName) => {
      setUser((prev) => {
        if (!prev) return prev
        const nextRole =
          mockUsers.find((u) => u.role.name === role)?.role ?? prev.role
        const next = { ...prev, role: nextRole }
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(next))
        return next
      })
    },
    [],
  )

  const hasPermission = useCallback(
    (permission: Permission) => can(user?.role.name, permission),
    [user],
  )

  const value = useMemo(
    () => ({ user, isLoading, login, logout, switchRole, hasPermission }),
    [user, isLoading, login, logout, switchRole, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider")
  return ctx
}
