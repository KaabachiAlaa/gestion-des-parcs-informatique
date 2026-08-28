"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsUpDown, Search, ArrowUp, ArrowDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type Column<T> = {
  key: string
  header: string
  sortable?: boolean
  className?: string
  accessor?: (row: T) => string | number | null | undefined
  render?: (row: T) => React.ReactNode
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  searchPlaceholder?: string
  searchKeys?: (keyof T | string)[]
  getRowId: (row: T) => string | number
  onRowClick?: (row: T) => void
  toolbar?: React.ReactNode
  filters?: React.ReactNode
  emptyLabel?: string
  pageSize?: number
}

function getValue<T>(row: T, col: Column<T>): string | number | null | undefined {
  if (col.accessor) return col.accessor(row)
  return (row as Record<string, unknown>)[col.key] as string | number | null | undefined
}

export function DataTable<T>({
  columns,
  data,
  loading,
  searchPlaceholder = "Rechercher...",
  searchKeys,
  getRowId,
  onRowClick,
  toolbar,
  filters,
  emptyLabel = "Aucun résultat",
  pageSize = 10,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let rows = data
    if (query.trim()) {
      const q = query.toLowerCase()
      const keys = searchKeys ?? columns.map((c) => c.key)
      rows = rows.filter((row) =>
        keys.some((k) => {
          const v = (row as Record<string, unknown>)[k as string]
          return v != null && String(v).toLowerCase().includes(q)
        }),
      )
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey)
      if (col) {
        rows = [...rows].sort((a, b) => {
          const av = getValue(a, col)
          const bv = getValue(b, col)
          if (av == null) return 1
          if (bv == null) return -1
          if (typeof av === "number" && typeof bv === "number") {
            return sortDir === "asc" ? av - bv : bv - av
          }
          return sortDir === "asc"
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av))
        })
      }
    }
    return rows
  }, [data, query, searchKeys, columns, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder={searchPlaceholder}
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters}
          {toolbar}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-3 py-2.5 text-left font-semibold text-muted-foreground",
                      col.className,
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {col.header}
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : (
                            <ArrowDown className="size-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-3">
                        <Skeleton className="h-4 w-full max-w-[160px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-12 text-center text-muted-foreground">
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                paged.map((row) => (
                  <tr
                    key={getRowId(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-3 py-2.5 align-middle", col.className)}>
                        {col.render ? col.render(row) : (getValue(row, col) ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length} élément{filtered.length > 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
