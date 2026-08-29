/**
 * Client HTTP générique prêt pour l'intégration FastAPI.
 *
 * NOTE: Pour cette phase, les services (materials.ts, users.ts, ...) renvoient
 * des données simulées (mock). Ce client est déjà en place pour que le
 * développeur suivant remplace les mocks par de vrais appels `apiFetch`.
 */

import { API_BASE_URL, AUTH_TOKEN_KEY } from "./config"

export class ApiError extends Error {
  status: number
  details?: unknown
  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setToken(token: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearToken() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  auth?: boolean
}

export async function apiFetch<T>(
  path: string,
  { body, auth = true, headers, ...init }: FetchOptions = {},
): Promise<T> {
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  }

  if (auth) {
    const token = getToken()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let details: unknown
    try {
      details = await res.json()
    } catch {
      details = await res.text()
    }
    throw new ApiError(
      `Erreur API (${res.status})`,
      res.status,
      details,
    )
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** Simule une latence réseau pour les données mock. */
export function mockDelay(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
