// Central API client for the FastAPI backend.
// Base URL points to the locally running FastAPI server.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'

const TOKEN_KEY = 'comet_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
}

export async function apiFetch<T = unknown>(
  path: string,
  { method = 'GET', body, auth = true, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch {
    throw new ApiError(
      0,
      `Impossible de contacter le serveur (${API_BASE_URL}). Vérifiez que l'API est démarrée.`,
    )
  }

  if (res.status === 204) {
    return undefined as T
  }

  let data: unknown = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const detail =
      (data as { detail?: string | { msg?: string }[] })?.detail ??
      `Erreur ${res.status}`
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d?.msg).filter(Boolean).join(', ')
          : `Erreur ${res.status}`
    throw new ApiError(res.status, message)
  }

  return data as T
}

// SWR fetcher
export const fetcher = <T>(path: string) => apiFetch<T>(path)
