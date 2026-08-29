"use client"

import type { ReactNode } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Barre de recherche + filtres, réutilisée par toutes les listes. */
export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Rechercher…",
  onReset,
  showReset,
  children,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  onReset?: () => void
  showReset?: boolean
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
          aria-label="Recherche"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {showReset && onReset ? (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5">
            <X className="size-4" />
            Réinitialiser
          </Button>
        ) : null}
      </div>
    </div>
  )
}

/** Petit select stylé pour les filtres de la barre. */
export function FilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
  width = "w-[170px]",
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: { label: string; value: string }[]
  width?: string
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger size="sm" className={width}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
