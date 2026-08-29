import { format, formatDistanceToNow, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value
}

/** Date courte localisée, ex. "12 janv. 2025". */
export function formatDate(value?: string | Date | null): string {
  if (!value) return "—"
  try {
    return format(toDate(value), "d MMM yyyy", { locale: fr })
  } catch {
    return "—"
  }
}

/** Date + heure, ex. "12 janv. 2025 à 09:30". */
export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "—"
  try {
    return format(toDate(value), "d MMM yyyy 'à' HH:mm", { locale: fr })
  } catch {
    return "—"
  }
}

/** Temps relatif, ex. "il y a 3 jours". */
export function formatRelative(value?: string | Date | null): string {
  if (!value) return "—"
  try {
    return formatDistanceToNow(toDate(value), { locale: fr, addSuffix: true })
  } catch {
    return "—"
  }
}

/** Montant en dinars tunisiens. */
export function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value)
}
