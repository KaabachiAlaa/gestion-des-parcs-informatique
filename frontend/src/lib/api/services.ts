/**
 * Couche services API.
 *
 * Phase actuelle : chaque fonction renvoie des données simulées (mock) via
 * `mockDelay`. Pour brancher le backend FastAPI, remplacer le corps de chaque
 * fonction par l'appel `apiFetch` correspondant (les routes sont déjà définies
 * dans config.ts et les signatures sont stables).
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
import { mockDelay } from "./client"
import {
  categories as mockCategories,
  locations as mockLocations,
  materials as mockMaterials,
  repairs as mockRepairs,
  roles as mockRoles,
  supportRequests as mockRequests,
  users as mockUsers,
} from "@/lib/mock/data"

function paginate<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
  const total = items.length
  const total_pages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  return {
    data: items.slice(start, start + limit),
    page,
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

export const materialsService = {
  async search(query: MaterialQuery = {}): Promise<PaginatedResponse<Material>> {
    await mockDelay()
    const { q = "", status = "all", category_id = "all", location_id = "all", page = 1, limit = 10 } = query
    let items = [...mockMaterials]
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
    if (category_id !== "all") items = items.filter((m) => m.category.id === category_id)
    if (location_id !== "all") items = items.filter((m) => m.location?.id === location_id)
    return paginate(items, page, limit)
  },

  async getById(id: number): Promise<Material | undefined> {
    await mockDelay(300)
    return mockMaterials.find((m) => m.id === id)
  },

  async create(input: MaterialCreateInput): Promise<Material> {
    await mockDelay()
    console.log("[v0] materials.create", input)
    return { ...(mockMaterials[0] as Material), id: Date.now(), ...input } as unknown as Material
  },

  async update(id: number, input: MaterialUpdateInput): Promise<void> {
    await mockDelay()
    console.log("[v0] materials.update", id, input)
  },

  async remove(id: number): Promise<void> {
    await mockDelay()
    console.log("[v0] materials.remove", id)
  },

  async importExcel(file: File): Promise<{ imported: number }> {
    await mockDelay(1200)
    console.log("[v0] materials.importExcel", file.name)
    return { imported: 0 }
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

export const repairsService = {
  async search(query: RepairQuery = {}): Promise<PaginatedResponse<Repair>> {
    await mockDelay()
    const { q = "", status = "all", page = 1, limit = 10 } = query
    let items = [...mockRepairs].sort(
      (a, b) => +new Date(b.reported_at) - +new Date(a.reported_at),
    )
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
    await mockDelay(300)
    return mockRepairs.find((r) => r.id === id)
  },

  async listByMaterial(materialId: number): Promise<Repair[]> {
    await mockDelay(300)
    return mockRepairs
      .filter((r) => r.material.id === materialId)
      .sort((a, b) => +new Date(b.reported_at) - +new Date(a.reported_at))
  },

  async create(input: RepairCreateInput): Promise<void> {
    await mockDelay()
    console.log("[v0] repairs.create", input)
  },

  async update(id: number, input: RepairUpdateInput): Promise<void> {
    await mockDelay()
    console.log("[v0] repairs.update", id, input)
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
    await mockDelay()
    const { q = "", role_id = "all", is_active = "all", page = 1, limit = 10 } = query
    let items = [...mockUsers]
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
    await mockDelay(300)
    return mockUsers.find((u) => u.id === id)
  },

  async create(input: UserCreateInput): Promise<void> {
    await mockDelay()
    console.log("[v0] users.create", input)
  },

  async update(id: number, input: UserUpdateInput): Promise<void> {
    await mockDelay()
    console.log("[v0] users.update", id, input)
  },

  async toggleActive(id: number, active: boolean): Promise<void> {
    await mockDelay(300)
    console.log("[v0] users.toggleActive", id, active)
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

export const requestsService = {
  async search(query: RequestQuery = {}): Promise<PaginatedResponse<SupportRequest>> {
    await mockDelay()
    const { q = "", type = "all", status = "all", page = 1, limit = 10 } = query
    let items = [...mockRequests].sort(
      (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
    )
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
    await mockDelay(300)
    return mockRequests.find((r) => r.id === id)
  },

  async create(input: RequestCreateInput): Promise<void> {
    await mockDelay()
    console.log("[v0] requests.create", input)
  },
}

/* ------------------------------------------------------------------ */
/* Référentiels                                                        */
/* ------------------------------------------------------------------ */

export const referenceService = {
  async roles(): Promise<Role[]> {
    await mockDelay(150)
    return mockRoles
  },
  async categories(): Promise<Category[]> {
    await mockDelay(150)
    return mockCategories
  },
  async locations(): Promise<Location[]> {
    await mockDelay(150)
    return mockLocations
  },
}

/* ------------------------------------------------------------------ */
/* Tableau de bord                                                     */
/* ------------------------------------------------------------------ */

export const dashboardService = {
  async stats(): Promise<DashboardStats> {
    await mockDelay(400)
    const byStatus = new Map<MaterialStatus, number>()
    for (const m of mockMaterials)
      byStatus.set(m.status, (byStatus.get(m.status) ?? 0) + 1)
    const byCategory = new Map<string, number>()
    for (const m of mockMaterials)
      byCategory.set(m.category.name, (byCategory.get(m.category.name) ?? 0) + 1)

    return {
      total_materials: mockMaterials.length,
      total_users: mockUsers.filter((u) => u.is_active).length,
      repairs_in_progress: mockRepairs.filter(
        (r) => r.status === "En cours" || r.status === "Ouverte",
      ).length,
      unresolved_failures: mockMaterials.filter((m) => m.status === "En panne").length,
      materials_by_status: [...byStatus.entries()].map(([status, count]) => ({
        status,
        count,
      })),
      materials_by_category: [...byCategory.entries()].map(([category, count]) => ({
        category,
        count,
      })),
      repairs_trend: [
        { month: "Jan", ouvertes: 8, resolues: 6 },
        { month: "Fév", ouvertes: 6, resolues: 7 },
        { month: "Mar", ouvertes: 10, resolues: 8 },
        { month: "Avr", ouvertes: 7, resolues: 9 },
        { month: "Mai", ouvertes: 12, resolues: 10 },
        { month: "Juin", ouvertes: 9, resolues: 11 },
      ],
    }
  },
}
