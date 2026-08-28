import { cn } from "@/lib/utils"

const variantClasses: Record<string, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  secondary: "bg-secondary text-secondary-foreground",
  muted: "bg-muted text-muted-foreground",
}

export function StatusBadge({
  label,
  variant = "muted",
  className,
}: {
  label: string
  variant?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant] ?? variantClasses.muted,
        className
      )}
    >
      {label}
    </span>
  )
}
