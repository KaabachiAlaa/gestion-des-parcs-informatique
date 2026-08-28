import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value?: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatCurrency(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") return "—"
  const n = typeof value === "string" ? Number.parseFloat(value) : value
  if (Number.isNaN(n)) return "—"
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "TND",
    maximumFractionDigits: 2,
  }).format(n)
}

export function initials(first?: string, last?: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"
}
