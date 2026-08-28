'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  apiFetch,
  ApiError,
  clearToken,
  getToken,
  setToken,
} from './api'
import type { RoleName, User } from './types'

interface AuthState {
  userId: number | null
  role: RoleName | null
  user: User | null
}

interface AuthContextValue extends AuthState {
  ready: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  can: (action: 'write' | 'admin') => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_KEY = 'comet_session'

function decodeUserId(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const sub = payload?.sub
    return sub != null ? Number(sub) : null
  } catch {
    return null
  }
}

// The JWT only contains the user id, and there is no /auth/me endpoint,
// so we derive the role by probing the role-protected endpoints.
async function deriveRole(): Promise<RoleName> {
  try {
    await apiFetch('/users/', { method: 'GET' })
    return 'Admin'
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 403) {
      // network / other error: fall through to next probe
    }
  }
  try {
    await apiFetch('/repairs/', { method: 'GET' })
    return 'Technicien'
  } catch {
    // ignore
  }
  return 'Consultant'
}

async function loadUser(userId: number, role: RoleName): Promise<User | null> {
  if (role !== 'Admin') return null
  try {
    return await apiFetch<User>(`/users/${userId}`)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    userId: null,
    role: null,
    user: null,
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setReady(true)
      return
    }
    const userId = decodeUserId(token)
    const cached = (() => {
      try {
        return JSON.parse(
          window.localStorage.getItem(SESSION_KEY) ?? 'null',
        ) as AuthState | null
      } catch {
        return null
      }
    })()

    if (cached?.role) {
      setState(cached)
      setReady(true)
      return
    }

    deriveRole()
      .then(async (role) => {
        const user = userId ? await loadUser(userId, role) : null
        const next = { userId, role, user }
        setState(next)
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      })
      .finally(() => setReady(true))
  }, [])

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await apiFetch<{ access_token: string; token_type: string }>(
        '/auth/login',
        { method: 'POST', body: { username, password }, auth: false },
      )
      setToken(res.access_token)
      const userId = decodeUserId(res.access_token)
      const role = await deriveRole()
      const user = userId ? await loadUser(userId, role) : null
      const next = { userId, role, user }
      setState(next)
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    },
    [],
  )

  const logout = useCallback(() => {
    clearToken()
    window.localStorage.removeItem(SESSION_KEY)
    setState({ userId: null, role: null, user: null })
    router.push('/login')
  }, [router])

  const can = useCallback(
    (action: 'write' | 'admin') => {
      if (action === 'admin') return state.role === 'Admin'
      return state.role === 'Admin' || state.role === 'Technicien'
    },
    [state.role],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      ready,
      isAuthenticated: !!state.role,
      login,
      logout,
      can,
    }),
    [state, ready, login, logout, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
