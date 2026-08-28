"use client"

import { useRef, useState } from "react"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCategories } from "@/lib/hooks"
import { materialsApi } from "@/lib/api"
import { ApiError } from "@/lib/api-client"
import type { MaterialInput } from "@/lib/types"

interface ImportRow {
  asset_code?: string
  name?: string
  category?: string
  brand?: string
  model?: string
  serial_number?: string
  status?: string
  purchase_price?: number
}

export function MaterialImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
}) {
  const { categories } = useCategories()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ ok: number; failed: number } | null>(
    null
  )

  function handleFile(file: File) {
    setFileName(file.name)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: "binary" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const parsed = XLSX.utils.sheet_to_json<ImportRow>(sheet, {
        raw: true,
      })
      setRows(parsed)
    }
    reader.readAsBinaryString(file)
  }

  async function handleImport() {
    if (rows.length === 0) return
    setImporting(true)
    let ok = 0
    let failed = 0
    for (const row of rows) {
      if (!row.asset_code || !row.name) {
        failed++
        continue
      }
      const category = categories.find(
        (c) => c.name.toLowerCase() === String(row.category ?? "").toLowerCase()
      )
      const payload: MaterialInput = {
        asset_code: String(row.asset_code),
        name: String(row.name),
        category_id: category?.id ?? categories[0]?.id ?? 0,
        brand: row.brand ? String(row.brand) : null,
        model: row.model ? String(row.model) : null,
        serial_number: row.serial_number ? String(row.serial_number) : null,
        status: row.status ? String(row.status) : "IN_SERVICE",
        purchase_price: row.purchase_price ? Number(row.purchase_price) : null,
      }
      try {
        await materialsApi.create(payload)
        ok++
      } catch {
        failed++
      }
    }
    setImporting(false)
    setResult({ ok, failed })
    if (ok > 0) {
      toast.success(`${ok} matériel(s) importé(s)`)
      onImported()
    }
    if (failed > 0) {
      toast.error(`${failed} ligne(s) n'ont pas pu être importées`)
    }
  }

  function reset() {
    setFileName(null)
    setRows([])
    setResult(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importer des matériels</DialogTitle>
          <DialogDescription>
            Importez un fichier Excel (.xlsx) avec les colonnes asset_code,
            name, category, brand, model, serial_number, status,
            purchase_price.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors hover:bg-muted"
        >
          {fileName ? (
            <>
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">{fileName}</span>
              <span className="text-xs text-muted-foreground">
                {rows.length} ligne(s) détectée(s)
              </span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">
                Cliquez pour choisir un fichier
              </span>
              <span className="text-xs text-muted-foreground">
                Formats acceptés : .xlsx, .xls, .csv
              </span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />

        {result && (
          <p className="text-sm text-muted-foreground">
            {result.ok} importé(s) avec succès, {result.failed} échec(s).
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button
            onClick={handleImport}
            disabled={rows.length === 0 || importing}
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importation...
              </>
            ) : (
              `Importer ${rows.length > 0 ? `(${rows.length})` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
