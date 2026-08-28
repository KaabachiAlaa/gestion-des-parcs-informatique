"use client"

const TOKEN_KEY = "comet_token"
const API_BASE_KEY = "comet_api_base"

const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function getApiBase(): string {
  if (typeof window === "undefined") return DEFAULT_API_BASE
  return window.localStorage.getItem(API_BASE_KEY) || DEFAULT_API_BASE
}

export function setApiBase(base: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(API_BASE_KEY, base.replace(/\/$/, ""))
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
  form?: boolean
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, form = false } = options
  const headers: Record<string, string> = {}
  const token = getToken()

  if (auth && token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  let payload: BodyInit | undefined
  if (body !== undefined) {
    if (form) {
      headers["Content-Type"] = "application/x-www-form-urlencoded"
      payload = new URLSearchParams(body as Record<string, string>).toString()
    } else {
      headers["Content-Type"] = "application/json"
      payload = JSON.stringify(body)
    }
  }

  let res: Response
  try {
    res = await fetch(`${getApiBase()}${path}`, {
      method,
      headers,
      body: payload,
    })
  } catch {
    throw new ApiError(
      0,
      "Impossible de joindre le serveur. Vérifiez l'URL de l'API et que le backend est démarré.",
    )
  }

  if (res.status === 401) {
    clearToken()
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login"
    }
    throw new ApiError(401, "Session expirée. Veuillez vous reconnecter.")
  }

  if (!res.ok) {
    let detail = `Erreur ${res.status}`
    try {
      const data = await res.json()
      if (typeof data?.detail === "string") detail = data.detail
      else if (Array.isArray(data?.detail))
        detail = data.detail.map((d: { msg?: string }) => d.msg).join(", ")
    } catch {
      /* ignore parse error */
    }
    throw new ApiError(res.status, detail)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

// SWR fetcher
export const fetcher = <T>(path: string) => apiFetch<T>(path)
