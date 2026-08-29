// Mock client for reference data: categories, locations, roles.
// Mirrors app/routers/category.py, location.py, roles.py.

import { MOCK_CATEGORIES, MOCK_LOCATIONS, MOCK_ROLES } from "@/lib/mock-data";
import type { Category, Location, RoleRecord } from "@/lib/types";

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getCategories(): Promise<Category[]> {
  return delay(MOCK_CATEGORIES);
}

export async function getLocations(): Promise<Location[]> {
  return delay(MOCK_LOCATIONS);
}

export async function getRoles(): Promise<RoleRecord[]> {
  return delay(MOCK_ROLES);
}
