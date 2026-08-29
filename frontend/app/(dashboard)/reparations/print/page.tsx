"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchRepairs } from "@/lib/api/repairs";
import { REPAIR_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Repair } from "@/lib/types";

export default function RepairsHistoryPrintPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);

  useEffect(() => {
    searchRepairs({ limit: 500 }).then((result) => setRepairs(result.data));
  }, []);

  return (
    <div className="mx-auto max-w-4xl bg-white p-8 text-neutral-900 print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-sm text-neutral-500">Aperçu d&apos;impression</p>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" />
          Imprimer
        </Button>
      </div>

      <header className="flex items-start justify-between border-b-2 border-neutral-900 pb-4">
        <div className="flex items-center gap-3">
          <Image
            src="/images/comet-logo.png"
            alt="Comet GPI"
            width={48}
            height={48}
            className="size-12"
          />
          <div>
            <p className="text-lg font-bold">Comet GPI</p>
            <p className="text-xs text-neutral-500">Gestion du parc informatique</p>
          </div>
        </div>
        <div className="text-right text-xs text-neutral-500">
          <p>Historique des réparations</p>
          <p>Imprimé le {formatDate(new Date().toISOString())}</p>
          <p>{repairs.length} intervention(s)</p>
        </div>
      </header>

      <table className="mt-6 w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-neutral-300 text-left text-neutral-500">
            <th className="py-1.5 pr-2 font-medium">Matériel</th>
            <th className="py-1.5 pr-2 font-medium">Description</th>
            <th className="py-1.5 pr-2 font-medium">Technicien</th>
            <th className="py-1.5 pr-2 font-medium">Priorité</th>
            <th className="py-1.5 pr-2 font-medium">Ouverte le</th>
            <th className="py-1.5 pr-2 font-medium">Clôturée le</th>
            <th className="py-1.5 pr-0 font-medium">Statut</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((repair) => (
            <tr key={repair.id} className="break-inside-avoid border-b border-neutral-100">
              <td className="py-1.5 pr-2">
                {repair.material.name}
                <div className="text-neutral-400">{repair.material.asset_code}</div>
              </td>
              <td className="max-w-[160px] py-1.5 pr-2">{repair.description}</td>
              <td className="py-1.5 pr-2">
                {repair.technician.first_name} {repair.technician.last_name}
              </td>
              <td className="py-1.5 pr-2">{PRIORITY_LABELS[repair.priority]}</td>
              <td className="py-1.5 pr-2">{formatDate(repair.opened_at)}</td>
              <td className="py-1.5 pr-2">
                {repair.resolved_at ? formatDate(repair.resolved_at) : "—"}
              </td>
              <td className="py-1.5 pr-0">{REPAIR_STATUS_LABELS[repair.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="mt-10 flex items-end justify-between border-t border-neutral-300 pt-4 text-xs text-neutral-400">
        <span>Document généré automatiquement par Comet GPI.</span>
        <span>Page 1/1</span>
      </footer>
    </div>
  );
}
