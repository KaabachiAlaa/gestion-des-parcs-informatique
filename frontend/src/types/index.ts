/**
 * Types du domaine — alignés sur les schémas Pydantic du backend FastAPI (/app/schemas).
 * Ces types servent de contrat pour l'intégration future de l'API REST.
 */

/* ------------------------------------------------------------------ */
/* Réponses génériques                                                 */
/* ------------------------------------------------------------------ */

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  total_pages: number
}

/* ------------------------------------------------------------------ */
/* Rôles & Utilisateurs                                                */
/* ------------------------------------------------------------------ */

/**
 * Nom de rôle tel que renvoyé par le backend FastAPI (table `roles`).
 * Le backend utilise ces libellés exacts dans `require_role(...)`.
 */
export type RoleName = "Admin" | "Technicien" | "Consultant"

export interface Role {
  id: number
  name: RoleName
  description?: string | null
}

export interface User {
  id: number
  username: string
  email: string
  /** Composé côté client à partir de first_name + last_name du backend. */
  full_name: string
  first_name?: string
  last_name?: string
  is_active: boolean
  role: Role
  /** Le backend ne renvoie pas de date de création pour les utilisateurs. */
  created_at?: string | null
}

export interface UserCreateInput {
  username: string
  email: string
  full_name: string
  password: string
  role_id: number
  is_active: boolean
}

export type UserUpdateInput = Partial<Omit<UserCreateInput, "password">> & {
  password?: string
}

/* ------------------------------------------------------------------ */
/* Localisations & Catégories                                          */
/* ------------------------------------------------------------------ */

export interface Location {
  id: number
  name: string
  building?: string | null
  floor?: string | null
  room?: string | null
}

export interface Category {
  id: number
  name: string
  description?: string | null
}

/* ------------------------------------------------------------------ */
/* Matériels                                                           */
/* ------------------------------------------------------------------ */

export type MaterialStatus =
  | "En service"
  | "En panne"
  | "En réparation"
  | "En stock"
  | "Réformé"

export interface Material {
  id: number
  inventory_number: string
  name: string
  brand?: string | null
  model?: string | null
  serial_number?: string | null
  status: MaterialStatus
  category: Category
  location: Location | null
  assigned_to?: User | null
  purchase_date?: string | null
  warranty_end?: string | null
  purchase_price?: number | null
  notes?: string | null
  /** Le backend ne renvoie pas de date de création pour les matériels. */
  created_at?: string | null
}

export interface MaterialCreateInput {
  inventory_number: string
  name: string
  brand?: string
  model?: string
  serial_number?: string
  status: MaterialStatus
  category_id: number
  location_id?: number | null
  assigned_to_id?: number | null
  purchase_date?: string
  warranty_end?: string
  notes?: string
}

export type MaterialUpdateInput = Partial<MaterialCreateInput>

/* ------------------------------------------------------------------ */
/* Réparations & Pannes                                                */
/* ------------------------------------------------------------------ */

export type RepairStatus =
  | "Ouverte"
  | "En cours"
  | "En attente"
  | "Résolue"
  | "Annulée"

export interface Repair {
  id: number
  material: Pick<Material, "id" | "inventory_number" | "name">
  description: string
  status: RepairStatus
  technician?: Pick<User, "id" | "full_name"> | null
  reported_by?: Pick<User, "id" | "full_name"> | null
  reported_at: string
  resolved_at?: string | null
  resolution?: string | null
  cost?: number | null
}

export interface RepairCreateInput {
  material_id: number
  description: string
  status: RepairStatus
  technician_id?: number | null
  resolution?: string
  cost?: number
}

export type RepairUpdateInput = Partial<RepairCreateInput> & {
  resolved_at?: string | null
}

/* ------------------------------------------------------------------ */
/* Demandes                                                            */
/* ------------------------------------------------------------------ */

export type RequestType = "Support" | "Intervention" | "Achat"

export type RequestStatus =
  | "Nouvelle"
  | "En traitement"
  | "Approuvée"
  | "Rejetée"
  | "Clôturée"

export type RequestPriority = "Basse" | "Normale" | "Haute" | "Urgente"

export interface SupportRequest {
  id: number
  request_code?: string
  type: RequestType
  title: string
  description: string
  status: RequestStatus
  priority: RequestPriority
  requested_by: Pick<User, "id" | "full_name">
  material?: Pick<Material, "id" | "inventory_number" | "name"> | null
  /** Le backend ne renvoie pas de date de création pour les demandes. */
  created_at?: string | null
  closed_at?: string | null
  updated_at?: string | null
}

export interface RequestCreateInput {
  type: RequestType
  title: string
  description: string
  priority: RequestPriority
  material_id?: number | null
}

/* ------------------------------------------------------------------ */
/* Authentification                                                    */
/* ------------------------------------------------------------------ */

export interface LoginInput {
  username: string
  password: string
}

export interface AuthToken {
  access_token: string
  token_type: string
}

/* ------------------------------------------------------------------ */
/* Tableau de bord                                                     */
/* ------------------------------------------------------------------ */

export interface DashboardStats {
  total_materials: number
  total_users: number
  repairs_in_progress: number
  unresolved_failures: number
  materials_by_status: { status: MaterialStatus; count: number }[]
  materials_by_category: { category: string; count: number }[]
  repairs_trend: { month: string; ouvertes: number; resolues: number }[]
}
