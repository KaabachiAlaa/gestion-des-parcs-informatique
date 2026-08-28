import { apiFetch, buildQuery } from "./api-client"
import type {
  Category,
  Location,
  Material,
  MaterialInput,
  PaginatedResponse,
  Repair,
  RepairInput,
  Role,
  ServiceRequest,
  ServiceRequestInput,
  User,
} from "./types"

export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    }),
}

export const rolesApi = {
  list: () => apiFetch<Role[]>("/roles/"),
  get: (id: number) => apiFetch<Role>(`/roles/${id}`),
  create: (data: { name: string; description?: string | null }) =>
    apiFetch<Role>("/roles/", { method: "POST", body: data }),
}

export const categoriesApi = {
  list: () => apiFetch<Category[]>("/categories/"),
  get: (id: number) => apiFetch<Category>(`/categories/${id}`),
  create: (data: { name: string; description?: string | null }) =>
    apiFetch<Category>("/categories/", { method: "POST", body: data }),
  delete: (id: number) =>
    apiFetch<{ message: string }>(`/categories/${id}`, { method: "DELETE" }),
}

export const locationsApi = {
  list: () => apiFetch<Location[]>("/locations/"),
  get: (id: number) => apiFetch<Location>(`/locations/${id}`),
  create: (data: { place: string; description?: string | null }) =>
    apiFetch<Location>("/locations/", { method: "POST", body: data }),
  delete: (id: number) =>
    apiFetch<{ message: string }>(`/locations/${id}`, { method: "DELETE" }),
}

export const materialsApi = {
  list: () => apiFetch<Material[]>("/materials/"),
  get: (id: number) => apiFetch<Material>(`/materials/${id}`),
  create: (data: MaterialInput) =>
    apiFetch<Material>("/materials/", { method: "POST", body: data }),
  update: (id: number, data: Partial<MaterialInput>) =>
    apiFetch<Material>(`/materials/${id}`, { method: "PUT", body: data }),
  delete: (id: number) =>
    apiFetch<{ message: string }>(`/materials/${id}`, { method: "DELETE" }),
  search: (params: { search?: string; page?: number; limit?: number }) =>
    apiFetch<PaginatedResponse<Material>>(
      `/materials/search${buildQuery(params)}`
    ),
}

export const repairsApi = {
  list: () => apiFetch<Repair[]>("/repairs/"),
  get: (id: number) => apiFetch<Repair>(`/repairs/${id}`),
  create: (data: RepairInput) =>
    apiFetch<Repair>("/repairs/", { method: "POST", body: data }),
  update: (id: number, data: Partial<RepairInput>) =>
    apiFetch<Repair>(`/repairs/${id}`, { method: "PUT", body: data }),
  delete: (id: number) =>
    apiFetch<{ message: string }>(`/repairs/${id}`, { method: "DELETE" }),
}

export const requestsApi = {
  list: () => apiFetch<ServiceRequest[]>("/requests/"),
  get: (id: number) => apiFetch<ServiceRequest>(`/requests/${id}`),
  create: (data: ServiceRequestInput) =>
    apiFetch<ServiceRequest>("/requests/", { method: "POST", body: data }),
  update: (id: number, data: Partial<ServiceRequestInput>) =>
    apiFetch<ServiceRequest>(`/requests/${id}`, { method: "PUT", body: data }),
  delete: (id: number) =>
    apiFetch<{ message: string }>(`/requests/${id}`, { method: "DELETE" }),
}

export type UserInput = {
  username: string
  first_name: string
  last_name: string
  email: string
  role_id: number
  password: string
}

export const usersApi = {
  list: () => apiFetch<User[]>("/users/"),
  get: (id: number) => apiFetch<User>(`/users/${id}`),
  create: (data: UserInput) =>
    apiFetch<User>("/users/", { method: "POST", body: data }),
  update: (id: number, data: Partial<UserInput>) =>
    apiFetch<User>(`/users/${id}`, { method: "PUT", body: data }),
  setStatus: (id: number, is_active: boolean) =>
    apiFetch<User>(`/users/${id}/status`, {
      method: "PATCH",
      body: { is_active },
    }),
  delete: (id: number) =>
    apiFetch<{ message: string }>(`/users/${id}`, { method: "DELETE" }),
  search: (params: { search?: string; page?: number; limit?: number }) =>
    apiFetch<PaginatedResponse<User>>(`/users/search${buildQuery(params)}`),
}
