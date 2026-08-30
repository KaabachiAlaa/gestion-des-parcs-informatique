/**
 * Couche services API — branchée sur le backend FastAPI.
 *
 * Le backend renvoie des DTO plats et n'expose pas de recherche/pagination
 * serveur fiable (les routes `/search` sont masquées par `/{id}`). On récupère
 * donc les collections via `GET /<ressource>/` puis on hydrate, filtre, trie et
 * pagine côté client. Les libellés/relations sont reconstitués via mappers.ts.
 */

import type {
  Category,
  DashboardStats,
  Location,
  Material,
  MaterialCreateInput,
  MaterialStatus,
  MaterialUpdateInput,
  PaginatedResponse,
  Repair,
  RepairCreateInput,
  RepairStatus,
  RepairUpdateInput,
  Role,
  SupportRequest,
  RequestCreateInput,
  RequestStatus,
  RequestType,
  User,
  UserCreateInput,
  UserUpdateInput,
} from "@/types"
import type { LoginInput } from "@/types"
import {
  apiFetch,
  ApiError,
  clearToken,
  getCurrentUserId,
  setToken,
} from "./client"
import { API_ROUTES } from "./config"
import {
  emptyRefMaps,
  materialCreateToDTO,
  materialUpdateToDTO,
  repairCreateToDTO,
  repairUpdateToDTO,
  requestCreateToDTO,
  splitFullName,
  toCategory,
  toLocation,
  toMaterial,
  toRepair,
  toRequest,
  toRole,
  toUser,
  userUpdateToDTO,
  type CategoryDTO,
  type LocationDTO,
  type MaterialDTO,
  type RefMaps,
  type RepairDTO,
  type RequestDTO,
  type RoleDTO,
  type UserDTO,
} from "./mappers"

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

function paginate<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
  const total = items.length
  const total_pages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(Math.max(1, page), total_pages)
  const start = (safePage - 1) * limit
  return {
    data: items.slice(start, start + limit),
    page: safePage,
    limit,
    total,
    total_pages,
  }
}

/** Exécute une promesse en renvoyant un repli sur 401/403 (accès restreint). */
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p
  } catch (e) {
    if (e instanceof ApiError && (e.status === 403 || e.status === 401)) {
      return fallback
    }
    throw e
  }
}

function matches(term: string, ...fields: (string | null | undefined)[]) {
  const t = term.trim().toLowerCase()
  if (!t) return true
  return fields.some((f) => (f ?? "").toLowerCase().includes(t))
}

/* ------------------------------------------------------------------ */
/* Authentification                                                    */
/* ------------------------------------------------------------------ */

interface TokenResponse {
  access_token: string
  token_type: string
}

export const authService = {
  /** Authentifie l'utilisateur et stocke le token, puis renvoie son profil. */
  async login(input: LoginInput): Promise<User> {
    const res = await apiFetch<TokenResponse>(API_ROUTES.auth.login, {
      method: "POST",
      auth: false,
      body: { username: input.username, password: input.password },
    })
    if (!res?.access_token) {
      throw new ApiError(500, "Réponse d'authentification invalide.")
    }
    setToken(res.access_token)
    try {
      return await authService.me()
    } catch (e) {
      // Si /auth/me échoue, on évite de laisser un token orphelin.
      clearToken()
      throw e
    }
  },

  /** Profil de l'utilisateur courant (résout le nom du rôle via /roles). */
  async me(): Promise<User> {
    const roles = await loadRolesMap()
    const dto = await apiFetch<UserDTO>(API_ROUTES.auth.me)
    return toUser(dto, roles)
  },

  logout() {
    clearToken()
  },
}

/* ------------------------------------------------------------------ */
/* Chargement des référentiels                                         */
/* ------------------------------------------------------------------ */

async function loadRolesMap(): Promise<Map<number, Role>> {
  const dtos = await safe(apiFetch<RoleDTO[]>(API_ROUTES.roles.root), [])
  return new Map(dtos.map((d) => [d.id, toRole(d)]))
}

async function loadCategories(): Promise<Category[]> {
  const dtos = await safe(apiFetch<CategoryDTO[]>(API_ROUTES.categories.root), [])
  return dtos.map(toCategory)
}

async function loadLocations(): Promise<Location[]> {
  const dtos = await safe(apiFetch<LocationDTO[]>(API_ROUTES.locations.root), [])
  return dtos.map(toLocation)
}

/** Liste des utilisateurs (réservée aux admins) — repli [] sinon. */
async function loadUsers(): Promise<User[]> {
  const roles = await loadRolesMap()
  const dtos = await safe(apiFetch<UserDTO[]>(API_ROUTES.users.root), [])
  return dtos.map((d) => toUser(d, roles))
}

/** Carte minimale des matériels (id -> code/nom) pour les relations. */
async function loadMaterialsMini(): Promise<
  Map<number, Pick<Material, "id" | "inventory_number" | "name">>
> {
  const dtos = await safe(apiFetch<MaterialDTO[]>(API_ROUTES.materials.root), [])
  return new Map(
    dtos.map((d) => [
      d.id,
      { id: d.id, inventory_number: d.asset_code, name: d.name },
    ]),
  )
}

/* ------------------------------------------------------------------ */
/* Matériels                                                           */
/* ------------------------------------------------------------------ */

export interface MaterialQuery {
  q?: string
  status?: MaterialStatus | "all"
  category_id?: number | "all"
  location_id?: number | "all"
  page?: number
  limit?: number
}

async function loadMaterialRefs(): Promise<RefMaps> {
  const ref = emptyRefMaps()
  const [cats, locs, users] = await Promise.all([
    loadCategories(),
    loadLocations(),
    loadUsers(),
  ])
  cats.forEach((c) => ref.categories.set(c.id, c))
  locs.forEach((l) => ref.locations.set(l.id, l))
  users.forEach((u) => ref.users.set(u.id, u))
  return ref
}

async function fetchAllMaterials(): Promise<Material[]> {
  const [dtos, ref] = await Promise.all([
    apiFetch<MaterialDTO[]>(API_ROUTES.materials.root),
    loadMaterialRefs(),
  ])
  return dtos.map((d) => toMaterial(d, ref))
}

export const materialsService = {
  async search(query: MaterialQuery = {}): Promise<PaginatedResponse<Material>> {
    const {
      q = "",
      status = "all",
      category_id = "all",
      location_id = "all",
      page = 1,
      limit = 10,
    } = query
    let items = await fetchAllMaterials()
    if (q)
      items = items.filter((m) =>
        matches(q, m.name, m.inventory_number, m.serial_number, m.brand),
      )
    if (status !== "all") items = items.filter((m) => m.status === status)
    if (category_id !== "all")
      items = items.filter((m) => m.category.id === category_id)
    if (location_id !== "all")
      items = items.filter((m) => m.location?.id === location_id)
    return paginate(items, page, limit)
  },

  async getById(id: number): Promise<Material | undefined> {
    const [dto, ref] = await Promise.all([
      safe(apiFetch<MaterialDTO | undefined>(API_ROUTES.materials.byId(id)), undefined),
      loadMaterialRefs(),
    ])
    return dto ? toMaterial(dto, ref) : undefined
  },

  async create(input: MaterialCreateInput): Promise<void> {
    await apiFetch(API_ROUTES.materials.root, {
      method: "POST",
      body: materialCreateToDTO(input),
    })
  },

  async update(id: number, input: MaterialUpdateInput): Promise<void> {
    await apiFetch(API_ROUTES.materials.byId(id), {
      method: "PUT",
      body: materialUpdateToDTO(input),
    })
  },

  async remove(id: number): Promise<void> {
    await apiFetch(API_ROUTES.materials.byId(id), { method: "DELETE" })
  },

  async importExcel(file: File): Promise<{ imported: number }> {
    const form = new FormData()
    form.append("file", file)
    const res = await apiFetch<{ message?: string; count?: number }>(
      API_ROUTES.materials.importExcel,
      { method: "POST", body: form, raw: true },
    )
    return { imported: res?.count ?? 0 }
  },
}

/* ------------------------------------------------------------------ */
/* Réparations                                                         */
/* ------------------------------------------------------------------ */

export interface RepairQuery {
  q?: string
  status?: RepairStatus | "all"
  page?: number
  limit?: number
}

async function loadRepairRefs(): Promise<RefMaps> {
  const ref = emptyRefMaps()
  const [users, materials] = await Promise.all([loadUsers(), loadMaterialsMini()])
  users.forEach((u) => ref.users.set(u.id, u))
  ref.materials = materials
  return ref
}

async function fetchAllRepairs(): Promise<Repair[]> {
  const [dtos, ref] = await Promise.all([
    apiFetch<RepairDTO[]>(API_ROUTES.repairs.root),
    loadRepairRefs(),
  ])
  return dtos
    .map((d) => toRepair(d, ref))
    .sort((a, b) => +new Date(b.reported_at) - +new Date(a.reported_at))
}

export const repairsService = {
  async search(query: RepairQuery = {}): Promise<PaginatedResponse<Repair>> {
    const { q = "", status = "all", page = 1, limit = 10 } = query
    let items = await fetchAllRepairs()
    if (q)
      items = items.filter((r) =>
        matches(q, r.description, r.material.name, r.material.inventory_number),
      )
    if (status !== "all") items = items.filter((r) => r.status === status)
    return paginate(items, page, limit)
  },

  async getById(id: number): Promise<Repair | undefined> {
    const [dto, ref] = await Promise.all([
      safe(apiFetch<RepairDTO | undefined>(API_ROUTES.repairs.byId(id)), undefined),
      loadRepairRefs(),
    ])
    return dto ? toRepair(dto, ref) : undefined
  },

  async listByMaterial(materialId: number): Promise<Repair[]> {
    const items = await safe(fetchAllRepairs(), [])
    return items.filter((r) => r.material.id === materialId)
  },

  async create(input: RepairCreateInput): Promise<void> {
    await apiFetch(API_ROUTES.repairs.root, {
      method: "POST",
      body: repairCreateToDTO(input),
    })
  },

  async update(id: number, input: RepairUpdateInput): Promise<void> {
    await apiFetch(API_ROUTES.repairs.byId(id), {
      method: "PUT",
      body: repairUpdateToDTO(input),
    })
  },
}

/* ------------------------------------------------------------------ */
/* Utilisateurs                                                        */
/* ------------------------------------------------------------------ */

export interface UserQuery {
  q?: string
  role_id?: number | "all"
  is_active?: "all" | "active" | "inactive"
  page?: number
  limit?: number
}

export const usersService = {
  async search(query: UserQuery = {}): Promise<PaginatedResponse<User>> {
    const {
      q = "",
      role_id = "all",
      is_active = "all",
      page = 1,
      limit = 10,
    } = query
    let items = await loadUsers()
    if (q) items = items.filter((u) => matches(q, u.full_name, u.username, u.email))
    if (role_id !== "all") items = items.filter((u) => u.role.id === role_id)
    if (is_active !== "all")
      items = items.filter((u) =>
        is_active === "active" ? u.is_active : !u.is_active,
      )
    return paginate(items, page, limit)
  },

  async getById(id: number): Promise<User | undefined> {
    const roles = await loadRolesMap()
    const dto = await safe(
      apiFetch<UserDTO | undefined>(API_ROUTES.users.byId(id)),
      undefined,
    )
    return dto ? toUser(dto, roles) : undefined
  },

  async create(input: UserCreateInput): Promise<void> {
    const { first_name, last_name } = splitFullName(input.full_name)
    await apiFetch(API_ROUTES.users.root, {
      method: "POST",
      body: {
        username: input.username,
        first_name,
        last_name,
        email: input.email,
        role_id: input.role_id,
        password: input.password,
      },
    })
  },

  async remove(id: number): Promise<void> {
    await apiFetch(API_ROUTES.users.byId(id), { method: "DELETE" })
  },

  /** Met à jour n'importe quel champ de l'utilisateur via PUT /users/{id}. */
  async update(id: number, input: UserUpdateInput): Promise<void> {
    await apiFetch(API_ROUTES.users.byId(id), {
      method: "PUT",
      body: userUpdateToDTO(input),
    })
  },

  /** Active ou désactive un compte (mise à jour partielle de is_active). */
  async toggleActive(id: number, active: boolean): Promise<void> {
    await apiFetch(API_ROUTES.users.byId(id), {
      method: "PUT",
      body: { is_active: active },
    })
  },
}

/* ------------------------------------------------------------------ */
/* Demandes                                                            */
/* ------------------------------------------------------------------ */

export interface RequestQuery {
  q?: string
  type?: RequestType | "all"
  status?: RequestStatus | "all"
  page?: number
  limit?: number
}

async function loadRequestRefs(): Promise<RefMaps> {
  const ref = emptyRefMaps()
  const [users, materials] = await Promise.all([loadUsers(), loadMaterialsMini()])
  users.forEach((u) => ref.users.set(u.id, u))
  ref.materials = materials
  return ref
}

async function fetchAllRequests(): Promise<SupportRequest[]> {
  const [dtos, ref] = await Promise.all([
    apiFetch<RequestDTO[]>(API_ROUTES.requests.root),
    loadRequestRefs(),
  ])
  return dtos.map((d) => toRequest(d, ref)).sort((a, b) => b.id - a.id)
}

export const requestsService = {
  async search(query: RequestQuery = {}): Promise<PaginatedResponse<SupportRequest>> {
    const { q = "", type = "all", status = "all", page = 1, limit = 10 } = query
    let items = await fetchAllRequests()
    if (q) items = items.filter((r) => matches(q, r.title, r.description))
    if (type !== "all") items = items.filter((r) => r.type === type)
    if (status !== "all") items = items.filter((r) => r.status === status)
    return paginate(items, page, limit)
  },

  async getById(id: number): Promise<SupportRequest | undefined> {
    const [dto, ref] = await Promise.all([
      safe(apiFetch<RequestDTO | undefined>(API_ROUTES.requests.byId(id)), undefined),
      loadRequestRefs(),
    ])
    return dto ? toRequest(dto, ref) : undefined
  },

  async create(input: RequestCreateInput): Promise<void> {
    const createdBy = getCurrentUserId()
    if (!createdBy) {
      throw new ApiError(401, "Session invalide. Veuillez vous reconnecter.")
    }
    await apiFetch(API_ROUTES.requests.root, {
      method: "POST",
      body: requestCreateToDTO(input, createdBy),
    })
  },
}

/* ------------------------------------------------------------------ */
/* Référentiels                                                        */
/* ------------------------------------------------------------------ */

export const referenceService = {
  async roles(): Promise<Role[]> {
    const dtos = await safe(apiFetch<RoleDTO[]>(API_ROUTES.roles.root), [])
    return dtos.map(toRole)
  },
  async categories(): Promise<Category[]> {
    return loadCategories()
  },
  async locations(): Promise<Location[]> {
    return loadLocations()
  },
}

/* ------------------------------------------------------------------ */
/* Tableau de bord (calculé à partir des collections existantes)       */
/* ------------------------------------------------------------------ */

const MONTHS_FR = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
]

function monthKey(value?: string | null): string | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(+d)) return null
  return `${d.getFullYear()}-${d.getMonth()}`
}

export const dashboardService = {
  async stats(): Promise<DashboardStats> {
    const [materials, repairs, users] = await Promise.all([
      safe(fetchAllMaterials(), [] as Material[]),
      safe(fetchAllRepairs(), [] as Repair[]),
      safe(loadUsers(), [] as User[]),
    ])

    const byStatus = new Map<MaterialStatus, number>()
    for (const m of materials)
      byStatus.set(m.status, (byStatus.get(m.status) ?? 0) + 1)

    const byCategory = new Map<string, number>()
    for (const m of materials)
      byCategory.set(m.category.name, (byCategory.get(m.category.name) ?? 0) + 1)

    const isOpen = (r: Repair) =>
      r.status === "Ouverte" || r.status === "En cours" || r.status === "En attente"

    // Tendance des réparations sur les 6 derniers mois.
    const now = new Date()
    const buckets: { key: string; label: string; ouvertes: number; resolues: number }[] =
      []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: MONTHS_FR[d.getMonth()],
        ouvertes: 0,
        resolues: 0,
      })
    }
    const bucketByKey = new Map(buckets.map((b) => [b.key, b]))
    for (const r of repairs) {
      const opened = bucketByKey.get(monthKey(r.reported_at) ?? "")
      if (opened) opened.ouvertes += 1
      if (r.status === "Résolue") {
        const resolved = bucketByKey.get(monthKey(r.resolved_at) ?? "")
        if (resolved) resolved.resolues += 1
      }
    }

    return {
      total_materials: materials.length,
      total_users: users.filter((u) => u.is_active).length,
      repairs_in_progress: repairs.filter(isOpen).length,
      unresolved_failures: materials.filter((m) => m.status === "En panne").length,
      materials_by_status: [...byStatus.entries()].map(([status, count]) => ({
        status,
        count,
      })),
      materials_by_category: [...byCategory.entries()].map(([category, count]) => ({
        category,
        count,
      })),
      repairs_trend: buckets.map((b) => ({
        month: b.label,
        ouvertes: b.ouvertes,
        resolues: b.resolues,
      })),
    }
  },
}
