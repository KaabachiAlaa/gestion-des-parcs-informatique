/**
 * Client HTTP centralisé pour le backend FastAPI.
 *
 * Toutes les requêtes passent par `apiFetch` :
 *  - injection automatique du jeton `Authorization: Bearer <JWT>` ;
 *  - gestion centralisée des erreurs avec messages en français ;
 *  - déconnexion automatique sur jeton expiré / invalide (401).
 */

import { API_BASE_URL, AUTH_TOKEN_KEY } from "./config"

/* ------------------------------------------------------------------ */
/* Erreurs                                                             */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Gestion du jeton JWT                                                */
/* ------------------------------------------------------------------ */

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

interface JwtPayload {
  sub?: string
  exp?: number
}

/** Décode (sans vérifier la signature) la charge utile d'un JWT. */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".")
    if (!payload) return null
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

/** Indique si le jeton est absent ou expiré. */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  const payload = decodeJwt(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 <= Date.now()
}

/** Identifiant de l'utilisateur courant extrait du JWT. */
export function getCurrentUserId(): number | null {
  const token = getToken()
  if (!token) return null
  const payload = decodeJwt(token)
  const sub = payload?.sub
  if (!sub) return null
  const id = Number(sub)
  return Number.isNaN(id) ? null : id
}

/* ------------------------------------------------------------------ */
/* Messages d'erreur en français                                       */
/* ------------------------------------------------------------------ */

/** Extrait un message lisible du corps d'erreur renvoyé par FastAPI. */
function extractDetail(details: unknown): string | null {
  if (!details || typeof details !== "object") return null
  const detail = (details as { detail?: unknown }).detail
  if (typeof detail === "string") return detail
  // Erreurs de validation FastAPI (422) : liste d'objets { loc, msg }.
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) => (d && typeof d === "object" ? (d as { msg?: string }).msg : null))
      .filter(Boolean)
    if (msgs.length) return msgs.join(" · ")
  }
  return null
}

/** Construit un message d'erreur français à partir du statut HTTP. */
export function messageForStatus(status: number, details?: unknown): string {
  const detail = extractDetail(details)
  switch (status) {
    case 400:
      return detail ?? "Requête invalide. Vérifiez les informations saisies."
    case 401:
      return "Session expirée ou identifiants invalides. Veuillez vous reconnecter."
    case 403:
      return "Vous n'avez pas les droits nécessaires pour effectuer cette action."
    case 404:
      return detail ?? "La ressource demandée est introuvable."
    case 409:
      return detail ?? "Conflit : cette ressource existe déjà."
    case 422:
      return detail
        ? `Données invalides : ${detail}`
        : "Les données envoyées sont invalides."
    case 500:
    case 502:
    case 503:
      return "Une erreur interne est survenue. Veuillez réessayer plus tard."
    default:
      return detail ?? "Une erreur est survenue. Veuillez réessayer."
  }
}

/** Message français pour toute erreur (ApiError, réseau, inconnue). */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof TypeError) {
    // `fetch` lève un TypeError quand le serveur est injoignable / CORS.
    return "Impossible de contacter le serveur. Vérifiez votre connexion et que l'API est démarrée."
  }
  if (error instanceof Error && error.message) return error.message
  return "Une erreur est survenue. Veuillez réessayer."
}

/* ------------------------------------------------------------------ */
/* Requête générique                                                   */
/* ------------------------------------------------------------------ */

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  auth?: boolean
  query?: Record<string, string | number | boolean | undefined | null>
}

function buildUrl(
  path: string,
  query?: FetchOptions["query"],
): string {
  const url = `${API_BASE_URL}${path}`
  if (!query) return url
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "")
      params.append(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${url}?${qs}` : url
}

export async function apiFetch<T>(
  path: string,
  { body, auth = true, headers, query, ...init }: FetchOptions = {},
): Promise<T> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData
  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  }
  if (!isForm && body !== undefined) {
    finalHeaders["Content-Type"] = "application/json"
  }

  if (auth) {
    const token = getToken()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(buildUrl(path, query), {
      ...init,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : isForm
            ? (body as FormData)
            : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      "Impossible de contacter le serveur. Vérifiez votre connexion et que l'API est démarrée.",
      0,
    )
  }

  if (!res.ok) {
    let details: unknown
    try {
      details = await res.json()
    } catch {
      details = null
    }

    // Jeton expiré / invalide sur une requête authentifiée → déconnexion.
    if (res.status === 401 && auth) {
      clearToken()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("comet:unauthorized"))
      }
    }

    throw new ApiError(messageForStatus(res.status, details), res.status, details)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}
