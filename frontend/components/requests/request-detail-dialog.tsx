"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateRequest } from "@/lib/api/requests";
import { useAuth } from "@/lib/auth";
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { RequestStatus, ServiceRequest } from "@/lib/types";

const STATUSES: RequestStatus[] = ["OUVERTE", "EN_COURS", "RESOLUE", "REJETEE"];

export function RequestDetailDialog({
  request,
  open,
  onOpenChange,
  onUpdated,
}: {
  request: ServiceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  const { user } = useAuth();
  const canManage = user.role === "Admin" || user.role === "Technicien";

  const [status, setStatus] = useState<RequestStatus>("OUVERTE");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (request) {
      setStatus(request.status);
      setNotes(request.resolution_notes ?? "");
    }
  }, [request]);

  if (!request) return null;

  async function handleSave() {
    setSaving(true);
    try {
      await updateRequest(request.id, { status, resolution_notes: notes || null });
      toast.success("Demande mise à jour.");
      onUpdated();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{request.code}</DialogTitle>
            <StatusBadge
              label={PRIORITY_LABELS[request.priority]}
              className={PRIORITY_COLORS[request.priority]}
            />
          </div>
          <DialogDescription>{REQUEST_TYPE_LABELS[request.type]}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">{request.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{request.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-xs">
            <div>
              <p className="text-muted-foreground">Demandeur</p>
              <p className="font-medium text-card-foreground">
                {request.created_by.first_name} {request.created_by.last_name}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Créée le</p>
              <p className="font-medium text-card-foreground">
                {formatDateTime(request.created_at)}
              </p>
            </div>
          </div>

          {canManage ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="status">Statut</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus)}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {REQUEST_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notes">Notes de résolution</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajoutez une note sur le traitement de cette demande..."
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Statut actuel</span>
              <StatusBadge
                label={REQUEST_STATUS_LABELS[request.status]}
                className={REQUEST_STATUS_COLORS[request.status]}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {canManage ? (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
