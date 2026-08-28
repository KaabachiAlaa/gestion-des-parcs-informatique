export function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "TND",
    maximumFractionDigits: 2,
  }).format(value)
}

export const materialStatusLabels: Record<string, string> = {
  IN_SERVICE: "En service",
  IN_REPAIR: "En réparation",
  OUT_OF_SERVICE: "Hors service",
  RETIRED: "Retiré",
  IN_STOCK: "En stock",
}

export const materialStatusVariants: Record<string, string> = {
  IN_SERVICE: "success",
  IN_REPAIR: "warning",
  OUT_OF_SERVICE: "destructive",
  RETIRED: "muted",
  IN_STOCK: "secondary",
}

export const repairStatusLabels: Record<string, string> = {
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  PENDING: "En attente",
}

export const repairStatusVariants: Record<string, string> = {
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "muted",
  PENDING: "secondary",
}

export const priorityLabels: Record<string, string> = {
  LOW: "Faible",
  MEDIUM: "Moyenne",
  HIGH: "Élevée",
  CRITICAL: "Critique",
}

export const priorityVariants: Record<string, string> = {
  LOW: "secondary",
  MEDIUM: "warning",
  HIGH: "destructive",
  CRITICAL: "destructive",
}

export const requestTypeLabels: Record<string, string> = {
  SUPPORT: "Support",
  INTERVENTION: "Intervention",
  PURCHASE: "Achat",
}

export const requestStatusLabels: Record<string, string> = {
  OPEN: "Ouverte",
  IN_PROGRESS: "En cours",
  CLOSED: "Clôturée",
  REJECTED: "Rejetée",
}

export const requestStatusVariants: Record<string, string> = {
  OPEN: "secondary",
  IN_PROGRESS: "warning",
  CLOSED: "success",
  REJECTED: "destructive",
}

export function initials(firstName?: string, lastName?: string): string {
  const a = firstName?.[0] ?? ""
  const b = lastName?.[0] ?? ""
  return (a + b).toUpperCase() || "?"
}
