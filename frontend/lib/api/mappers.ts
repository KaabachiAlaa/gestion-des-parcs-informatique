/**
 * Couche d'adaptation backend <-> frontend.
 *
 * Le backend FastAPI renvoie des DTO "plats" (identifiants seuls, champs en
 * anglais, statuts en codes). L'UI existante consomme des objets "riches"
 * (relations imbriquées, libellés français). Ce module fait la conversion dans
 * les deux sens afin de préserver l'UI sans la réécrire.
 *
 * NB : le backend n'expose pas la liste exhaustive des valeurs de statut. Les
 * tables ci-dessous couvrent les codes courants ; toute valeur inconnue est
 * affichée telle quelle (humanisée) sans casser l'interface.
 */

import type {
  Category,
  Location,
  Material,
  MaterialCreateInput,
  MaterialStatus,
  MaterialUpdateInput,
  Repair,
  RepairCreateInput,
  RepairStatus,
  RepairUpdateInput,
  RequestCreateInput,
  RequestPriority,
  RequestStatus,
  RequestType,
  Role,
  RoleName,
  SupportRequest,
  User,
  UserUpdateInput,
} from "@/types"

/* ------------------------------------------------------------------ */
/* DTO backend (forme exacte des réponses FastAPI)                     */
/* ------------------------------------------------------------------ */

export interface RoleDTO {
  id: number
  name: string
  description?: string | null
}

export interface CategoryDTO {
  id: number
  name: string
  description?: string | null
}

export interface LocationDTO {
  id: number
  place: string
  description?: string | null
}

export interface UserDTO {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  role_id: number
  is_active: boolean
}

export interface MaterialDTO {
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

export interface RepairDTO {
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

export interface RequestDTO {
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
/* Tables de correspondance de valeurs (codes <-> libellés français)   */
/* ------------------------------------------------------------------ */

function humanize(code: string): string {
  if (!code) return "—"
  const s = code.replace(/_/g, " ").toLowerCase()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Convertit un code backend en libellé via une table, avec repli humanisé. */
function decode<T extends string>(map: Record<string, T>, code: string): T {
  const key = (code ?? "").toUpperCase()
  return (map[key] ?? (humanize(code) as T)) as T
}

/** Convertit un libellé français en code backend, avec repli identité. */
function encode(map: Record<string, string>, label: string): string {
  return map[label] ?? label
}

const MATERIAL_STATUS_DECODE: Record<string, MaterialStatus> = {
  IN_SERVICE: "En service",
  ACTIVE: "En service",
  IN_STOCK: "En stock",
  STOCK: "En stock",
  IN_REPAIR: "En réparation",
  REPAIRING: "En réparation",
  OUT_OF_SERVICE: "En panne",
  BROKEN: "En panne",
  DAMAGED: "En panne",
  FAULTY: "En panne",
  RETIRED: "Réformé",
  REFORMED: "Réformé",
  DISPOSED: "Réformé",
  SCRAPPED: "Réformé",
}

const MATERIAL_STATUS_ENCODE: Record<string, string> = {
  "En service": "IN_SERVICE",
  "En stock": "IN_STOCK",
  "En réparation": "IN_REPAIR",
  "En panne": "OUT_OF_SERVICE",
  "Réformé": "RETIRED",
}

const REPAIR_STATUS_DECODE: Record<string, RepairStatus> = {
  OPEN: "Ouverte",
  IN_PROGRESS: "En cours",
  ONGOING: "En cours",
  PENDING: "En attente",
  ON_HOLD: "En attente",
  WAITING: "En attente",
  RESOLVED: "Résolue",
  DONE: "Résolue",
  COMPLETED: "Résolue",
  CLOSED: "Résolue",
  CANCELLED: "Annulée",
  CANCELED: "Annulée",
}

const REPAIR_STATUS_ENCODE: Record<string, string> = {
  Ouverte: "OPEN",
  "En cours": "IN_PROGRESS",
  "En attente": "PENDING",
  "Résolue": "RESOLVED",
  "Annulée": "CANCELLED",
}

const REQUEST_TYPE_DECODE: Record<string, RequestType> = {
  SUPPORT: "Support",
  INTERVENTION: "Intervention",
  PURCHASE: "Achat",
  ACHAT: "Achat",
  BUY: "Achat",
}

const REQUEST_TYPE_ENCODE: Record<string, string> = {
  Support: "SUPPORT",
  Intervention: "INTERVENTION",
  Achat: "PURCHASE",
}

const REQUEST_STATUS_DECODE: Record<string, RequestStatus> = {
  OPEN: "Nouvelle",
  NEW: "Nouvelle",
  IN_PROGRESS: "En traitement",
  PROCESSING: "En traitement",
  APPROVED: "Approuvée",
  REJECTED: "Rejetée",
  CLOSED: "Clôturée",
  DONE: "Clôturée",
  RESOLVED: "Clôturée",
}

const REQUEST_STATUS_ENCODE: Record<string, string> = {
  Nouvelle: "OPEN",
  "En traitement": "IN_PROGRESS",
  "Approuvée": "APPROVED",
  "Rejetée": "REJECTED",
  "Clôturée": "CLOSED",
}

const PRIORITY_DECODE: Record<string, RequestPriority> = {
  LOW: "Basse",
  MEDIUM: "Normale",
  NORMAL: "Normale",
  HIGH: "Haute",
  URGENT: "Urgente",
  CRITICAL: "Urgente",
}

const PRIORITY_ENCODE: Record<string, string> = {
  Basse: "LOW",
  Normale: "MEDIUM",
  Haute: "HIGH",
  Urgente: "URGENT",
}

export const materialStatusToFr = (c: string) =>
  decode(MATERIAL_STATUS_DECODE, c)
export const materialStatusToCode = (l: string) =>
  encode(MATERIAL_STATUS_ENCODE, l)
export const repairStatusToFr = (c: string) => decode(REPAIR_STATUS_DECODE, c)
export const repairStatusToCode = (l: string) =>
  encode(REPAIR_STATUS_ENCODE, l)
export const requestTypeToFr = (c: string) => decode(REQUEST_TYPE_DECODE, c)
export const requestTypeToCode = (l: string) => encode(REQUEST_TYPE_ENCODE, l)
export const requestStatusToFr = (c: string) =>
  decode(REQUEST_STATUS_DECODE, c)
export const requestStatusToCode = (l: string) =>
  encode(REQUEST_STATUS_ENCODE, l)
export const priorityToFr = (c: string) => decode(PRIORITY_DECODE, c)
export const priorityToCode = (l: string) => encode(PRIORITY_ENCODE, l)

/* ------------------------------------------------------------------ */
/* Référentiels partagés pour l'hydratation                            */
/* ------------------------------------------------------------------ */

export interface RefMaps {
  categories: Map<number, Category>
  locations: Map<number, Location>
  users: Map<number, User>
  materials: Map<number, Pick<Material, "id" | "inventory_number" | "name">>
}

export function emptyRefMaps(): RefMaps {
  return {
    categories: new Map(),
    locations: new Map(),
    users: new Map(),
    materials: new Map(),
  }
}

/* ------------------------------------------------------------------ */
/* Lecture : DTO backend -> objet riche frontend                       */
/* ------------------------------------------------------------------ */

export function toRole(dto: RoleDTO): Role {
  return {
    id: dto.id,
    name: dto.name as RoleName,
    description: dto.description ?? null,
  }
}

export function toCategory(dto: CategoryDTO): Category {
  return { id: dto.id, name: dto.name, description: dto.description ?? null }
}

export function toLocation(dto: LocationDTO): Location {
  return {
    id: dto.id,
    name: dto.place,
    building: null,
    floor: null,
    room: dto.description ?? null,
  }
}

export function toUser(dto: UserDTO, roles: Map<number, Role>): User {
  const role: Role =
    roles.get(dto.role_id) ??
    ({ id: dto.role_id, name: "Consultant", description: null } as Role)
  const fullName = `${dto.first_name ?? ""} ${dto.last_name ?? ""}`.trim()
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    full_name: fullName || dto.username,
    first_name: dto.first_name,
    last_name: dto.last_name,
    is_active: dto.is_active,
    role,
    created_at: null,
  }
}

export function toMaterial(dto: MaterialDTO, ref: RefMaps): Material {
  const category: Category =
    ref.categories.get(dto.category_id) ??
    ({ id: dto.category_id, name: `Catégorie #${dto.category_id}` } as Category)
  const location =
    dto.location_id != null ? (ref.locations.get(dto.location_id) ?? null) : null
  const assigned =
    dto.assigned_user_id != null
      ? (ref.users.get(dto.assigned_user_id) ?? null)
      : null
  return {
    id: dto.id,
    inventory_number: dto.asset_code,
    name: dto.name,
    brand: dto.brand ?? null,
    model: dto.model ?? null,
    serial_number: dto.serial_number ?? null,
    status: materialStatusToFr(dto.status),
    category,
    location,
    assigned_to: assigned,
    purchase_date: dto.acquisition_date ?? null,
    warranty_end: dto.warranty_end_date ?? null,
    purchase_price: dto.purchase_price ?? null,
    notes: dto.description ?? null,
    created_at: null,
  }
}

export function toRepair(dto: RepairDTO, ref: RefMaps): Repair {
  const material =
    ref.materials.get(dto.material_id) ??
    ({
      id: dto.material_id,
      inventory_number: `#${dto.material_id}`,
      name: `Matériel #${dto.material_id}`,
    } as Pick<Material, "id" | "inventory_number" | "name">)
  const technician =
    dto.technician_id != null
      ? (() => {
          const u = ref.users.get(dto.technician_id!)
          return u
            ? { id: u.id, full_name: u.full_name }
            : { id: dto.technician_id!, full_name: `Technicien #${dto.technician_id}` }
        })()
      : null
  return {
    id: dto.id,
    material,
    description: dto.problem_description,
    status: repairStatusToFr(dto.status),
    technician,
    reported_by: null,
    reported_at: dto.start_date,
    resolved_at: dto.end_date ?? null,
    resolution: dto.intervention ?? dto.diagnosis ?? null,
    cost: dto.cost ?? null,
  }
}

export function toRequest(dto: RequestDTO, ref: RefMaps): SupportRequest {
  const requester = ref.users.get(dto.created_by)
  const material =
    dto.material_id != null ? (ref.materials.get(dto.material_id) ?? null) : null
  return {
    id: dto.id,
    request_code: dto.request_code,
    type: requestTypeToFr(dto.type),
    title: dto.title,
    description: dto.description ?? "",
    status: requestStatusToFr(dto.status),
    priority: priorityToFr(dto.priority),
    requested_by: requester
      ? { id: requester.id, full_name: requester.full_name }
      : { id: dto.created_by, full_name: `Utilisateur #${dto.created_by}` },
    material,
    created_at: null,
    closed_at: dto.closed_at ?? null,
    updated_at: null,
  }
}

/* ------------------------------------------------------------------ */
/* Écriture : entrée formulaire frontend -> corps backend              */
/* ------------------------------------------------------------------ */

function cleanDate(v?: string | null): string | null {
  return v && v.trim() !== "" ? v : null
}

function cleanStr(v?: string | null): string | null {
  return v && v.trim() !== "" ? v : null
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function materialCreateToDTO(
  input: MaterialCreateInput,
): Record<string, unknown> {
  return {
    asset_code: input.inventory_number,
    name: input.name,
    category_id: input.category_id,
    brand: cleanStr(input.brand),
    model: cleanStr(input.model),
    serial_number: cleanStr(input.serial_number),
    acquisition_date: cleanDate(input.purchase_date),
    warranty_end_date: cleanDate(input.warranty_end),
    status: materialStatusToCode(input.status as string),
    location_id: input.location_id ?? null,
    assigned_user_id: input.assigned_to_id ?? null,
    description: cleanStr(input.notes),
  }
}

export function materialUpdateToDTO(
  input: MaterialUpdateInput,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (input.name !== undefined) out.name = input.name
  if (input.category_id !== undefined) out.category_id = input.category_id
  if (input.brand !== undefined) out.brand = cleanStr(input.brand)
  if (input.model !== undefined) out.model = cleanStr(input.model)
  if (input.serial_number !== undefined)
    out.serial_number = cleanStr(input.serial_number)
  if (input.purchase_date !== undefined)
    out.acquisition_date = cleanDate(input.purchase_date)
  if (input.warranty_end !== undefined)
    out.warranty_end_date = cleanDate(input.warranty_end)
  if (input.status !== undefined)
    out.status = materialStatusToCode(input.status as string)
  if (input.location_id !== undefined) out.location_id = input.location_id ?? null
  if (input.assigned_to_id !== undefined)
    out.assigned_user_id = input.assigned_to_id ?? null
  if (input.notes !== undefined) out.description = cleanStr(input.notes)
  return out
}

export function repairCreateToDTO(
  input: RepairCreateInput,
): Record<string, unknown> {
  const isResolved = (input.status as string) === "Résolue"
  return {
    material_id: input.material_id,
    technician_id: input.technician_id ?? null,
    start_date: today(),
    end_date: isResolved ? today() : null,
    problem_description: input.description,
    intervention: cleanStr(input.resolution),
    status: repairStatusToCode(input.status as string),
    priority: "MEDIUM",
    cost: input.cost ?? null,
  }
}

export function repairUpdateToDTO(
  input: RepairUpdateInput,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (input.technician_id !== undefined)
    out.technician_id = input.technician_id ?? null
  if (input.status !== undefined) {
    out.status = repairStatusToCode(input.status as string)
    if ((input.status as string) === "Résolue") out.end_date = today()
  }
  if (input.resolution !== undefined)
    out.intervention = cleanStr(input.resolution)
  if (input.cost !== undefined) out.cost = input.cost ?? null
  return out
}

export function requestCreateToDTO(
  input: RequestCreateInput,
  createdBy: number,
): Record<string, unknown> {
  return {
    request_code: `REQ-${Date.now()}`,
    type: requestTypeToCode(input.type as string),
    title: input.title,
    description: cleanStr(input.description),
    created_by: createdBy,
    material_id: input.material_id ?? null,
    priority: priorityToCode(input.priority as string),
    status: "OPEN",
  }
}

export function userUpdateToDTO(
  input: UserUpdateInput,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (input.full_name !== undefined) {
    const { first_name, last_name } = splitFullName(input.full_name)
    out.first_name = first_name
    out.last_name = last_name
  }
  if (input.username !== undefined) out.username = input.username
  if (input.email !== undefined) out.email = input.email
  if (input.role_id !== undefined) out.role_id = input.role_id
  if (input.is_active !== undefined) out.is_active = input.is_active
  // N'envoie le mot de passe que s'il est réellement renseigné.
  if (input.password !== undefined && input.password.trim() !== "")
    out.password = input.password
  return out
}

/** Sépare un nom complet en prénom / nom pour le backend. */
export function splitFullName(fullName: string): {
  first_name: string
  last_name: string
} {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { first_name: parts[0] ?? "", last_name: "" }
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(" "),
  }
}
