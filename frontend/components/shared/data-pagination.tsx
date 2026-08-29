import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function DataPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? (
          "Aucun résultat"
        ) : (
          <>
            Affichage de <span className="font-medium text-foreground">{start}</span>{" "}
            à <span className="font-medium text-foreground">{end}</span> sur{" "}
            <span className="font-medium text-foreground">{total}</span>
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="size-4" />
          Précédent
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums">
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Suivant
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
