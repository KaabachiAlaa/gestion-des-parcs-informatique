import type { LucideIcon } from "lucide-react"
import { Boxes, Wrench, AlertTriangle, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { DashboardStats } from "@/types"

type Tone = "primary" | "warning" | "danger" | "info"

const toneRing: Record<Tone, string> = {
  primary:
    "bg-[color-mix(in_oklch,var(--primary)_12%,transparent)] text-[var(--primary)]",
  warning:
    "bg-[color-mix(in_oklch,var(--warning)_18%,transparent)] text-[color-mix(in_oklch,var(--warning)_55%,var(--foreground))]",
  danger:
    "bg-[color-mix(in_oklch,var(--destructive)_14%,transparent)] text-[var(--destructive)]",
  info: "bg-[color-mix(in_oklch,var(--info)_14%,transparent)] text-[var(--info)]",
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string
  value: number
  icon: LucideIcon
  tone: Tone
  hint: string
}) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            toneRing[tone],
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}

export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Matériels enregistrés"
        value={stats.total_materials}
        icon={Boxes}
        tone="primary"
        hint="Total du parc informatique"
      />
      <StatCard
        label="Réparations en cours"
        value={stats.repairs_in_progress}
        icon={Wrench}
        tone="warning"
        hint="Interventions ouvertes ou en traitement"
      />
      <StatCard
        label="Pannes non résolues"
        value={stats.unresolved_failures}
        icon={AlertTriangle}
        tone="danger"
        hint="Matériels actuellement en panne"
      />
      <StatCard
        label="Utilisateurs actifs"
        value={stats.total_users}
        icon={Users}
        tone="info"
        hint="Comptes ayant accès à la plateforme"
      />
    </div>
  )
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="size-10 rounded-lg" />
          </div>
          <Skeleton className="h-3 w-40" />
        </Card>
      ))}
    </div>
  )
}
