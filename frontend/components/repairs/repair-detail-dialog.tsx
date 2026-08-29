"use client"

import Link from "next/link"
import { Boxes, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RepairStatusBadge } from "@/components/shared/status-badge"
import { formatDateTime, formatCurrency } from "@/lib/format"
import type { Repair } from "@/types"

export function RepairDetailDialog({
  open,
  onOpenChange,
  repair,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  repair: Repair | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Réparation #{repair?.id}
            {repair ? <RepairStatusBadge status={repair.status} /> : null}
          </DialogTitle>
          <DialogDescription>
            Détail de l&apos;intervention et de sa résolution.
          </DialogDescription>
        </DialogHeader>

        {repair ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Boxes className="size-4 text-muted-foreground" />
                  <span className="font-medium">{repair.material.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {repair.material.inventory_number}
                  </span>
                </div>
                <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                  <Link href={`/materials/${repair.material.id}`}>
                    Fiche
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <Field label="Description">
              <p className="text-sm">{repair.description}</p>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Technicien">
                <p className="text-sm">{repair.technician?.full_name ?? "—"}</p>
              </Field>
              <Field label="Déclarée par">
                <p className="text-sm">{repair.reported_by?.full_name ?? "—"}</p>
              </Field>
              <Field label="Date de déclaration">
                <p className="text-sm">{formatDateTime(repair.reported_at)}</p>
              </Field>
              <Field label="Date de résolution">
                <p className="text-sm">{formatDateTime(repair.resolved_at)}</p>
              </Field>
              <Field label="Coût">
                <p className="text-sm">{formatCurrency(repair.cost)}</p>
              </Field>
            </div>

            {repair.resolution ? (
              <Field label="Résolution">
                <p className="text-sm">{repair.resolution}</p>
              </Field>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  )
}
