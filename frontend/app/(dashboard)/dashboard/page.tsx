import Link from "next/link";
import {
  Laptop,
  Wrench,
  AlertTriangle,
  Inbox,
  ArrowUpRight,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MaterialStatusChart } from "@/components/dashboard/material-status-chart";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { MOCK_MATERIALS, MOCK_REPAIRS, MOCK_REQUESTS } from "@/lib/mock-data";
import {
  REPAIR_STATUS_COLORS,
  REPAIR_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const totalMaterials = MOCK_MATERIALS.length;
  const inRepair = MOCK_MATERIALS.filter((m) => m.status === "EN_REPARATION").length;
  const broken = MOCK_MATERIALS.filter((m) => m.status === "EN_PANNE").length;
  const openRequests = MOCK_REQUESTS.filter(
    (r) => r.status === "OUVERTE" || r.status === "EN_COURS",
  ).length;

  const recentRepairs = [...MOCK_REPAIRS]
    .sort((a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime())
    .slice(0, 5);

  const recentRequests = [...MOCK_REQUESTS]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <DashboardShell title="Tableau de bord">
      <PageHeader
        title="Vue d'ensemble"
        description="Suivi en temps réel du parc informatique, des réparations et des demandes."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Matériels enregistrés"
          value={String(totalMaterials)}
          icon={Laptop}
          hint="Sur l'ensemble du parc"
        />
        <KpiCard
          label="En réparation"
          value={String(inRepair)}
          icon={Wrench}
          tone="warning"
          hint="Interventions en cours"
        />
        <KpiCard
          label="En panne"
          value={String(broken)}
          icon={AlertTriangle}
          tone="destructive"
          hint="Nécessitent une intervention"
        />
        <KpiCard
          label="Demandes ouvertes"
          value={String(openRequests)}
          icon={Inbox}
          tone="success"
          hint="À traiter ou en cours"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Répartition du parc par statut
          </h3>
          <MaterialStatusChart materials={MOCK_MATERIALS} />
        </div>

        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-card-foreground">
              Réparations récentes
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reparations">
                Voir tout
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {recentRepairs.map((repair) => (
              <div
                key={repair.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-card-foreground">
                    {repair.material.name}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {repair.material.asset_code}
                    </span>
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {repair.description}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge
                    label={REPAIR_STATUS_LABELS[repair.status]}
                    className={REPAIR_STATUS_COLORS[repair.status]}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(repair.opened_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground">
            Demandes récentes
          </h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/demandes">
              Voir tout
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Code</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Titre</th>
                <th className="py-2 pr-4 font-medium">Demandeur</th>
                <th className="py-2 pr-4 font-medium">Statut</th>
                <th className="py-2 pr-0 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentRequests.map((request) => (
                <tr key={request.id} className="text-card-foreground">
                  <td className="py-3 pr-4 font-medium">{request.code}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {REQUEST_TYPE_LABELS[request.type]}
                  </td>
                  <td className="max-w-[240px] truncate py-3 pr-4">
                    {request.title}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {request.created_by.first_name} {request.created_by.last_name}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge
                      label={REQUEST_STATUS_LABELS[request.status]}
                      className={REQUEST_STATUS_COLORS[request.status]}
                    />
                  </td>
                  <td className="py-3 pr-0 text-muted-foreground">
                    {formatDate(request.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
