// Mock client for the /users resource. Mirrors app/routers/users.py.

import { MOCK_USERS, paginate } from "@/lib/mock-data";
import type { PaginatedResult, Role, User } from "@/lib/types";

let users = [...MOCK_USERS];

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface UserSearchParams {
  q?: string;
  role?: Role | "all";
  is_active?: boolean | "all";
  page?: number;
  limit?: number;
}

export async function searchUsers(
  params: UserSearchParams = {},
): Promise<PaginatedResult<User>> {
  const { q, role, is_active, page = 1, limit = 10 } = params;
  let filtered = users;

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.first_name.toLowerCase().includes(query) ||
        u.last_name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query),
    );
  }
  if (role && role !== "all") filtered = filtered.filter((u) => u.role === role);
  if (typeof is_active === "boolean") filtered = filtered.filter((u) => u.is_active === is_active);

  return delay(paginate(filtered, page, limit));
}

export async function getUser(id: number): Promise<User | undefined> {
  return delay(users.find((u) => u.id === id));
}

export async function createUser(input: Omit<User, "id" | "created_at">): Promise<User> {
  const created: User = {
    ...input,
    id: Math.max(0, ...users.map((u) => u.id)) + 1,
    created_at: new Date().toISOString(),
  };
  users = [created, ...users];
  return delay(created);
}

export async function updateUser(id: number, input: Partial<User>): Promise<User | undefined> {
  users = users.map((u) => (u.id === id ? { ...u, ...input } : u));
  return delay(users.find((u) => u.id === id));
}

export async function toggleUserActive(id: number): Promise<User | undefined> {
  users = users.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u));
  return delay(users.find((u) => u.id === id));
}
