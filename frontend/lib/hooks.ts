import useSWR from "swr"
import {
  categoriesApi,
  locationsApi,
  materialsApi,
  repairsApi,
  requestsApi,
  rolesApi,
  usersApi,
} from "./api"

export function useMaterials() {
  const { data, error, isLoading, mutate } = useSWR(
    "materials",
    materialsApi.list
  )
  return { materials: data ?? [], error, isLoading, mutate }
}

export function useRepairs() {
  const { data, error, isLoading, mutate } = useSWR("repairs", repairsApi.list)
  return { repairs: data ?? [], error, isLoading, mutate }
}

export function useRequests() {
  const { data, error, isLoading, mutate } = useSWR(
    "requests",
    requestsApi.list
  )
  return { requests: data ?? [], error, isLoading, mutate }
}

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR("users", usersApi.list)
  return { users: data ?? [], error, isLoading, mutate }
}

export function useRoles() {
  const { data, error, isLoading, mutate } = useSWR("roles", rolesApi.list)
  return { roles: data ?? [], error, isLoading, mutate }
}

export function useLocations() {
  const { data, error, isLoading, mutate } = useSWR(
    "locations",
    locationsApi.list
  )
  return { locations: data ?? [], error, isLoading, mutate }
}

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR(
    "categories",
    categoriesApi.list
  )
  return { categories: data ?? [], error, isLoading, mutate }
}
