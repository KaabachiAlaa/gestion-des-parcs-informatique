"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MATERIAL_STATUS_LABELS } from "@/lib/constants";
import type { Material, MaterialStatus } from "@/lib/types";

const COLORS: Record<MaterialStatus, string> = {
  EN_SERVICE: "var(--color-chart-1)",
  EN_PANNE: "var(--color-chart-4)",
  EN_REPARATION: "var(--color-chart-3)",
  EN_STOCK: "var(--color-chart-2)",
  HORS_SERVICE: "var(--color-chart-5)",
};

export function MaterialStatusChart({ materials }: { materials: Material[] }) {
  const counts = materials.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1;
    return acc;
  }, {});

  const data = (Object.keys(counts) as MaterialStatus[]).map((status) => ({
    status,
    label: MATERIAL_STATUS_LABELS[status],
    value: counts[status],
    fill: COLORS[status],
  }));

  const config: ChartConfig = Object.fromEntries(
    data.map((d) => [d.status, { label: d.label, color: d.fill }]),
  );

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer config={config} className="mx-auto aspect-square max-h-64">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="status"
            innerRadius={55}
            outerRadius={85}
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={entry.fill} stroke="var(--color-card)" />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="grid grid-cols-2 gap-2">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.fill }}
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-medium tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
