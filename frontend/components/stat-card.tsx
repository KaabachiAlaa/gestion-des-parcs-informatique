import type { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  isLoading,
  tone = "primary",
}: {
  label: string
  value: number | string
  icon: LucideIcon
  isLoading?: boolean
  tone?: "primary" | "accent" | "warning" | "destructive"
}) {
  const toneClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-md",
          toneClasses[tone]
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        {isLoading ? (
          <Skeleton className="mt-1 h-6 w-16" />
        ) : (
          <span className="text-2xl font-semibold tabular-nums text-card-foreground">
            {value}
          </span>
        )}
      </div>
    </div>
  )
}
