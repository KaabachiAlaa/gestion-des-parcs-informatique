export type RoleName = "Admin" | "Technicien" | "Consultant"

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

export type MaterialStatus =
  | "IN_SERVICE"
  | "IN_REPAIR"
  | "IN_STOCK"
  | "RETIRED"
  | "LOST"
  | string

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

export type RepairStatus = "IN_PROGRESS" | "DONE" | "CANCELLED" | string
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string

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

export type RequestType = "SUPPORT" | "INTERVENTION" | "PURCHASE" | string
export type RequestStatus = "OPEN" | "IN_PROGRESS" | "CLOSED" | "REJECTED" | string

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
