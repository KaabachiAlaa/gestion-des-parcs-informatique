// Types mirroring the FastAPI backend Pydantic schemas (app/schemas/*.py).
// Kept 1:1 with the backend shapes so the mock API layer can be swapped for
// real fetch calls later with minimal changes.

export type Role = "Admin" | "Technicien" | "Consultant";

export interface RoleRecord {
  id: number;
  name: Role;
  description: string;
}

export interface Location {
  id: number;
  name: string;
  building?: string | null;
  floor?: string | null;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  avatar_url?: string | null;
}

export type MaterialStatus =
  | "EN_SERVICE"
  | "EN_PANNE"
  | "EN_REPARATION"
  | "EN_STOCK"
  | "HORS_SERVICE";

export interface Material {
  id: number;
  asset_code: string;
  name: string;
  category: Category;
  brand: string;
  model: string;
  serial_number: string;
  status: MaterialStatus;
  location: Location;
  assigned_user?: User | null;
  acquisition_date: string;
  warranty_end_date?: string | null;
  purchase_price?: number | null;
  description?: string | null;
}

export type RepairStatus = "OUVERTE" | "EN_COURS" | "RESOLUE" | "ANNULEE";
export type RepairPriority = "BASSE" | "NORMALE" | "HAUTE" | "CRITIQUE";

export interface Repair {
  id: number;
  material: Material;
  description: string;
  diagnosis?: string | null;
  intervention?: string | null;
  replaced_parts?: string | null;
  technician: User;
  status: RepairStatus;
  priority: RepairPriority;
  cost?: number | null;
  comments?: string | null;
  opened_at: string;
  resolved_at?: string | null;
}

export type RequestType = "SUPPORT" | "INTERVENTION" | "ACHAT";
export type RequestStatus = "OUVERTE" | "EN_COURS" | "RESOLUE" | "REJETEE";
export type RequestPriority = "BASSE" | "NORMALE" | "HAUTE" | "CRITIQUE";

export interface ServiceRequest {
  id: number;
  code: string;
  type: RequestType;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  created_by: User;
  assigned_to?: User | null;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  user: User;
}
