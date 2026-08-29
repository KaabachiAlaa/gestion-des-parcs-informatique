import { cn } from "@/lib/utils"
import type {
  MaterialStatus,
  RepairStatus,
  RequestPriority,
  RequestStatus,
  RequestType,
  RoleName,
} from "@/types"

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary"

const toneClasses: Record<Tone, string> = {
  success:
    "bg-[color-mix(in_oklch,var(--success)_15%,transparent)] text-[var(--success)] ring-1 ring-inset ring-[color-mix(in_oklch,var(--success)_30%,transparent)]",
  warning:
    "bg-[color-mix(in_oklch,var(--warning)_20%,transparent)] text-[color-mix(in_oklch,var(--warning)_60%,var(--foreground))] ring-1 ring-inset ring-[color-mix(in_oklch,var(--warning)_35%,transparent)]",
  danger:
    "bg-[color-mix(in_oklch,var(--destructive)_15%,transparent)] text-[var(--destructive)] ring-1 ring-inset ring-[color-mix(in_oklch,var(--destructive)_30%,transparent)]",
  info: "bg-[color-mix(in_oklch,var(--info)_15%,transparent)] text-[var(--info)] ring-1 ring-inset ring-[color-mix(in_oklch,var(--info)_30%,transparent)]",
  primary:
    "bg-[color-mix(in_oklch,var(--primary)_12%,transparent)] text-[var(--primary)] ring-1 ring-inset ring-[color-mix(in_oklch,var(--primary)_25%,transparent)]",
  neutral:
    "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
}

function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
      )}
    >
      <span
        className="size-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {children}
    </span>
  )
}

const materialTone: Record<MaterialStatus, Tone> = {
  "En service": "success",
  "En panne": "danger",
  "En réparation": "warning",
  "En stock": "info",
  "Réformé": "neutral",
}

export function MaterialStatusBadge({ status }: { status: MaterialStatus }) {
  return <Pill tone={materialTone[status]}>{status}</Pill>
}

const repairTone: Record<RepairStatus, Tone> = {
  Ouverte: "danger",
  "En cours": "warning",
  "En attente": "info",
  "Résolue": "success",
  "Annulée": "neutral",
}

export function RepairStatusBadge({ status }: { status: RepairStatus }) {
  return <Pill tone={repairTone[status]}>{status}</Pill>
}

const requestTone: Record<RequestStatus, Tone> = {
  Nouvelle: "info",
  "En traitement": "warning",
  "Approuvée": "success",
  "Rejetée": "danger",
  "Clôturée": "neutral",
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Pill tone={requestTone[status]}>{status}</Pill>
}

const priorityTone: Record<RequestPriority, Tone> = {
  Basse: "neutral",
  Normale: "info",
  Haute: "warning",
  Urgente: "danger",
}

export function RequestPriorityBadge({
  priority,
}: {
  priority: RequestPriority
}) {
  return <Pill tone={priorityTone[priority]}>{priority}</Pill>
}

const roleTone: Record<RoleName, Tone> = {
  Admin: "primary",
  Technicien: "info",
  Consultant: "neutral",
}

export function RoleBadge({ role }: { role: RoleName }) {
  return <Pill tone={roleTone[role]}>{role}</Pill>
}

const requestTypeTone: Record<RequestType, Tone> = {
  Support: "info",
  Intervention: "warning",
  Achat: "primary",
}

export function RequestTypeBadge({ type }: { type: RequestType }) {
  return <Pill tone={requestTypeTone[type]}>{type}</Pill>
}

/** Badge actif/inactif pour les utilisateurs. */
export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Pill tone={active ? "success" : "neutral"}>
      {active ? "Actif" : "Inactif"}
    </Pill>
  )
}
