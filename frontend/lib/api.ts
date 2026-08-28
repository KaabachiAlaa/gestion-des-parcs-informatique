import type {
  Category,
  Location,
  Material,
  Repair,
  Role,
  SupportRequest,
  User,
} from "./types"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000"

const TOKEN_KEY = "comet_token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
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
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options
  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"

  if (auth) {
    const token = getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
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
      "Impossible de contacter le serveur. Vérifiez que l'API est démarrée sur " +
        API_BASE_URL,
    )
  }

  if (res.status === 401) {
    if (typeof window !== "undefined" && !path.startsWith("/auth/login")) {
      clearToken()
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    throw new ApiError(401, "Session expirée. Veuillez vous reconnecter.")
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
      (data && typeof data === "object" && "detail" in data
        ? (data as { detail: unknown }).detail
        : null) ?? res.statusText
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join(", ")
          : "Une erreur est survenue."
    throw new ApiError(res.status, message)
  }

  return data as T
}

export const api = {
  request,

  // Auth
  login: (username: string, password: string) =>
    request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    }),

  // Roles
  getRoles: () => request<Role[]>("/roles/"),

  // Categories
  getCategories: () => request<Category[]>("/categories/"),
  createCategory: (body: { name: string; description?: string | null }) =>
    request<Category>("/categories/", { method: "POST", body }),
  deleteCategory: (id: number) =>
    request<{ message: string }>(`/categories/${id}`, { method: "DELETE" }),

  // Locations
  getLocations: () => request<Location[]>("/locations/"),
  createLocation: (body: { place: string; description?: string | null }) =>
    request<Location>("/locations/", { method: "POST", body }),
  deleteLocation: (id: number) =>
    request<{ message: string }>(`/locations/${id}`, { method: "DELETE" }),

  // Materials
  getMaterials: () => request<Material[]>("/materials/"),
  getMaterial: (id: number) => request<Material>(`/materials/${id}`),
  createMaterial: (body: Partial<Material>) =>
    request<Material>("/materials/", { method: "POST", body }),
  updateMaterial: (id: number, body: Partial<Material>) =>
    request<Material>(`/materials/${id}`, { method: "PUT", body }),
  deleteMaterial: (id: number) =>
    request<{ message: string }>(`/materials/${id}`, { method: "DELETE" }),

  // Repairs
  getRepairs: () => request<Repair[]>("/repairs/"),
  getRepair: (id: number) => request<Repair>(`/repairs/${id}`),
  createRepair: (body: Partial<Repair>) =>
    request<Repair>("/repairs/", { method: "POST", body }),
  updateRepair: (id: number, body: Partial<Repair>) =>
    request<Repair>(`/repairs/${id}`, { method: "PUT", body }),
  deleteRepair: (id: number) =>
    request<{ message: string }>(`/repairs/${id}`, { method: "DELETE" }),

  // Requests
  getRequests: () => request<SupportRequest[]>("/requests/"),
  getRequest: (id: number) => request<SupportRequest>(`/requests/${id}`),
  createRequest: (body: Partial<SupportRequest>) =>
    request<SupportRequest>("/requests/", { method: "POST", body }),
  updateRequest: (id: number, body: Partial<SupportRequest>) =>
    request<SupportRequest>(`/requests/${id}`, { method: "PUT", body }),
  deleteRequest: (id: number) =>
    request<{ message: string }>(`/requests/${id}`, { method: "DELETE" }),

  // Users
  getUsers: () => request<User[]>("/users/"),
  getUser: (id: number) => request<User>(`/users/${id}`),
  createUser: (body: {
    username: string
    first_name: string
    last_name: string
    email: string
    role_id: number
    password: string
  }) => request<User>("/users/", { method: "POST", body }),
  deleteUser: (id: number) =>
    request<{ message: string }>(`/users/${id}`, { method: "DELETE" }),
}
