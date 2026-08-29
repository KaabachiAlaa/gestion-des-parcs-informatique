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
import {
  RequestStatusBadge,
  RequestPriorityBadge,
  RequestTypeBadge,
} from "@/components/shared/status-badge"
import { formatDateTime } from "@/lib/format"
import type { SupportRequest } from "@/types"

export function RequestDetailDialog({
  open,
  onOpenChange,
  request,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: SupportRequest | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-pretty">
            {request?.title ?? "Demande"}
          </DialogTitle>
          <DialogDescription>Demande #{request?.id}</DialogDescription>
        </DialogHeader>

        {request ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <RequestTypeBadge type={request.type} />
              <RequestStatusBadge status={request.status} />
              <RequestPriorityBadge priority={request.priority} />
            </div>

            <Field label="Description">
              <p className="text-sm text-pretty">{request.description}</p>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Demandeur">
                <p className="text-sm">{request.requested_by.full_name}</p>
              </Field>
              <Field label="Créée le">
                <p className="text-sm">{formatDateTime(request.created_at)}</p>
              </Field>
              {request.updated_at ? (
                <Field label="Mise à jour">
                  <p className="text-sm">
                    {formatDateTime(request.updated_at)}
                  </p>
                </Field>
              ) : null}
            </div>

            {request.material ? (
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Boxes className="size-4 text-muted-foreground" />
                    <span className="font-medium">{request.material.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {request.material.inventory_number}
                    </span>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs"
                  >
                    <Link href={`/materials/${request.material.id}`}>
                      Fiche
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
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
