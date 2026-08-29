// Mock client for the /requests resource. Mirrors app/routers/request.py.

import { MOCK_REQUESTS, paginate } from "@/lib/mock-data";
import type {
  PaginatedResult,
  RequestPriority,
  RequestStatus,
  RequestType,
  ServiceRequest,
} from "@/lib/types";

let requests = [...MOCK_REQUESTS];

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface RequestSearchParams {
  q?: string;
  type?: RequestType | "all";
  status?: RequestStatus | "all";
  priority?: RequestPriority | "all";
  page?: number;
  limit?: number;
}

export async function searchRequests(
  params: RequestSearchParams = {},
): Promise<PaginatedResult<ServiceRequest>> {
  const { q, type, status, priority, page = 1, limit = 10 } = params;
  let filtered = requests;

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.code.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query),
    );
  }
  if (type && type !== "all") filtered = filtered.filter((r) => r.type === type);
  if (status && status !== "all") filtered = filtered.filter((r) => r.status === status);
  if (priority && priority !== "all") filtered = filtered.filter((r) => r.priority === priority);

  filtered = [...filtered].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return delay(paginate(filtered, page, limit));
}

export async function getRequest(id: number): Promise<ServiceRequest | undefined> {
  return delay(requests.find((r) => r.id === id));
}

export async function createRequest(
  input: Pick<ServiceRequest, "type" | "title" | "description" | "priority" | "created_by">,
): Promise<ServiceRequest> {
  const now = new Date().toISOString();
  const created: ServiceRequest = {
    ...input,
    id: Math.max(0, ...requests.map((r) => r.id)) + 1,
    code: `DEM-${String(Math.max(0, ...requests.map((r) => r.id)) + 1).padStart(4, "0")}`,
    status: "OUVERTE",
    assigned_to: null,
    resolution_notes: null,
    created_at: now,
    updated_at: now,
  };
  requests = [created, ...requests];
  return delay(created);
}

export async function updateRequest(
  id: number,
  input: Partial<ServiceRequest>,
): Promise<ServiceRequest | undefined> {
  requests = requests.map((r) =>
    r.id === id ? { ...r, ...input, updated_at: new Date().toISOString() } : r,
  );
  return delay(requests.find((r) => r.id === id));
}
