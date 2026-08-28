"use client"

import useSWR from "swr"
import Link from "next/link"
import { Monitor, Wrench, Inbox, AlertTriangle, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import type { Material, Repair, Request } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useLookups } from "@/lib/lookups"

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  loading,
  accent,
}: {
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  href: string
  loading?: boolean
  accent?: "warning"
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 py-5">
          <div
            className={
              accent === "warning"
                ? "flex size-11 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning"
                : "flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            }
          >
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
            )}
            <p className="truncate text-sm text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  const { role, user } = useAuth()
  const canRepairs = role === "Admin" || role === "Technicien"
  const lookups = useLookups()

  const { data: materials, isLoading: matLoading } = useSWR<Material[]>("/materials/", () =>
    api.get("/materials/"),
  )
  const { data: requests, isLoading: reqLoading } = useSWR<Request[]>("/requests/", () =>
    api.get("/requests/"),
  )
  const { data: repairs, isLoading: repLoading } = useSWR<Repair[]>(
    canRepairs ? "/repairs/" : null,
    () => api.get("/repairs/"),
  )

  const brokenCount = (materials ?? []).filter(
    (m) => m.status && /panne|hors|défect|defect|répar|repar/i.test(m.status),
  ).length
  const pendingRequests = (requests ?? []).filter(
    (r) => r.status && /attente|pending|nouveau|new|en cours/i.test(r.status),
  ).length

  const recentRequests = [...(requests ?? [])].slice(-5).reverse()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour${user?.name ? `, ${user.name}` : ""}`}
        description="Vue d'ensemble de votre parc informatique."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Matériels"
          value={materials?.length ?? 0}
          icon={Monitor}
          href="/materials"
          loading={matLoading}
        />
        <StatCard
          label="Matériels en panne"
          value={brokenCount}
          icon={AlertTriangle}
          href="/materials"
          loading={matLoading}
          accent="warning"
        />
        {canRepairs && (
          <StatCard
            label="Réparations"
            value={repairs?.length ?? 0}
            icon={Wrench}
            href="/repairs"
            loading={repLoading}
          />
        )}
        <StatCard
          label="Demandes en attente"
          value={pendingRequests}
          icon={Inbox}
          href="/requests"
          loading={reqLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Dernières demandes</CardTitle>
            <Link
              href="/requests"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Tout voir <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {reqLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-muted-foreground">Aucune demande.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentRequests.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {r.type || `Demande #${r.id}`}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.description || "—"}
                      </p>
                    </div>
                    {r.status && <StatusBadge status={r.status} />}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des matériels</CardTitle>
          </CardHeader>
          <CardContent>
            {matLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <MaterialBreakdown materials={materials ?? []} lookups={lookups} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MaterialBreakdown({
  materials,
  lookups,
}: {
  materials: Material[]
  lookups: ReturnType<typeof useLookups>
}) {
  const byCategory = new Map<string, number>()
  for (const m of materials) {
    const label = lookups.categoryLabel(m.category_id) || "Non catégorisé"
    byCategory.set(label, (byCategory.get(label) ?? 0) + 1)
  }
  const rows = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  const total = materials.length || 1

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun matériel enregistré.</p>
  }

  return (
    <div className="space-y-3">
      {rows.map(([label, count]) => (
        <div key={label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">{label}</span>
            <span className="tabular-nums text-muted-foreground">{count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
