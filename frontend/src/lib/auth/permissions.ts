/**
 * Permissions basées sur les rôles (RBAC).
 *
 * Phase actuelle : contrôle purement visuel de la navigation et des actions.
 * L'application réelle de la sécurité sera faite côté API lors de l'intégration.
 */

import type { RoleName } from "@/types"

export type Permission =
  | "materials.read"
  | "materials.write"
  | "materials.delete"
  | "materials.import"
  | "repairs.read"
  | "repairs.write"
  | "users.read"
  | "users.write"
  | "requests.read"
  | "requests.write"
  | "dashboard.read"

const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  Admin: [
    "materials.read",
    "materials.write",
    "materials.delete",
    "materials.import",
    "repairs.read",
    "repairs.write",
    "users.read",
    "users.write",
    "requests.read",
    "requests.write",
    "dashboard.read",
  ],
  Technicien: [
    "materials.read",
    "materials.write",
    "materials.import",
    "repairs.read",
    "repairs.write",
    "requests.read",
    "requests.write",
    "dashboard.read",
  ],
  Consultant: [
    "materials.read",
    "repairs.read",
    "requests.read",
    "dashboard.read",
  ],
}

export function can(role: RoleName | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function roleBadgeVariant(role: RoleName): "primary" | "info" | "muted" {
  switch (role) {
    case "Admin":
      return "primary"
    case "Technicien":
      return "info"
    default:
      return "muted"
  }
}
