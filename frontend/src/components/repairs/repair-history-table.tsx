"use client"

import { Wrench } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/states"
import { RepairStatusBadge } from "@/components/shared/status-badge"
import { formatDate } from "@/lib/format"
import type { Repair } from "@/types"

/**
 * Tableau d'historique des réparations.
 * Réutilisé sur la fiche matériel et dans les vues d'impression.
 */
export function RepairHistoryTable({
  repairs,
  onSelect,
}: {
  repairs: Repair[]
  onSelect?: (repair: Repair) => void
}) {
  if (repairs.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="Aucune réparation"
        description="Ce matériel n'a fait l'objet d'aucune intervention pour le moment."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="hidden md:table-cell">Technicien</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="hidden lg:table-cell">Résolue le</TableHead>
            <TableHead className="w-20 text-right no-print">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repairs.map((repair) => (
            <TableRow key={repair.id}>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {formatDate(repair.reported_at)}
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="font-medium">{repair.description}</p>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {repair.technician?.full_name ?? "—"}
              </TableCell>
              <TableCell>
                <RepairStatusBadge status={repair.status} />
              </TableCell>
              <TableCell className="hidden lg:table-cell whitespace-nowrap text-sm text-muted-foreground">
                {formatDate(repair.resolved_at)}
              </TableCell>
              <TableCell className="text-right no-print">
                {onSelect ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(repair)}
                  >
                    Détails
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
