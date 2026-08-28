"use client"

import useSWR from "swr"
import { fetcher } from "./api"
import type { Category, Location, Role, User } from "./types"
import { useMemo } from "react"

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    "/categories/",
    fetcher,
  )
  return { categories: data ?? [], error, isLoading, mutate }
}

export function useLocations() {
  const { data, error, isLoading, mutate } = useSWR<Location[]>(
    "/locations/",
    fetcher,
  )
  return { locations: data ?? [], error, isLoading, mutate }
}

export function useRoles() {
  const { data, error, isLoading } = useSWR<Role[]>("/roles/", fetcher)
  return { roles: data ?? [], error, isLoading }
}

// Users require admin; swallow errors gracefully for non-admins.
export function useUsers(enabled = true) {
  const { data, error, isLoading, mutate } = useSWR<User[]>(
    enabled ? "/users/" : null,
    fetcher,
    { shouldRetryOnError: false },
  )
  return { users: data ?? [], error, isLoading, mutate }
}

export function useCategoryMap() {
  const { categories } = useCategories()
  return useMemo(() => {
    const m = new Map<number, string>()
    categories.forEach((c) => m.set(c.id, c.name))
    return m
  }, [categories])
}

export function useLocationMap() {
  const { locations } = useLocations()
  return useMemo(() => {
    const m = new Map<number, string>()
    locations.forEach((l) => m.set(l.id, l.place))
    return m
  }, [locations])
}

export function useUserMap(enabled = true) {
  const { users } = useUsers(enabled)
  return useMemo(() => {
    const m = new Map<number, string>()
    users.forEach((u) => m.set(u.id, `${u.first_name} ${u.last_name}`.trim() || u.username))
    return m
  }, [users])
}
