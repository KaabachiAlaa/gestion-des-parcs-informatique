import {
  LayoutDashboard,
  Laptop,
  Wrench,
  Users,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import type {
  MaterialStatus,
  Role,
  RepairPriority,
  RepairStatus,
  RequestPriority,
  RequestStatus,
  RequestType,
} from "@/lib/types";

export const APP_NAME = "Comet GPI";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Admin", "Technicien", "Consultant"],
  },
  {
    label: "Matériels",
    href: "/materiels",
    icon: Laptop,
    roles: ["Admin", "Technicien", "Consultant"],
  },
  {
    label: "Réparations",
    href: "/reparations",
    icon: Wrench,
    roles: ["Admin", "Technicien", "Consultant"],
  },
  {
    label: "Utilisateurs",
    href: "/utilisateurs",
    icon: Users,
    roles: ["Admin"],
  },
  {
    label: "Demandes",
    href: "/demandes",
    icon: Inbox,
    roles: ["Admin", "Technicien", "Consultant"],
  },
];

export const ROLE_LABELS: Record<Role, string> = {
  Admin: "Administrateur",
  Technicien: "Technicien",
  Consultant: "Consultant",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Admin:
    "Accès complet : gestion des matériels, utilisateurs, réparations et demandes.",
  Technicien:
    "Gère les réparations et les demandes d'intervention, consulte le parc matériel.",
  Consultant:
    "Accès en lecture seule au parc matériel, aux réparations et aux demandes.",
};

export const MATERIAL_STATUS_LABELS: Record<MaterialStatus, string> = {
  EN_SERVICE: "En service",
  EN_PANNE: "En panne",
  EN_REPARATION: "En réparation",
  EN_STOCK: "En stock",
  HORS_SERVICE: "Hors service",
};

export const MATERIAL_STATUS_COLORS: Record<MaterialStatus, string> = {
  EN_SERVICE: "bg-success/15 text-success border-success/30",
  EN_PANNE: "bg-destructive/15 text-destructive border-destructive/30",
  EN_REPARATION: "bg-warning/15 text-warning-foreground border-warning/40",
  EN_STOCK: "bg-muted text-muted-foreground border-border",
  HORS_SERVICE: "bg-secondary text-secondary-foreground border-border",
};

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  OUVERTE: "Ouverte",
  EN_COURS: "En cours",
  RESOLUE: "Résolue",
  ANNULEE: "Annulée",
};

export const REPAIR_STATUS_COLORS: Record<RepairStatus, string> = {
  OUVERTE: "bg-accent/15 text-accent border-accent/30",
  EN_COURS: "bg-warning/15 text-warning-foreground border-warning/40",
  RESOLUE: "bg-success/15 text-success border-success/30",
  ANNULEE: "bg-muted text-muted-foreground border-border",
};

export const PRIORITY_LABELS: Record<RepairPriority | RequestPriority, string> = {
  BASSE: "Basse",
  NORMALE: "Normale",
  HAUTE: "Haute",
  CRITIQUE: "Critique",
};

export const PRIORITY_COLORS: Record<RepairPriority | RequestPriority, string> = {
  BASSE: "bg-muted text-muted-foreground border-border",
  NORMALE: "bg-accent/15 text-accent border-accent/30",
  HAUTE: "bg-warning/15 text-warning-foreground border-warning/40",
  CRITIQUE: "bg-destructive/15 text-destructive border-destructive/30",
};

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  SUPPORT: "Support",
  INTERVENTION: "Intervention",
  ACHAT: "Achat",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  OUVERTE: "Ouverte",
  EN_COURS: "En cours",
  RESOLUE: "Résolue",
  REJETEE: "Rejetée",
};

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  OUVERTE: "bg-accent/15 text-accent border-accent/30",
  EN_COURS: "bg-warning/15 text-warning-foreground border-warning/40",
  RESOLUE: "bg-success/15 text-success border-success/30",
  REJETEE: "bg-destructive/15 text-destructive border-destructive/30",
};
