"use client"

import {
  formatCurrency,
  formatDate,
  priorityLabels,
  repairStatusLabels,
} from "@/lib/format"
import type { Repair } from "@/lib/types"

export function RepairPrintSheet({
  repair,
  materialName,
  materialCode,
  technicianName,
}: {
  repair: Repair
  materialName: string
  materialCode: string
  technicianName: string
}) {
  return (
    <div className="hidden print:block print:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-black pb-4">
        <div>
          <h1 className="text-xl font-bold">Fiche d&apos;intervention</h1>
          <p className="text-sm">
            {materialName} ({materialCode})
          </p>
        </div>
        <p className="text-xs">
          Généré le {new Date().toLocaleDateString("fr-FR")}
        </p>
      </div>

      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td className="w-1/3 border border-black p-2 font-semibold">
              Technicien
            </td>
            <td className="border border-black p-2">{technicianName}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Date de début
            </td>
            <td className="border border-black p-2">
              {formatDate(repair.start_date)}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Date de fin
            </td>
            <td className="border border-black p-2">
              {formatDate(repair.end_date)}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">Statut</td>
            <td className="border border-black p-2">
              {repairStatusLabels[repair.status] ?? repair.status}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Priorité
            </td>
            <td className="border border-black p-2">
              {priorityLabels[repair.priority] ?? repair.priority}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Problème signalé
            </td>
            <td className="border border-black p-2">
              {repair.problem_description}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Diagnostic
            </td>
            <td className="border border-black p-2">
              {repair.diagnosis ?? "—"}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Intervention réalisée
            </td>
            <td className="border border-black p-2">
              {repair.intervention ?? "—"}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Pièces remplacées
            </td>
            <td className="border border-black p-2">
              {repair.replaced_parts ?? "—"}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">Coût</td>
            <td className="border border-black p-2">
              {formatCurrency(repair.cost)}
            </td>
          </tr>
          {repair.comments && (
            <tr>
              <td className="border border-black p-2 font-semibold">
                Commentaires
              </td>
              <td className="border border-black p-2">{repair.comments}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
        <div>
          <p className="mb-8">Signature du technicien</p>
          <div className="border-t border-black pt-1">Nom et date</div>
        </div>
        <div>
          <p className="mb-8">Signature du responsable</p>
          <div className="border-t border-black pt-1">Nom et date</div>
        </div>
      </div>
    </div>
  )
}
