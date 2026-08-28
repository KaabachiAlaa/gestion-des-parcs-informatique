import type { BadgeProps } from "@/components/ui/badge"

type Variant = NonNullable<BadgeProps["variant"]>

interface LabelMeta {
  label: string
  variant: Variant
}

export const MATERIAL_STATUS: Record<string, LabelMeta> = {
  IN_SERVICE: { label: "En service", variant: "success" },
  IN_REPAIR: { label: "En réparation", variant: "warning" },
  IN_STOCK: { label: "En stock", variant: "secondary" },
  RESERVED: { label: "Réservé", variant: "accent" },
  RETIRED: { label: "Réformé", variant: "outline" },
  LOST: { label: "Perdu", variant: "destructive" },
  BROKEN: { label: "Hors service", variant: "destructive" },
}

export const REPAIR_STATUS: Record<string, LabelMeta> = {
  IN_PROGRESS: { label: "En cours", variant: "warning" },
  PENDING: { label: "En attente", variant: "secondary" },
  DONE: { label: "Terminée", variant: "success" },
  RESOLVED: { label: "Résolue", variant: "success" },
  CANCELLED: { label: "Annulée", variant: "outline" },
}

export const REQUEST_STATUS: Record<string, LabelMeta> = {
  OPEN: { label: "Ouverte", variant: "accent" },
  IN_PROGRESS: { label: "En cours", variant: "warning" },
  PENDING: { label: "En attente", variant: "secondary" },
  CLOSED: { label: "Clôturée", variant: "success" },
  RESOLVED: { label: "Résolue", variant: "success" },
  REJECTED: { label: "Rejetée", variant: "destructive" },
}

export const PRIORITY: Record<string, LabelMeta> = {
  LOW: { label: "Basse", variant: "secondary" },
  MEDIUM: { label: "Moyenne", variant: "accent" },
  HIGH: { label: "Haute", variant: "warning" },
  CRITICAL: { label: "Critique", variant: "destructive" },
  URGENT: { label: "Urgente", variant: "destructive" },
}

export const REQUEST_TYPE: Record<string, string> = {
  SUPPORT: "Support",
  INTERVENTION: "Intervention",
  PURCHASE: "Achat",
  ACHAT: "Achat",
  MAINTENANCE: "Maintenance",
}

export function metaFor(map: Record<string, LabelMeta>, key?: string | null): LabelMeta {
  if (!key) return { label: "—", variant: "outline" }
  return map[key] ?? { label: key, variant: "outline" }
}

export const MATERIAL_STATUS_OPTIONS = Object.entries(MATERIAL_STATUS).map(
  ([value, meta]) => ({ value, label: meta.label }),
)
export const REPAIR_STATUS_OPTIONS = Object.entries(REPAIR_STATUS).map(
  ([value, meta]) => ({ value, label: meta.label }),
)
export const REQUEST_STATUS_OPTIONS = Object.entries(REQUEST_STATUS).map(
  ([value, meta]) => ({ value, label: meta.label }),
)
export const PRIORITY_OPTIONS = Object.entries(PRIORITY).map(
  ([value, meta]) => ({ value, label: meta.label }),
)
export const REQUEST_TYPE_OPTIONS = [
  { value: "SUPPORT", label: "Support" },
  { value: "INTERVENTION", label: "Intervention" },
  { value: "PURCHASE", label: "Achat" },
]
