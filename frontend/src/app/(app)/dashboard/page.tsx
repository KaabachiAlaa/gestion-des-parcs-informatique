"use client"

import useSWR from "swr"
import { AlertTriangle } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { EmptyState } from "@/components/shared/states"
import {
  StatCards,
  StatCardsSkeleton,
} from "@/components/dashboard/stat-cards"
import {
  MaterialsByCategoryChart,
  MaterialsByStatusChart,
  RepairsTrendChart,
} from "@/components/dashboard/charts"
import {
  RecentRepairs,
  RecentRequests,
} from "@/components/dashboard/recent-activity"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  dashboardService,
  repairsService,
  requestsService,
} from "@/lib/api/services"
import { useAuth } from "@/lib/auth/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading, error } = useSWR("dashboard-stats", () =>
    dashboardService.stats(),
  )
  const { data: recentRepairs } = useSWR("dashboard-recent-repairs", () =>
    repairsService.search({ page: 1, limit: 5 }),
  )
  const { data: recentRequests } = useSWR("dashboard-recent-requests", () =>
    requestsService.search({ page: 1, limit: 5 }),
  )

  const firstName = user?.full_name.split(" ")[0] ?? ""

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: "Tableau de bord" }]} />
        <PageHeader
          title={`Bonjour ${firstName}`}
          description="Vue d'ensemble du parc informatique et de l'activité récente."
        />
      </div>

      {error ? (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="Impossible de charger les statistiques"
            description="Une erreur est survenue lors de la récupération des données du tableau de bord."
          />
        </Card>
      ) : isLoading || !stats ? (
        <StatCardsSkeleton />
      ) : (
        <StatCards stats={stats} />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {isLoading || !stats ? (
          <>
            <Skeleton className="h-80 lg:col-span-2" />
            <Skeleton className="h-80" />
          </>
        ) : (
          <>
            <RepairsTrendChart data={stats.repairs_trend} />
            <MaterialsByStatusChart data={stats.materials_by_status} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {isLoading || !stats ? (
          <Skeleton className="h-80 lg:col-span-1" />
        ) : (
          <MaterialsByCategoryChart data={stats.materials_by_category} />
        )}

        <div className="lg:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          {recentRepairs ? (
            <RecentRepairs repairs={recentRepairs.data} />
          ) : (
            <Skeleton className="h-80" />
          )}
          {recentRequests ? (
            <RecentRequests requests={recentRequests.data} />
          ) : (
            <Skeleton className="h-80" />
          )}
        </div>
      </div>
    </div>
  )
}
