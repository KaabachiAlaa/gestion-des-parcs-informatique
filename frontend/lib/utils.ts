import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(value?: number | null): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 3,
  }).format(value)
}

export function initials(first?: string, last?: string): string {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'
}
