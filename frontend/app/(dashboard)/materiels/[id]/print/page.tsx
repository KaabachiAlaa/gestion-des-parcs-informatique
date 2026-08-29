"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMaterial } from "@/lib/api/materials";
import { searchRepairs } from "@/lib/api/repairs";
import {
  MATERIAL_STATUS_LABELS,
  REPAIR_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Material, Repair } from "@/lib/types";

export default function MaterialPrintPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [material, setMaterial] = useState<Material | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);

  useEffect(() => {
    (async () => {
      const [m, r] = await Promise.all([
        getMaterial(id),
        searchRepairs({ material_id: id, limit: 50 }),
      ]);
      setMaterial(m ?? null);
      setRepairs(r.data);
    })();
  }, [id]);

  if (!material) return null;

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-neutral-900 print:p-0">
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
          <p>Fiche matériel</p>
          <p>Imprimé le {formatDate(new Date().toISOString())}</p>
        </div>
      </header>

      <section className="mt-6">
        <h1 className="text-xl font-bold">{material.name}</h1>
        <p className="text-sm text-neutral-500">
          {material.asset_code} · {material.brand} {material.model}
        </p>

        <table className="mt-4 w-full border-collapse text-sm">
          <tbody>
            <PrintRow label="Statut" value={MATERIAL_STATUS_LABELS[material.status]} />
            <PrintRow label="Numéro de série" value={material.serial_number} />
            <PrintRow label="Catégorie" value={material.category.name} />
            <PrintRow label="Emplacement" value={material.location.name} />
            <PrintRow
              label="Assigné à"
              value={
                material.assigned_user
                  ? `${material.assigned_user.first_name} ${material.assigned_user.last_name}`
                  : "Non assigné"
              }
            />
            <PrintRow label="Date d'acquisition" value={formatDate(material.acquisition_date)} />
            <PrintRow
              label="Fin de garantie"
              value={material.warranty_end_date ? formatDate(material.warranty_end_date) : "—"}
            />
            <PrintRow
              label="Prix d'achat"
              value={material.purchase_price ? formatCurrency(material.purchase_price) : "—"}
            />
          </tbody>
        </table>

        {material.description ? (
          <p className="mt-4 text-sm">
            <span className="font-semibold">Description : </span>
            {material.description}
          </p>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="border-b border-neutral-300 pb-1 text-sm font-bold uppercase tracking-wide">
          Historique des réparations
        </h2>
        {repairs.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Aucune réparation enregistrée.</p>
        ) : (
          <table className="mt-2 w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-300 text-left text-neutral-500">
                <th className="py-1.5 pr-2 font-medium">Description</th>
                <th className="py-1.5 pr-2 font-medium">Technicien</th>
                <th className="py-1.5 pr-2 font-medium">Ouverte le</th>
                <th className="py-1.5 pr-2 font-medium">Clôturée le</th>
                <th className="py-1.5 pr-0 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((repair) => (
                <tr key={repair.id} className="border-b border-neutral-100">
                  <td className="max-w-[180px] truncate py-1.5 pr-2">{repair.description}</td>
                  <td className="py-1.5 pr-2">
                    {repair.technician.first_name} {repair.technician.last_name}
                  </td>
                  <td className="py-1.5 pr-2">{formatDate(repair.opened_at)}</td>
                  <td className="py-1.5 pr-2">
                    {repair.closed_at ? formatDate(repair.closed_at) : "—"}
                  </td>
                  <td className="py-1.5 pr-0">{REPAIR_STATUS_LABELS[repair.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="mt-10 flex items-end justify-between border-t border-neutral-300 pt-4 text-xs text-neutral-400">
        <span>Document généré automatiquement par Comet GPI.</span>
        <span>Page 1/1</span>
      </footer>
    </div>
  );
}

function PrintRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-neutral-100">
      <td className="w-48 py-1.5 pr-2 font-medium text-neutral-500">{label}</td>
      <td className="py-1.5">{value}</td>
    </tr>
  );
}
