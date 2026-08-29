// Mock client for the /materials resource. Structured 1:1 with the real
// FastAPI endpoints (app/routers/materials.py) so this file is a small diff
// away from real `fetch` calls against http://127.0.0.1:8000.

import { MOCK_MATERIALS, paginate } from "@/lib/mock-data";
import type { Material, MaterialStatus, PaginatedResult } from "@/lib/types";

let materials = [...MOCK_MATERIALS];

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface MaterialSearchParams {
  q?: string;
  status?: MaterialStatus | "all";
  category_id?: number | "all";
  location_id?: number | "all";
  page?: number;
  limit?: number;
}

// Mirrors GET /materials/search
export async function searchMaterials(
  params: MaterialSearchParams = {},
): Promise<PaginatedResult<Material>> {
  const { q, status, category_id, location_id, page = 1, limit = 10 } = params;
  let filtered = materials;

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.asset_code.toLowerCase().includes(query) ||
        m.serial_number.toLowerCase().includes(query) ||
        m.brand.toLowerCase().includes(query),
    );
  }
  if (status && status !== "all") {
    filtered = filtered.filter((m) => m.status === status);
  }
  if (category_id && category_id !== "all") {
    filtered = filtered.filter((m) => m.category.id === category_id);
  }
  if (location_id && location_id !== "all") {
    filtered = filtered.filter((m) => m.location.id === location_id);
  }

  return delay(paginate(filtered, page, limit));
}

// Mirrors GET /materials/{id}
export async function getMaterial(id: number): Promise<Material | undefined> {
  return delay(materials.find((m) => m.id === id));
}

// Mirrors POST /materials
export async function createMaterial(
  input: Omit<Material, "id">,
): Promise<Material> {
  const created: Material = { ...input, id: Math.max(0, ...materials.map((m) => m.id)) + 1 };
  materials = [created, ...materials];
  return delay(created);
}

// Mirrors PUT /materials/{id}
export async function updateMaterial(
  id: number,
  input: Partial<Material>,
): Promise<Material | undefined> {
  materials = materials.map((m) => (m.id === id ? { ...m, ...input } : m));
  return delay(materials.find((m) => m.id === id));
}

// Mirrors DELETE /materials/{id}
export async function deleteMaterial(id: number): Promise<void> {
  materials = materials.filter((m) => m.id !== id);
  return delay(undefined);
}
