"use client"

import { useRef, useState } from "react"
import {
  FileSpreadsheet,
  Loader2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { materialsService } from "@/lib/api/services"

type Phase = "idle" | "uploading" | "success" | "error"

const ACCEPTED = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  ".xlsx",
  ".xls",
  ".csv",
]

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function ImportExcelDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported?: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<Phase>("idle")
  const [message, setMessage] = useState<string>("")
  const [dragging, setDragging] = useState(false)

  function reset() {
    setFile(null)
    setPhase("idle")
    setMessage("")
  }

  function handleClose(next: boolean) {
    if (phase === "uploading") return
    if (!next) reset()
    onOpenChange(next)
  }

  function validateAndSet(selected: File | undefined) {
    if (!selected) return
    const isValid =
      /\.(xlsx|xls|csv)$/i.test(selected.name) ||
      ACCEPTED.includes(selected.type)
    if (!isValid) {
      setPhase("error")
      setMessage(
        "Format non pris en charge. Utilisez un fichier .xlsx, .xls ou .csv.",
      )
      setFile(null)
      return
    }
    if (selected.size > 10 * 1024 * 1024) {
      setPhase("error")
      setMessage("Le fichier dépasse la taille maximale autorisée (10 Mo).")
      setFile(null)
      return
    }
    setFile(selected)
    setPhase("idle")
    setMessage("")
  }

  async function handleUpload() {
    if (!file) return
    setPhase("uploading")
    setMessage("")
    try {
      const result = await materialsService.importExcel(file)
      setPhase("success")
      setMessage(
        `Fichier analysé avec succès. ${result.imported} matériel(s) prêt(s) à être importé(s) une fois l'API connectée.`,
      )
      onImported?.()
    } catch {
      setPhase("error")
      setMessage("L'importation a échoué. Vérifiez le fichier et réessayez.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importer des matériels (Excel)</DialogTitle>
          <DialogDescription>
            Importez en masse vos équipements depuis un fichier Excel ou CSV.
            Colonnes attendues : code inventaire, désignation, catégorie, état,
            localisation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zone de dépôt */}
          {phase !== "success" ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                validateAndSet(e.dataTransfer.files?.[0])
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/40",
                dragging && "border-primary bg-primary/5",
              )}
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                <UploadCloud className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">
                Glissez-déposez votre fichier ici
              </p>
              <p className="text-xs text-muted-foreground">
                ou cliquez pour parcourir — .xlsx, .xls, .csv (max 10 Mo)
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => validateAndSet(e.target.files?.[0])}
              />
            </div>
          ) : null}

          {/* Fichier sélectionné */}
          {file && phase !== "success" ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-[color-mix(in_oklch,var(--success)_15%,transparent)]">
                <FileSpreadsheet className="size-4.5 text-[var(--success)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(file.size)}
                </p>
              </div>
              {phase === "uploading" ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={reset}
                  aria-label="Retirer le fichier"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ) : null}

          {/* Feedback état */}
          {phase === "success" ? (
            <div className="flex items-start gap-3 rounded-lg border border-[color-mix(in_oklch,var(--success)_30%,transparent)] bg-[color-mix(in_oklch,var(--success)_10%,transparent)] p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--success)]" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Importation validée</p>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
            </div>
          ) : null}

          {phase === "error" ? (
            <div className="flex items-start gap-3 rounded-lg border border-[color-mix(in_oklch,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)] p-4">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Erreur de validation</p>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          {phase === "success" ? (
            <Button onClick={() => handleClose(false)}>Terminer</Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={phase === "uploading"}
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || phase === "uploading"}
              >
                {phase === "uploading" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Analyse en cours…
                  </>
                ) : (
                  "Importer"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
