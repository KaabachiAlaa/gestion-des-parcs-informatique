import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground text-pretty max-w-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function TableSkeleton({
  rows = 8,
  cols = 5,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className="h-4"
              style={{ width: c === 0 ? "18%" : `${12 + ((r + c) % 4) * 4}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
