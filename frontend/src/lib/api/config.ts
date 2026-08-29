/**
 * Configuration centrale de l'API.
 *
 * Les routes correspondent EXACTEMENT aux endpoints exposés par le backend
 * FastAPI existant (voir /app/routers). Aucune route n'est inventée.
 *
 * Remarques importantes sur le backend :
 *  - Les endpoints de collection utilisent un slash final (`/materials/`).
 *  - L'utilisateur courant est résolu via `GET /auth/me` (profil + rôle),
 *    endpoint ajouté au backend pour prendre en charge tous les rôles.
 *  - Les routes `/materials/search` et `/users/search` sont masquées par les
 *    routes `/{id}` déclarées avant elles dans le backend ; la recherche et la
 *    pagination sont donc réalisées côté client à partir des listes complètes.
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

/** Clés de stockage local. */
export const AUTH_TOKEN_KEY = "comet_gpi_token"
export const AUTH_SESSION_KEY = "comet_gpi_session"
