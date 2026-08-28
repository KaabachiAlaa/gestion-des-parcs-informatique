export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export const TOKEN_KEY = "comet_token"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
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

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  auth?: boolean
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data.detail === "string") return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((d: { msg?: string }) => d.msg)
        .filter(Boolean)
        .join(", ")
    }
    return res.statusText || "Une erreur est survenue"
  } catch {
    return res.statusText || "Une erreur est survenue"
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  }

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json"
  }

  if (auth) {
    const token = getToken()
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const message = await extractErrorMessage(res)
    if (res.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("comet:unauthorized"))
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

export function buildQuery(
  params: Record<string, string | number | undefined | null>
): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}
