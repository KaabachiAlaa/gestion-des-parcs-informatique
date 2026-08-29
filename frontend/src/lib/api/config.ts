/**
 * Configuration centrale de l'API.
 * L'URL de base pointe vers le backend FastAPI existant.
 *
 * Les chemins ci-dessous correspondent EXACTEMENT aux routes déclarées par le
 * backend (voir /app/routers/*). Les routes de collection se terminent par "/"
 * pour coller au préfixe FastAPI et éviter une redirection 307.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
  },
  materials: {
    root: "/materials/",
    byId: (id: number) => `/materials/${id}`,
    importExcel: "/materials/import",
  },
  repairs: {
    root: "/repairs/",
    byId: (id: number) => `/repairs/${id}`,
  },
  users: {
    root: "/users/",
    byId: (id: number) => `/users/${id}`,
  },
  requests: {
    root: "/requests/",
    byId: (id: number) => `/requests/${id}`,
  },
  roles: {
    root: "/roles/",
  },
  categories: {
    root: "/categories/",
  },
  locations: {
    root: "/locations/",
  },
} as const

export const AUTH_TOKEN_KEY = "comet_gpi_token"
