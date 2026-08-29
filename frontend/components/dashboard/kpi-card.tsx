import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "destructive" | "success";
  hint?: string;
}) {
  const toneStyles: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/15 text-destructive",
    success: "bg-success/15 text-success",
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-md",
            toneStyles[tone],
          )}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
    </div>
  );
}
