/**
 * Client HTTP centralisé pour le backend FastAPI.
 *
 * - Ajoute automatiquement l'en-tête `Authorization: Bearer <token>`.
 * - Traduit les erreurs HTTP en messages français exploitables (ApiError).
 * - Sur 401 (token expiré/invalide), purge la session et renvoie vers /login.
 * - Supporte les requêtes JSON et multipart/form-data (import Excel).
 */

import { API_BASE_URL, AUTH_TOKEN_KEY } from "./config"

export class ApiError extends Error {
  status: number
  /** Message prêt à afficher à l'utilisateur (français). */
  userMessage: string
  details?: unknown
  constructor(status: number, userMessage: string, details?: unknown) {
    super(userMessage)
    this.name = "ApiError"
    this.status = status
    this.userMessage = userMessage
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

/** Décode (sans vérifier la signature) le payload d'un JWT. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1]
    if (!part) return null
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(""),
    )
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

/** Identifiant de l'utilisateur courant, extrait du claim `sub` du JWT. */
export function getCurrentUserId(): number | null {
  const token = getToken()
  if (!token) return null
  const payload = decodeJwtPayload(token)
  const sub = payload?.sub
  const id = typeof sub === "string" ? Number(sub) : typeof sub === "number" ? sub : NaN
  return Number.isFinite(id) ? id : null
}

/** true si le token est absent ou expiré (claim `exp`). */
export function isTokenExpired(): boolean {
  const token = getToken()
  if (!token) return true
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (typeof exp !== "number") return false
  return Date.now() >= exp * 1000
}

/** Extrait un message lisible depuis le corps d'erreur FastAPI. */
function extractDetail(details: unknown): string | null {
  if (!details || typeof details !== "object") return null
  const detail = (details as { detail?: unknown }).detail
  if (typeof detail === "string") return detail
  // Erreurs de validation 422 : detail = [{ loc, msg, type }, ...]
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) =>
        d && typeof d === "object" && "msg" in d
          ? String((d as { msg: unknown }).msg)
          : null,
      )
      .filter(Boolean)
    if (msgs.length) return msgs.join(" · ")
  }
  return null
}

/** Message français par défaut selon le code de statut HTTP. */
function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return "Requête invalide. Vérifiez les informations saisies."
    case 401:
      return "Session expirée ou identifiants invalides. Veuillez vous reconnecter."
    case 403:
      return "Vous n'avez pas les droits nécessaires pour effectuer cette action."
    case 404:
      return "Ressource introuvable."
    case 409:
      return "Conflit : cette ressource existe déjà."
    case 422:
      return "Certaines informations sont invalides ou manquantes."
    case 500:
      return "Une erreur interne est survenue. Veuillez réessayer plus tard."
    default:
      if (status >= 500) return "Le service est momentanément indisponible."
      return "Une erreur est survenue. Veuillez réessayer."
  }
}

/** Combine le détail backend et le message par défaut. */
function buildMessage(status: number, details: unknown): string {
  const backendDetail = extractDetail(details)
  // Pour les 422 on privilégie le message métier du backend s'il existe.
  if (status === 409 || status === 400 || status === 422) {
    return backendDetail ?? defaultMessage(status)
  }
  return defaultMessage(status)
}

function redirectToLogin() {
  if (typeof window === "undefined") return
  if (window.location.pathname === "/login") return
  window.location.href = "/login"
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  auth?: boolean
  /** true => envoie `body` tel quel (FormData) sans en-tête JSON. */
  raw?: boolean
}

export async function apiFetch<T>(
  path: string,
  { body, auth = true, raw = false, headers, ...init }: FetchOptions = {},
): Promise<T> {
  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  }
  if (!raw) finalHeaders["Content-Type"] = "application/json"

  if (auth) {
    const token = getToken()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : raw
            ? (body as BodyInit)
            : JSON.stringify(body),
    })
  } catch {
    // Erreur réseau / API injoignable.
    throw new ApiError(
      0,
      "Impossible de contacter le serveur. Vérifiez que le backend est démarré et accessible.",
    )
  }

  if (!res.ok) {
    let details: unknown
    try {
      details = await res.json()
    } catch {
      try {
        details = await res.text()
      } catch {
        details = null
      }
    }

    if (res.status === 401 && auth) {
      clearToken()
      redirectToLogin()
    }

    throw new ApiError(res.status, buildMessage(res.status, details), details)
  }

  if (res.status === 204) return undefined as T
  // Certaines réponses (DELETE) renvoient un message JSON simple.
  const text = await res.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}
