/**
 * Correspondance entre les structures « plates » du backend FastAPI
 * (codes en anglais, identifiants) et les types riches du frontend
 * (libellés en français, objets imbriqués).
 *
 * Les fonctions de mapping sont pures : elles reçoivent en argument les
 * tables de référence (catégories, localisations, utilisateurs, matériels)
 * nécessaires pour reconstituer les objets imbriqués attendus par l'UI.
 */

import type {
  Category,
  Location,
  Material,
  MaterialStatus,
  Repair,
  RepairStatus,
  Role,
  RoleName,
  SupportRequest,
  RequestPriority,
  RequestStatus,
  RequestType,
  User,
} from "@/types"

/* ------------------------------------------------------------------ */
/* DTO backend (voir /app/schemas)                                     */
/* ------------------------------------------------------------------ */

export interface BackendRole {
  id: number
  name: string
  description?: string | null
}

export interface BackendCategory {
  id: number
  name: string
  description?: string | null
}

export interface BackendLocation {
  id: number
  place: string
  description?: string | null
}

export interface BackendUser {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  role_id: number
  is_active: boolean
}

export interface BackendMaterial {
  id: number
  asset_code: string
  name: string
  category_id: number
  brand?: string | null
  model?: string | null
  serial_number?: string | null
  acquisition_date?: string | null
  warranty_end_date?: string | null
  status: string
  location_id?: number | null
  assigned_user_id?: number | null
  purchase_price?: number | null
  description?: string | null
}

export interface BackendRepair {
  id: number
  material_id: number
  technician_id?: number | null
  start_date: string
  end_date?: string | null
  problem_description: string
  diagnosis?: string | null
  intervention?: string | null
  status: string
  priority: string
  replaced_parts?: string | null
  cost?: number | null
  comments?: string | null
}

export interface BackendRequest {
  id: number
  request_code: string
  type: string
  title: string
  description?: string | null
  created_by: number
  assigned_to?: number | null
  material_id?: number | null
  priority: string
  status: string
  closed_at?: string | null
}

/* ------------------------------------------------------------------ */
/* Tables de correspondance des énumérations                           */
/* ------------------------------------------------------------------ */

function norm(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]+/g, "_")
}

/* --- Rôles --- */

const ROLE_TO_FR: Record<string, RoleName> = {
  ADMIN: "Administrateur",
  ADMINISTRATEUR: "Administrateur",
  TECHNICIEN: "Technicien",
  TECHNICIAN: "Technicien",
  CONSULTANT: "Consultant",
  READONLY: "Consultant",
  LECTEUR: "Consultant",
}

/** Nom de rôle backend → libellé français. */
export function mapRoleName(name: string): RoleName {
  return ROLE_TO_FR[norm(name)] ?? "Consultant"
}

/** Libellé français → nom de rôle backend (best effort). */
export function roleNameToBackend(name: RoleName): string {
  switch (name) {
    case "Administrateur":
      return "Admin"
    case "Technicien":
      return "Technicien"
    case "Consultant":
      return "Consultant"
  }
}

/* --- État matériel --- */

const MATERIAL_STATUS_TO_FR: Record<string, MaterialStatus> = {
  IN_SERVICE: "En service",
  ACTIVE: "En service",
  EN_SERVICE: "En service",
  OUT_OF_SERVICE: "En panne",
  BROKEN: "En panne",
  FAULTY: "En panne",
  DOWN: "En panne",
  EN_PANNE: "En panne",
  UNDER_REPAIR: "En réparation",
  IN_REPAIR: "En réparation",
  REPAIR: "En réparation",
  EN_REPARATION: "En réparation",
  IN_STOCK: "En stock",
  STOCK: "En stock",
  STORAGE: "En stock",
  EN_STOCK: "En stock",
  RETIRED: "Réformé",
  DECOMMISSIONED: "Réformé",
  SCRAPPED: "Réformé",
  DISPOSED: "Réformé",
  REFORME: "Réformé",
}

const MATERIAL_STATUS_TO_BACKEND: Record<MaterialStatus, string> = {
  "En service": "IN_SERVICE",
  "En panne": "OUT_OF_SERVICE",
  "En réparation": "UNDER_REPAIR",
  "En stock": "IN_STOCK",
  "Réformé": "RETIRED",
}

export function mapMaterialStatus(status: string): MaterialStatus {
  return MATERIAL_STATUS_TO_FR[norm(status)] ?? "En service"
}

export function materialStatusToBackend(status: MaterialStatus): string {
  return MATERIAL_STATUS_TO_BACKEND[status] ?? "IN_SERVICE"
}

/* --- Statut réparation --- */

const REPAIR_STATUS_TO_FR: Record<string, RepairStatus> = {
  OPEN: "Ouverte",
  OUVERTE: "Ouverte",
  IN_PROGRESS: "En cours",
  EN_COURS: "En cours",
  PENDING: "En attente",
  ON_HOLD: "En attente",
  WAITING: "En attente",
  EN_ATTENTE: "En attente",
  RESOLVED: "Résolue",
  DONE: "Résolue",
  CLOSED: "Résolue",
  COMPLETED: "Résolue",
  RESOLUE: "Résolue",
  CANCELLED: "Annulée",
  CANCELED: "Annulée",
  ANNULEE: "Annulée",
}

const REPAIR_STATUS_TO_BACKEND: Record<RepairStatus, string> = {
  Ouverte: "OPEN",
  "En cours": "IN_PROGRESS",
  "En attente": "PENDING",
  "Résolue": "RESOLVED",
  "Annulée": "CANCELLED",
}

export function mapRepairStatus(status: string): RepairStatus {
  return REPAIR_STATUS_TO_FR[norm(status)] ?? "Ouverte"
}

export function repairStatusToBackend(status: RepairStatus): string {
  return REPAIR_STATUS_TO_BACKEND[status] ?? "OPEN"
}

/** Une réparation est-elle « ouverte » (non résolue et non annulée) ? */
export function isRepairOpen(status: RepairStatus): boolean {
  return status !== "Résolue" && status !== "Annulée"
}

/* --- Type de demande --- */

const REQUEST_TYPE_TO_FR: Record<string, RequestType> = {
  SUPPORT: "Support",
  INTERVENTION: "Intervention",
  PURCHASE: "Achat",
  BUY: "Achat",
  ACHAT: "Achat",
}

const REQUEST_TYPE_TO_BACKEND: Record<RequestType, string> = {
  Support: "SUPPORT",
  Intervention: "INTERVENTION",
  Achat: "PURCHASE",
}

export function mapRequestType(type: string): RequestType {
  return REQUEST_TYPE_TO_FR[norm(type)] ?? "Support"
}

export function requestTypeToBackend(type: RequestType): string {
  return REQUEST_TYPE_TO_BACKEND[type] ?? "SUPPORT"
}

/* --- Priorité de demande --- */

const REQUEST_PRIORITY_TO_FR: Record<string, RequestPriority> = {
  LOW: "Basse",
  BASSE: "Basse",
  MEDIUM: "Normale",
  NORMAL: "Normale",
  NORMALE: "Normale",
  HIGH: "Haute",
  HAUTE: "Haute",
  URGENT: "Urgente",
  CRITICAL: "Urgente",
  URGENTE: "Urgente",
}

const REQUEST_PRIORITY_TO_BACKEND: Record<RequestPriority, string> = {
  Basse: "LOW",
  Normale: "MEDIUM",
  Haute: "HIGH",
  Urgente: "URGENT",
}

export function mapRequestPriority(priority: string): RequestPriority {
  return REQUEST_PRIORITY_TO_FR[norm(priority)] ?? "Normale"
}

export function requestPriorityToBackend(priority: RequestPriority): string {
  return REQUEST_PRIORITY_TO_BACKEND[priority] ?? "MEDIUM"
}

/* --- Statut de demande --- */

const REQUEST_STATUS_TO_FR: Record<string, RequestStatus> = {
  OPEN: "Nouvelle",
  NEW: "Nouvelle",
  NOUVELLE: "Nouvelle",
  IN_PROGRESS: "En traitement",
  PROCESSING: "En traitement",
  EN_TRAITEMENT: "En traitement",
  APPROVED: "Approuvée",
  APPROUVEE: "Approuvée",
  REJECTED: "Rejetée",
  REJETEE: "Rejetée",
  CLOSED: "Clôturée",
  DONE: "Clôturée",
  CLOTUREE: "Clôturée",
}

export function mapRequestStatus(status: string): RequestStatus {
  return REQUEST_STATUS_TO_FR[norm(status)] ?? "Nouvelle"
}

/* ------------------------------------------------------------------ */
/* Mapping des entités                                                 */
/* ------------------------------------------------------------------ */

export function mapCategory(c: BackendCategory): Category {
  return { id: c.id, name: c.name, description: c.description ?? null }
}

export function mapLocation(l: BackendLocation): Location {
  // Le backend ne fournit que `place` et `description`.
  return {
    id: l.id,
    name: l.place,
    building: null,
    floor: null,
    room: l.description ?? null,
  }
}

export function mapRole(r: BackendRole): Role {
  return {
    id: r.id,
    name: mapRoleName(r.name),
    description: r.description ?? null,
  }
}

export function mapUser(u: BackendUser, roles: Map<number, Role>): User {
  const role: Role =
    roles.get(u.role_id) ?? { id: u.role_id, name: "Consultant", description: null }
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    full_name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.username,
    is_active: u.is_active,
    role,
    created_at: "",
  }
}

export interface MaterialRefs {
  categories: Map<number, Category>
  locations: Map<number, Location>
  users: Map<number, User>
}

export function mapMaterial(m: BackendMaterial, refs: MaterialRefs): Material {
  const category =
    refs.categories.get(m.category_id) ??
    ({ id: m.category_id, name: "—", description: null } as Category)
  const location =
    m.location_id != null ? (refs.locations.get(m.location_id) ?? null) : null
  const assigned =
    m.assigned_user_id != null ? (refs.users.get(m.assigned_user_id) ?? null) : null

  return {
    id: m.id,
    inventory_number: m.asset_code,
    name: m.name,
    brand: m.brand ?? null,
    model: m.model ?? null,
    serial_number: m.serial_number ?? null,
    status: mapMaterialStatus(m.status),
    category,
    location,
    assigned_to: assigned,
    purchase_date: m.acquisition_date ?? null,
    warranty_end: m.warranty_end_date ?? null,
    notes: m.description ?? null,
    created_at: "",
  }
}

export type MaterialSummary = Pick<Material, "id" | "inventory_number" | "name">

export interface RepairRefs {
  materials: Map<number, MaterialSummary>
  users: Map<number, User>
}

function userSummary(
  id: number | null | undefined,
  users: Map<number, User>,
): { id: number; full_name: string } | null {
  if (id == null) return null
  const u = users.get(id)
  return { id, full_name: u ? u.full_name : `Utilisateur #${id}` }
}

export function mapRepair(r: BackendRepair, refs: RepairRefs): Repair {
  const material: MaterialSummary =
    refs.materials.get(r.material_id) ??
    ({
      id: r.material_id,
      inventory_number: `#${r.material_id}`,
      name: "Matériel inconnu",
    } as MaterialSummary)

  return {
    id: r.id,
    material,
    description: r.problem_description,
    status: mapRepairStatus(r.status),
    technician: userSummary(r.technician_id, refs.users),
    reported_by: null,
    reported_at: r.start_date,
    resolved_at: r.end_date ?? null,
    resolution: r.intervention ?? r.comments ?? null,
    cost: r.cost ?? null,
  }
}

export interface RequestRefs {
  materials: Map<number, MaterialSummary>
  users: Map<number, User>
}

export function mapRequest(r: BackendRequest, refs: RequestRefs): SupportRequest {
  const material =
    r.material_id != null ? (refs.materials.get(r.material_id) ?? null) : null
  const requester = userSummary(r.created_by, refs.users) ?? {
    id: r.created_by,
    full_name: `Utilisateur #${r.created_by}`,
  }

  return {
    id: r.id,
    type: mapRequestType(r.type),
    title: r.title,
    description: r.description ?? "",
    status: mapRequestStatus(r.status),
    priority: mapRequestPriority(r.priority),
    requested_by: requester,
    material,
    created_at: "",
    updated_at: r.closed_at ?? null,
  }
}
