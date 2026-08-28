"use client"

import { formatCurrency, formatDate, materialStatusLabels } from "@/lib/format"
import type { Material, Repair } from "@/lib/types"

export function MaterialPrintSheet({
  material,
  categoryName,
  locationName,
  assignedUserName,
  repairs,
}: {
  material: Material
  categoryName: string
  locationName: string
  assignedUserName: string
  repairs: Repair[]
}) {
  return (
    <div className="hidden print:block print:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-black pb-4">
        <div>
          <h1 className="text-xl font-bold">Fiche matériel — {material.name}</h1>
          <p className="text-sm">Code actif : {material.asset_code}</p>
        </div>
        <p className="text-xs">
          Généré le {new Date().toLocaleDateString("fr-FR")}
        </p>
      </div>

      <table className="mb-6 w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td className="w-1/3 border border-black p-2 font-semibold">
              Catégorie
            </td>
            <td className="border border-black p-2">{categoryName}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Marque / Modèle
            </td>
            <td className="border border-black p-2">
              {material.brand ?? "—"} {material.model ?? ""}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Numéro de série
            </td>
            <td className="border border-black p-2">
              {material.serial_number ?? "—"}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">Statut</td>
            <td className="border border-black p-2">
              {materialStatusLabels[material.status] ?? material.status}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Emplacement
            </td>
            <td className="border border-black p-2">{locationName}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Utilisateur assigné
            </td>
            <td className="border border-black p-2">{assignedUserName}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Date d&apos;acquisition
            </td>
            <td className="border border-black p-2">
              {formatDate(material.acquisition_date)}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Fin de garantie
            </td>
            <td className="border border-black p-2">
              {formatDate(material.warranty_end_date)}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Prix d&apos;achat
            </td>
            <td className="border border-black p-2">
              {formatCurrency(material.purchase_price)}
            </td>
          </tr>
          {material.description && (
            <tr>
              <td className="border border-black p-2 font-semibold">
                Description
              </td>
              <td className="border border-black p-2">
                {material.description}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mb-2 text-base font-bold">Historique des réparations</h2>
      {repairs.length === 0 ? (
        <p className="text-sm">Aucune réparation enregistrée.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-black p-2 text-left">Début</th>
              <th className="border border-black p-2 text-left">Fin</th>
              <th className="border border-black p-2 text-left">Problème</th>
              <th className="border border-black p-2 text-left">Statut</th>
              <th className="border border-black p-2 text-left">Coût</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((r) => (
              <tr key={r.id}>
                <td className="border border-black p-2">
                  {formatDate(r.start_date)}
                </td>
                <td className="border border-black p-2">
                  {formatDate(r.end_date)}
                </td>
                <td className="border border-black p-2">
                  {r.problem_description}
                </td>
                <td className="border border-black p-2">{r.status}</td>
                <td className="border border-black p-2">
                  {formatCurrency(r.cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
