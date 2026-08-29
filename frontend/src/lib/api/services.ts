/**
 * Couche services API — branchée sur le backend FastAPI réel.
 *
 * Principes :
 *  - Les listes complètes sont récupérées via les endpoints existants
 *    (`GET /materials/`, `/repairs/`, `/requests/`, ...), puis la recherche,
 *    le filtrage et la pagination sont appliqués côté client (les routes
 *    `/search` du backend sont masquées par les routes `/{id}`).
 *  - Les données de référence (rôles, catégories, localisations, utilisateurs)
 *    sont mises en cache quelques secondes pour reconstituer les objets
 *    imbriqués attendus par l'UI sans multiplier les requêtes.
 *  - Certaines fonctionnalités n'ont volontairement pas d'endpoint backend
 *    (import Excel, modification/(dés)activation d'utilisateur) : elles lèvent
 *    une erreur explicite plutôt que d'appeler une route inexistante.
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
  UserQuery as _UserQuery,
} from "@/types"
import { apiFetch, ApiError, getCurrentUserId } from "./client"
import { API_ROUTES } from "./config"
import {
  mapCategory,
  mapLocation,
  mapMaterial,
  mapRepair,
  mapRequest,
  mapRole,
  mapUser,
  materialStatusToBackend,
  repairStatusToBackend,
  requestPriorityToBackend,
  requestTypeToBackend,
  type BackendCategory,
  type BackendLocation,
  type BackendMaterial,
  type BackendRepair,
  type BackendRequest,
  type BackendRole,
  type BackendUser,
  type MaterialRefs,
  type MaterialSummary,
} from "./mappers"

/* ------------------------------------------------------------------ */
/* Cache des données de référence                                      */
/* ------------------------------------------------------------------ */

const TTL = 8_000

interface CacheEntry<T> {
  at: number
  promise: Promise<T>
}

const cacheStore = new Map<string, CacheEntry<unknown>>()

function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const existing = cacheStore.get(key) as CacheEntry<T> | undefined
  if (existing && Date.now() - existing.at < TTL) return existing.promise
  const promise = loader().catch((err) => {
    cacheStore.delete(key)
    throw err
  })
  cacheStore.set(key, { at: Date.now(), promise })
  return promise
}

/** Vide le cache de référence (après une écriture). */
function clearCache() {
  cacheStore.clear()
}

async function loadRolesMap(): Promise<Map<number, Role>> {
  return cached("roles", async () => {
    const raw = await apiFetch<BackendRole[]>(API_ROUTES.roles.root)
    return new Map(raw.map((r) => [r.id, mapRole(r)]))
  })
}

async function loadCategories(): Promise<Category[]> {
  return cached("categories", async () => {
    const raw = await apiFetch<BackendCategory[]>(API_ROUTES.categories.root)
    return raw.map(mapCategory)
  })
}

async function loadLocations(): Promise<Location[]> {
  return cached("locations", async () => {
    const raw = await apiFetch<BackendLocation[]>(API_ROUTES.locations.root)
    return raw.map(mapLocation)
  })
}

/** Liste des utilisateurs (réservée aux administrateurs côté backend). */
async function loadUsers(): Promise<User[]> {
  return cached("users", async () => {
    const roles = await loadRolesMap()
    try {
      const raw = await apiFetch<BackendUser[]>(API_ROUTES.users.root)
      return raw.map((u) => mapUser(u, roles))
    } catch (err) {
      // Les rôles non-administrateurs ne peuvent pas lister les utilisateurs.
      if (err instanceof ApiError && err.status === 403) return []
      throw err
    }
  })
}

async function loadUsersMap(): Promise<Map<number, User>> {
  const users = await loadUsers()
  return new Map(users.map((u) => [u.id, u]))
}

async function loadMaterialsRaw(): Promise<BackendMaterial[]> {
  return cached("materials", () =>
    apiFetch<BackendMaterial[]>(API_ROUTES.materials.root),
  )
}

async function loadMaterialRefs(): Promise<MaterialRefs> {
  const [categories, locations, users] = await Promise.all([
    loadCategories(),
    loadLocations(),
    loadUsersMap(),
  ])
  return {
    categories: new Map(categories.map((c) => [c.id, c])),
    locations: new Map(locations.map((l) => [l.id, l])),
    users,
  }
}

async function loadMaterialSummaries(): Promise<Map<number, MaterialSummary>> {
  const raw = await loadMaterialsRaw()
  return new Map(
    raw.map((m) => [
      m.id,
      { id: m.id, inventory_number: m.asset_code, name: m.name },
    ]),
  )
}

/* ------------------------------------------------------------------ */
/* Pagination client                                                   */
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

function materialCreatePayload(input: MaterialCreateInput) {
  return {
    asset_code: input.inventory_number,
    name: input.name,
    category_id: input.category_id,
    brand: input.brand || null,
    model: input.model || null,
    serial_number: input.serial_number || null,
    acquisition_date: input.purchase_date || null,
    warranty_end_date: input.warranty_end || null,
    status: materialStatusToBackend(input.status),
    location_id: input.location_id ?? null,
    assigned_user_id: input.assigned_to_id ?? null,
    description: input.notes || null,
  }
}

function materialUpdatePayload(input: MaterialUpdateInput) {
  const payload: Record<string, unknown> = {}
  if (input.name !== undefined) payload.name = input.name
  if (input.category_id !== undefined) payload.category_id = input.category_id
  if (input.brand !== undefined) payload.brand = input.brand || null
  if (input.model !== undefined) payload.model = input.model || null
  if (input.serial_number !== undefined)
    payload.serial_number = input.serial_number || null
  if (input.purchase_date !== undefined)
    payload.acquisition_date = input.purchase_date || null
  if (input.warranty_end !== undefined)
    payload.warranty_end_date = input.warranty_end || null
  if (input.status !== undefined)
    payload.status = materialStatusToBackend(input.status)
  if (input.location_id !== undefined) payload.location_id = input.location_id ?? null
  if (input.assigned_to_id !== undefined)
    payload.assigned_user_id = input.assigned_to_id ?? null
  if (input.notes !== undefined) payload.description = input.notes || null
  return payload
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

    const [raw, refs] = await Promise.all([loadMaterialsRaw(), loadMaterialRefs()])
    let items = raw.map((m) => mapMaterial(m, refs))

    if (q) {
      const term = q.toLowerCase()
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.inventory_number.toLowerCase().includes(term) ||
          (m.serial_number ?? "").toLowerCase().includes(term) ||
          (m.brand ?? "").toLowerCase().includes(term),
      )
    }
    if (status !== "all") items = items.filter((m) => m.status === status)
    if (category_id !== "all")
      items = items.filter((m) => m.category.id === category_id)
    if (location_id !== "all")
      items = items.filter((m) => m.location?.id === location_id)

    items.sort((a, b) => a.inventory_number.localeCompare(b.inventory_number, "fr"))
    return paginate(items, page, limit)
  },

  async getById(id: number): Promise<Material | undefined> {
    try {
      const [raw, refs] = await Promise.all([
        apiFetch<BackendMaterial>(API_ROUTES.materials.byId(id)),
        loadMaterialRefs(),
      ])
      return mapMaterial(raw, refs)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return undefined
      throw err
    }
  },

  async create(input: MaterialCreateInput): Promise<Material> {
    const raw = await apiFetch<BackendMaterial>(API_ROUTES.materials.root, {
      method: "POST",
      body: materialCreatePayload(input),
    })
    clearCache()
    const refs = await loadMaterialRefs()
    return mapMaterial(raw, refs)
  },

  async update(id: number, input: MaterialUpdateInput): Promise<void> {
    await apiFetch(API_ROUTES.materials.byId(id), {
      method: "PUT",
      body: materialUpdatePayload(input),
    })
    clearCache()
  },

  async remove(id: number): Promise<void> {
    await apiFetch(API_ROUTES.materials.byId(id), { method: "DELETE" })
    clearCache()
  },

  async importExcel(_file: File): Promise<{ imported: number }> {
    // Le backend FastAPI n'expose aucun endpoint d'import Excel.
    throw new ApiError(
      "L'import Excel n'est pas disponible : le backend ne fournit pas d'endpoint d'importation.",
      501,
    )
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

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

async function loadRepairsMapped(): Promise<Repair[]> {
  const [raw, materials, users] = await Promise.all([
    apiFetch<BackendRepair[]>(API_ROUTES.repairs.root),
    loadMaterialSummaries(),
    loadUsersMap(),
  ])
  return raw.map((r) => mapRepair(r, { materials, users }))
}

export const repairsService = {
  async search(query: RepairQuery = {}): Promise<PaginatedResponse<Repair>> {
    const { q = "", status = "all", page = 1, limit = 10 } = query
    let items = await loadRepairsMapped()
    items.sort((a, b) => +new Date(b.reported_at) - +new Date(a.reported_at))

    if (q) {
      const term = q.toLowerCase()
      items = items.filter(
        (r) =>
          r.description.toLowerCase().includes(term) ||
          r.material.name.toLowerCase().includes(term) ||
          r.material.inventory_number.toLowerCase().includes(term),
      )
    }
    if (status !== "all") items = items.filter((r) => r.status === status)
    return paginate(items, page, limit)
  },

  async getById(id: number): Promise<Repair | undefined> {
    try {
      const [raw, materials, users] = await Promise.all([
        apiFetch<BackendRepair>(API_ROUTES.repairs.byId(id)),
        loadMaterialSummaries(),
        loadUsersMap(),
      ])
      return mapRepair(raw, { materials, users })
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return undefined
      throw err
    }
  },

  async listByMaterial(materialId: number): Promise<Repair[]> {
    const items = await loadRepairsMapped()
    return items
      .filter((r) => r.material.id === materialId)
      .sort((a, b) => +new Date(b.reported_at) - +new Date(a.reported_at))
  },

  async create(input: RepairCreateInput): Promise<void> {
    const status = input.status
    const payload = {
      material_id: input.material_id,
      technician_id: input.technician_id ?? null,
      start_date: today(),
      end_date: status === "Résolue" ? today() : null,
      problem_description: input.description,
      intervention: input.resolution || null,
      status: repairStatusToBackend(status),
      priority: "MEDIUM",
      cost: input.cost ?? null,
    }
    await apiFetch(API_ROUTES.repairs.root, { method: "POST", body: payload })
    clearCache()
  },

  async update(id: number, input: RepairUpdateInput): Promise<void> {
    const payload: Record<string, unknown> = {}
    if (input.status !== undefined) {
      payload.status = repairStatusToBackend(input.status as RepairStatus)
      if (input.status === "Résolue") payload.end_date = today()
    }
    if (input.technician_id !== undefined)
      payload.technician_id = input.technician_id ?? null
    if (input.resolution !== undefined)
      payload.intervention = input.resolution || null
    if (input.cost !== undefined) payload.cost = input.cost ?? null
    await apiFetch(API_ROUTES.repairs.byId(id), { method: "PUT", body: payload })
    clearCache()
  },
}

/* ------------------------------------------------------------------ */
/* Utilisateurs                                                        */
/* ------------------------------------------------------------------ */

export type UserQuery = _UserQuery

function splitName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/)
  const first_name = parts.shift() ?? ""
  const last_name = parts.join(" ") || first_name
  return { first_name, last_name }
}

export const usersService = {
  async search(query: UserQuery = {}): Promise<PaginatedResponse<User>> {
    const { q = "", role_id = "all", is_active = "all", page = 1, limit = 10 } = query
    let items = await loadUsers()

    if (q) {
      const term = q.toLowerCase()
      items = items.filter(
        (u) =>
          u.full_name.toLowerCase().includes(term) ||
          u.username.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      )
    }
    if (role_id !== "all") items = items.filter((u) => u.role.id === role_id)
    if (is_active !== "all")
      items = items.filter((u) => (is_active === "active" ? u.is_active : !u.is_active))
    return paginate(items, page, limit)
  },

  async getById(id: number): Promise<User | undefined> {
    try {
      const [raw, roles] = await Promise.all([
        apiFetch<BackendUser>(API_ROUTES.users.byId(id)),
        loadRolesMap(),
      ])
      return mapUser(raw, roles)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return undefined
      throw err
    }
  },

  async create(input: UserCreateInput): Promise<void> {
    const { first_name, last_name } = splitName(input.full_name)
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
    clearCache()
  },

  async update(): Promise<void> {
    // Le backend n'expose pas de route de modification d'utilisateur (PUT).
    throw new ApiError(
      "La modification d'un utilisateur n'est pas disponible : le backend ne fournit pas d'endpoint de mise à jour.",
      501,
    )
  },

  async toggleActive(): Promise<void> {
    // Aucun endpoint d'activation/désactivation n'existe côté backend.
    throw new ApiError(
      "L'activation/désactivation d'un compte n'est pas disponible : le backend ne fournit pas d'endpoint correspondant.",
      501,
    )
  },

  async remove(id: number): Promise<void> {
    await apiFetch(API_ROUTES.users.byId(id), { method: "DELETE" })
    clearCache()
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

async function loadRequestsMapped(): Promise<SupportRequest[]> {
  const [raw, materials, users] = await Promise.all([
    apiFetch<BackendRequest[]>(API_ROUTES.requests.root),
    loadMaterialSummaries(),
    loadUsersMap(),
  ])
  return raw.map((r) => mapRequest(r, { materials, users }))
}

export const requestsService = {
  async search(query: RequestQuery = {}): Promise<PaginatedResponse<SupportRequest>> {
    const { q = "", type = "all", status = "all", page = 1, limit = 10 } = query
    let items = await loadRequestsMapped()
    items.sort((a, b) => b.id - a.id)

    if (q) {
      const term = q.toLowerCase()
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term),
      )
    }
    if (type !== "all") items = items.filter((r) => r.type === type)
    if (status !== "all") items = items.filter((r) => r.status === status)
    return paginate(items, page, limit)
  },

  async getById(id: number): Promise<SupportRequest | undefined> {
    try {
      const [raw, materials, users] = await Promise.all([
        apiFetch<BackendRequest>(API_ROUTES.requests.byId(id)),
        loadMaterialSummaries(),
        loadUsersMap(),
      ])
      return mapRequest(raw, { materials, users })
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return undefined
      throw err
    }
  },

  async create(input: RequestCreateInput): Promise<void> {
    const createdBy = getCurrentUserId()
    if (createdBy == null) {
      throw new ApiError(
        "Session invalide. Veuillez vous reconnecter avant de soumettre une demande.",
        401,
      )
    }
    await apiFetch(API_ROUTES.requests.root, {
      method: "POST",
      body: {
        request_code: `REQ-${Date.now()}`,
        type: requestTypeToBackend(input.type),
        title: input.title,
        description: input.description || null,
        created_by: createdBy,
        material_id: input.material_id ?? null,
        priority: requestPriorityToBackend(input.priority),
        status: "OPEN",
      },
    })
    clearCache()
  },
}

/* ------------------------------------------------------------------ */
/* Référentiels                                                        */
/* ------------------------------------------------------------------ */

export const referenceService = {
  async roles(): Promise<Role[]> {
    const map = await loadRolesMap()
    return [...map.values()]
  },
  categories(): Promise<Category[]> {
    return loadCategories()
  },
  locations(): Promise<Location[]> {
    return loadLocations()
  },
}

/* ------------------------------------------------------------------ */
/* Tableau de bord (statistiques calculées à partir des données API)   */
/* ------------------------------------------------------------------ */

const MONTHS_FR = [
  "Janv.",
  "Févr.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
  "Juil.",
  "Août",
  "Sept.",
  "Oct.",
  "Nov.",
  "Déc.",
]

function monthKey(date: string): string | null {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(key: string): string {
  const [, m] = key.split("-")
  return MONTHS_FR[Number(m) - 1] ?? key
}

export const dashboardService = {
  async stats(): Promise<DashboardStats> {
    const [materialsRaw, refs] = await Promise.all([
      loadMaterialsRaw(),
      loadMaterialRefs(),
    ])
    const materials = materialsRaw.map((m) => mapMaterial(m, refs))

    // Utilisateurs actifs (0 si le rôle courant ne peut pas les lister).
    const users = await loadUsers().catch(() => [])
    const totalActiveUsers = users.filter((u) => u.is_active).length

    // Réparations (indisponibles pour le rôle consultant → tableau vide).
    let repairs: Repair[] = []
    try {
      repairs = await loadRepairsMapped()
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 403)) throw err
    }

    const byStatus = new Map<MaterialStatus, number>()
    for (const m of materials)
      byStatus.set(m.status, (byStatus.get(m.status) ?? 0) + 1)

    const byCategory = new Map<string, number>()
    for (const m of materials)
      byCategory.set(m.category.name, (byCategory.get(m.category.name) ?? 0) + 1)

    // Tendance des réparations sur les 6 derniers mois représentés.
    const trend = new Map<string, { ouvertes: number; resolues: number }>()
    for (const r of repairs) {
      const openKey = monthKey(r.reported_at)
      if (openKey) {
        const e = trend.get(openKey) ?? { ouvertes: 0, resolues: 0 }
        e.ouvertes += 1
        trend.set(openKey, e)
      }
      if (r.resolved_at) {
        const resKey = monthKey(r.resolved_at)
        if (resKey) {
          const e = trend.get(resKey) ?? { ouvertes: 0, resolues: 0 }
          e.resolues += 1
          trend.set(resKey, e)
        }
      }
    }
    const repairs_trend = [...trend.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, v]) => ({ month: monthLabel(key), ...v }))

    return {
      total_materials: materials.length,
      total_users: totalActiveUsers,
      repairs_in_progress: repairs.filter(
        (r) => r.status === "En cours" || r.status === "Ouverte",
      ).length,
      unresolved_failures: materials.filter((m) => m.status === "En panne").length,
      materials_by_status: [...byStatus.entries()].map(([status, count]) => ({
        status,
        count,
      })),
      materials_by_category: [...byCategory.entries()].map(([category, count]) => ({
        category,
        count,
      })),
      repairs_trend,
    }
  },
}
