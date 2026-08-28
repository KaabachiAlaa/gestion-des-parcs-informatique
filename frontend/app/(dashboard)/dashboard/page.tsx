"use client"

import Link from "next/link"
import {
  MonitorSmartphone,
  Wrench,
  AlertTriangle,
  Users,
  Tags,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from "recharts"
import { usePageTitle } from "@/lib/page-title-context"
import { useAuth } from "@/lib/auth-context"
import {
  useMaterials,
  useRepairs,
  useRequests,
  useUsers,
  useCategories,
} from "@/lib/hooks"
import { StatCard } from "@/components/stat-card"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import {
  materialStatusLabels,
  materialStatusVariants,
  repairStatusLabels,
  repairStatusVariants,
  requestStatusLabels,
  requestStatusVariants,
  formatDate,
} from "@/lib/format"

const STATUS_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export default function DashboardPage() {
  usePageTitle("Tableau de bord")
  const { user, isAdmin } = useAuth()
  const { materials, isLoading: materialsLoading } = useMaterials()
  const { repairs, isLoading: repairsLoading } = useRepairs()
  const { requests, isLoading: requestsLoading } = useRequests()
  const { users } = useUsers()
  const { categories } = useCategories()

  const activeRepairs = repairs.filter((r) => r.status === "IN_PROGRESS")
  const unresolvedRepairs = repairs.filter(
    (r) => r.status !== "COMPLETED" && r.status !== "CANCELLED"
  )

  const materialsByStatus = Object.entries(
    materials.reduce<Record<string, number>>((acc, m) => {
      acc[m.status] = (acc[m.status] ?? 0) + 1
      return acc
    }, {})
  ).map(([status, count]) => ({
    status,
    label: materialStatusLabels[status] ?? status,
    count,
  }))

  const requestsByStatus = Object.entries(
    requests.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1
      return acc
    }, {})
  ).map(([status, count]) => ({
    status,
    label: requestStatusLabels[status] ?? status,
    count,
  }))

  const now = new Date()
  const monthLabels = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      count: 0,
    }
  })
  for (const r of repairs) {
    const d = new Date(r.start_date)
    if (Number.isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const bucket = monthLabels.find((m) => m.key === key)
    if (bucket) bucket.count += 1
  }

  const materialsById = new Map(materials.map((m) => [m.id, m]))

  const recentRepairs = [...repairs]
    .sort((a, b) => (a.start_date < b.start_date ? 1 : -1))
    .slice(0, 5)

  const recentRequests = [...requests].sort((a, b) => b.id - a.id).slice(0, 5)

  const chartConfig: ChartConfig = {
    count: { label: "Total", color: "var(--color-chart-2)" },
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Bienvenue {user?.first_name}, voici l&apos;état actuel du parc
        informatique.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Matériels"
          value={materials.length}
          icon={MonitorSmartphone}
          isLoading={materialsLoading}
          tone="primary"
        />
        <StatCard
          label="Réparations actives"
          value={activeRepairs.length}
          icon={Wrench}
          isLoading={repairsLoading}
          tone="accent"
        />
        <StatCard
          label="Pannes non résolues"
          value={unresolvedRepairs.length}
          icon={AlertTriangle}
          isLoading={repairsLoading}
          tone="warning"
        />
        {isAdmin ? (
          <StatCard
            label="Utilisateurs"
            value={users.length}
            icon={Users}
            tone="destructive"
          />
        ) : (
          <StatCard
            label="Catégories"
            value={categories.length}
            icon={Tags}
            tone="destructive"
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Réparations par mois</CardTitle>
            <CardDescription>
              Nombre de réparations initiées au cours des 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
              <BarChart data={monthLabels}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matériels par statut</CardTitle>
            <CardDescription>Répartition actuelle du parc</CardDescription>
          </CardHeader>
          <CardContent>
            {materialsByStatus.length === 0 ? (
              <EmptyState
                icon={MonitorSmartphone}
                title="Aucun matériel"
                className="py-8"
              />
            ) : (
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-64"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
                  <Pie
                    data={materialsByStatus}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={45}
                    strokeWidth={2}
                  >
                    {materialsByStatus.map((entry, index) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Réparations récentes</CardTitle>
            <CardDescription>Les 5 dernières interventions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRepairs.length === 0 ? (
              <EmptyState
                icon={Wrench}
                title="Aucune réparation"
                className="py-8"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matériel</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRepairs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/reparations/${r.id}`}
                          className="hover:text-accent"
                        >
                          {materialsById.get(r.material_id)?.name ??
                            `Matériel #${r.material_id}`}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(r.start_date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          value={r.status}
                          labels={repairStatusLabels}
                          variants={repairStatusVariants}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demandes récentes</CardTitle>
            <CardDescription>Les 5 dernières demandes créées</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="Aucune demande"
                className="py-8"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/demandes`}
                          className="hover:text-accent"
                        >
                          {r.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.request_code}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          value={r.status}
                          labels={requestStatusLabels}
                          variants={requestStatusVariants}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {requestsByStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Demandes par statut</CardTitle>
            <CardDescription>
              Répartition des demandes de support, d&apos;intervention et
              d&apos;achat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
              <BarChart data={requestsByStatus} layout="vertical">
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {requestsByStatus.map((entry, index) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
