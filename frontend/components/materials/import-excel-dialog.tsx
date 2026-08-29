"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload, CheckCircle2 } from "lucide-react";
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

// Mock import flow. In the real backend this would POST the file to an
// endpoint like /materials/import and return a summary of created rows.
export function ImportExcelDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFileName(null);
    setImporting(false);
    setDone(false);
  }

  async function handleImport() {
    setImporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setImporting(false);
    setDone(true);
    toast.success("Fichier importé avec succès.");
    onImported();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importer des matériels</DialogTitle>
          <DialogDescription>
            Importez une liste de matériels depuis un fichier Excel (.xlsx).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            {done ? (
              <CheckCircle2 className="size-8 text-success" />
            ) : (
              <FileSpreadsheet className="size-8 text-muted-foreground" />
            )}
            <span className="text-sm font-medium text-foreground">
              {fileName ?? "Cliquez pour sélectionner un fichier .xlsx"}
            </span>
            <span className="text-xs text-muted-foreground">
              Modèle attendu : code, désignation, marque, modèle, statut, catégorie
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFileName(file.name);
                setDone(false);
              }
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button onClick={handleImport} disabled={!fileName || importing || done}>
            <Upload className="size-4" />
            {importing ? "Import en cours..." : "Importer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
