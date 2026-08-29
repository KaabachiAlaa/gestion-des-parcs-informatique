import type { ReactNode } from "react"
import { formatDateTime } from "@/lib/format"

/**
 * En-tête d'impression réutilisable (visible uniquement à l'impression).
 * Utilise les classes globales `.print-only` définies dans globals.css.
 */
export function PrintHeader({
  title,
  subtitle,
  meta,
}: {
  title: string
  subtitle?: string
  meta?: ReactNode
}) {
  return (
    <div className="print-only mb-6 border-b border-black pb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold tracking-tight">COMET</p>
          <p className="text-xs">Gestion de parc informatique</p>
        </div>
        <p className="text-xs">Édité le {formatDateTime(new Date())}</p>
      </div>
      <div className="mt-4 space-y-0.5">
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle ? <p className="text-sm">{subtitle}</p> : null}
        {meta ? <div className="mt-1 text-xs">{meta}</div> : null}
      </div>
    </div>
  )
}
