/**
 * Configuration centrale de l'API.
 * L'URL de base pointe vers le backend FastAPI existant.
 * L'intégration réelle sera effectuée ultérieurement.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
  },
  materials: {
    root: "/materials",
    search: "/materials/search",
    byId: (id: number) => `/materials/${id}`,
    importExcel: "/materials/import",
  },
  repairs: {
    root: "/repairs",
    search: "/repairs/search",
    byId: (id: number) => `/repairs/${id}`,
    byMaterial: (materialId: number) => `/repairs/material/${materialId}`,
  },
  users: {
    root: "/users",
    search: "/users/search",
    byId: (id: number) => `/users/${id}`,
  },
  requests: {
    root: "/requests",
    search: "/requests/search",
    byId: (id: number) => `/requests/${id}`,
  },
  roles: {
    root: "/roles",
  },
  categories: {
    root: "/categories",
  },
  locations: {
    root: "/locations",
  },
} as const

export const AUTH_TOKEN_KEY = "comet_gpi_token"
