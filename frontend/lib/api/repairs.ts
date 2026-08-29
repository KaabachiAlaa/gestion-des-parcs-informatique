// Mock client for the /repairs resource. Mirrors app/routers/repairs.py.

import { MOCK_REPAIRS, paginate } from "@/lib/mock-data";
import type { PaginatedResult, Repair, RepairPriority, RepairStatus } from "@/lib/types";

let repairs = [...MOCK_REPAIRS];

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface RepairSearchParams {
  q?: string;
  status?: RepairStatus | "all";
  priority?: RepairPriority | "all";
  technician_id?: number | "all";
  material_id?: number;
  page?: number;
  limit?: number;
}

export async function searchRepairs(
  params: RepairSearchParams = {},
): Promise<PaginatedResult<Repair>> {
  const { q, status, priority, technician_id, material_id, page = 1, limit = 10 } = params;
  let filtered = repairs;

  if (material_id) {
    filtered = filtered.filter((r) => r.material.id === material_id);
  }
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.description.toLowerCase().includes(query) ||
        r.material.name.toLowerCase().includes(query) ||
        r.material.asset_code.toLowerCase().includes(query),
    );
  }
  if (status && status !== "all") filtered = filtered.filter((r) => r.status === status);
  if (priority && priority !== "all") filtered = filtered.filter((r) => r.priority === priority);
  if (technician_id && technician_id !== "all")
    filtered = filtered.filter((r) => r.technician.id === technician_id);

  filtered = [...filtered].sort(
    (a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime(),
  );

  return delay(paginate(filtered, page, limit));
}

export async function getRepair(id: number): Promise<Repair | undefined> {
  return delay(repairs.find((r) => r.id === id));
}

export async function updateRepair(
  id: number,
  input: Partial<Repair>,
): Promise<Repair | undefined> {
  repairs = repairs.map((r) => (r.id === id ? { ...r, ...input } : r));
  return delay(repairs.find((r) => r.id === id));
}
