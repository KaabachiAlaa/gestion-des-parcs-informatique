export const MATERIAL_STATUSES = [
  "IN_SERVICE",
  "IN_STOCK",
  "IN_REPAIR",
  "RETIRED",
  "LOST",
] as const

export const MATERIAL_STATUS_LABELS: Record<string, string> = {
  IN_SERVICE: "En service",
  IN_STOCK: "En stock",
  IN_REPAIR: "En réparation",
  RETIRED: "Réformé",
  LOST: "Perdu",
}

// tone maps to StatusBadge tones
export const MATERIAL_STATUS_TONE: Record<string, string> = {
  IN_SERVICE: "success",
  IN_STOCK: "info",
  IN_REPAIR: "warning",
  RETIRED: "muted",
  LOST: "danger",
}

export const REPAIR_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const

export const REPAIR_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
}

export const REPAIR_STATUS_TONE: Record<string, string> = {
  PENDING: "muted",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
}

export const REQUEST_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
] as const

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  OPEN: "Ouverte",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolue",
  CLOSED: "Clôturée",
  REJECTED: "Rejetée",
}

export const REQUEST_STATUS_TONE: Record<string, string> = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "muted",
  REJECTED: "danger",
}

export const REQUEST_TYPES = ["INCIDENT", "SERVICE", "PURCHASE", "OTHER"] as const

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  INCIDENT: "Incident",
  SERVICE: "Service",
  PURCHASE: "Achat",
  OTHER: "Autre",
}

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
}

export const PRIORITY_TONE: Record<string, string> = {
  LOW: "muted",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "danger",
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  technician: "Technicien",
  consultant: "Consultant",
}
