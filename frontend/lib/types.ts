// Types mapped 1:1 from the FastAPI backend schemas.

export type RoleName = 'Admin' | 'Technicien' | 'Consultant'

export interface Role {
  id: number
  name: string
  description?: string | null
}

export interface Category {
  id: number
  name: string
  description?: string | null
}

export interface Location {
  id: number
  place: string
  description?: string | null
}

export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  role_id: number
  is_active: boolean
}

export interface UserCreate {
  username: string
  first_name: string
  last_name: string
  email: string
  role_id: number
  password: string
}

// Material statuses used across the UI (backend stores a free string).
export const MATERIAL_STATUSES = [
  'IN_SERVICE',
  'IN_REPAIR',
  'IN_STOCK',
  'OUT_OF_SERVICE',
  'RETIRED',
] as const
export type MaterialStatus = (typeof MATERIAL_STATUSES)[number] | string

export interface Material {
  id: number
  asset_code: string
  name: string
  category_id: number
  brand?: string | null
  model?: string | null
  serial_number?: string | null
  acquisition_date?: string | null
  warranty_end_date?: string | null
  status: MaterialStatus
  location_id?: number | null
  assigned_user_id?: number | null
  purchase_price?: number | null
  description?: string | null
}

export type MaterialCreate = Omit<Material, 'id'>
export type MaterialUpdate = Partial<Omit<Material, 'id' | 'asset_code'>>

export const REPAIR_STATUSES = [
  'IN_PROGRESS',
  'PENDING',
  'COMPLETED',
  'CANCELLED',
] as const
export type RepairStatus = (typeof REPAIR_STATUSES)[number] | string

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
export type Priority = (typeof PRIORITIES)[number] | string

export interface Repair {
  id: number
  material_id: number
  technician_id?: number | null
  start_date: string
  end_date?: string | null
  problem_description: string
  diagnosis?: string | null
  intervention?: string | null
  status: RepairStatus
  priority: Priority
  replaced_parts?: string | null
  cost?: number | null
  comments?: string | null
}

export type RepairCreate = Omit<Repair, 'id'>
export type RepairUpdate = Partial<Omit<Repair, 'id' | 'material_id' | 'start_date' | 'problem_description'>> & {
  problem_description?: string
}

export const REQUEST_TYPES = ['SUPPORT', 'INTERVENTION', 'PURCHASE'] as const
export type RequestType = (typeof REQUEST_TYPES)[number] | string

export const REQUEST_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number] | string

export interface SupportRequest {
  id: number
  request_code: string
  type: RequestType
  title: string
  description?: string | null
  created_by: number
  assigned_to?: number | null
  material_id?: number | null
  priority: Priority
  status: RequestStatus
  closed_at?: string | null
}

export type SupportRequestCreate = Omit<SupportRequest, 'id'>

export interface TokenResponse {
  access_token: string
  token_type: string
}
