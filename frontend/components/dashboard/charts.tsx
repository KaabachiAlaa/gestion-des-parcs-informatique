"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DashboardStats, MaterialStatus } from "@/types"

const statusColors: Record<MaterialStatus, string> = {
  "En service": "var(--color-success)",
  "En panne": "var(--color-destructive)",
  "En réparation": "var(--color-warning)",
  "En stock": "var(--color-info)",
  "Réformé": "var(--color-muted-foreground)",
}

const trendConfig: ChartConfig = {
  ouvertes: { label: "Ouvertes", color: "var(--color-chart-1)" },
  resolues: { label: "Résolues", color: "var(--color-chart-4)" },
}

const categoryConfig: ChartConfig = {
  count: { label: "Matériels", color: "var(--color-chart-1)" },
}

export function RepairsTrendChart({
  data,
}: {
  data: DashboardStats["repairs_trend"]
}) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Tendance des réparations</CardTitle>
        <CardDescription>
          Réparations ouvertes et résolues sur les 6 derniers mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={trendConfig} className="aspect-auto h-64 w-full">
          <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillOuvertes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-ouvertes)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-ouvertes)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillResolues" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-resolues)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-resolues)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="ouvertes"
              type="monotone"
              stroke="var(--color-ouvertes)"
              fill="url(#fillOuvertes)"
              strokeWidth={2}
            />
            <Area
              dataKey="resolues"
              type="monotone"
              stroke="var(--color-resolues)"
              fill="url(#fillResolues)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function MaterialsByStatusChart({
  data,
}: {
  data: DashboardStats["materials_by_status"]
}) {
  const config: ChartConfig = Object.fromEntries(
    data.map((d) => [d.status, { label: d.status, color: statusColors[d.status] }]),
  )
  const total = data.reduce((acc, d) => acc + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition du parc</CardTitle>
        <CardDescription>Par état du matériel</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          className="mx-auto aspect-square h-56"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={statusColors[entry.status]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-2 grid grid-cols-1 gap-1.5">
          {data.map((entry) => (
            <div
              key={entry.status}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: statusColors[entry.status] }}
                />
                {entry.status}
              </span>
              <span className="font-medium tabular-nums">
                {entry.count}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({total ? Math.round((entry.count / total) * 100) : 0}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function MaterialsByCategoryChart({
  data,
}: {
  data: DashboardStats["materials_by_category"]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matériels par catégorie</CardTitle>
        <CardDescription>Volume par type d&apos;équipement</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={categoryConfig} className="aspect-auto h-64 w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 8, right: 16 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={false}
              width={130}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 4, 4, 0]}
              barSize={18}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
