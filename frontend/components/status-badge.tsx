import { cn } from "@/lib/utils"

type Tone = "success" | "warning" | "danger" | "info" | "muted" | "accent"

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  info: "bg-primary/10 text-primary border-primary/20",
  muted: "bg-muted text-muted-foreground border-border",
  accent: "bg-accent/25 text-accent-foreground border-accent/40",
}

export function StatusBadge({
  label,
  tone = "muted",
  className,
}: {
  label: string
  tone?: string
  className?: string
}) {
  const t = (TONE_CLASSES[tone as Tone] ? tone : "muted") as Tone
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[t],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          t === "success" && "bg-success",
          t === "warning" && "bg-warning",
          t === "danger" && "bg-destructive",
          t === "info" && "bg-primary",
          t === "muted" && "bg-muted-foreground",
          t === "accent" && "bg-accent-foreground",
        )}
      />
      {label}
    </span>
  )
}
