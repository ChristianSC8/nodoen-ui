"use client"

import React from "react"
import { RiBookletLine, RiSearchLine } from "@remixicon/react"

import { Badge } from "@/components/Badge"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"
import { Input } from "@/components/Input"
import { cx, focusRing } from "@/lib/utils"
import type { VaultTerm } from "@/lib/vault"

const stateVariant = (state: string) => {
  switch (state) {
    case "New": return "neutral" as const
    case "Receptive": return "default" as const
    case "Emerging": return "warning" as const
    case "Active": return "success" as const
    case "Acquired": return "success" as const
    default: return "neutral" as const
  }
}

type VaultSearchProps = {
  terms: VaultTerm[]
}

export function VaultSearch({ terms }: VaultSearchProps) {
  const [search, setSearch] = React.useState("")
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "x" || e.key === "X")) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const sorted = React.useMemo(
    () => [...terms].sort((a, b) => a.term.localeCompare(b.term)),
    [terms],
  )

  const filtered = search
    ? sorted.filter(
        (t) =>
          t.term.toLowerCase().includes(search.toLowerCase()) ||
          t.translation.toLowerCase().includes(search.toLowerCase()),
      )
    : sorted

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          aria-label="Search vault"
          className={cx(
            focusRing,
            "group rounded-full p-1 hover:bg-gray-100 data-[state=open]:bg-gray-100 hover:dark:bg-gray-400/10 data-[state=open]:dark:bg-gray-400/10",
          )}
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-900 hover:dark:bg-gray-400/10">
            <RiBookletLine
              className="-ml-px size-4 shrink-0 text-gray-700 group-hover:text-gray-900 dark:text-gray-300 group-hover:dark:text-gray-50"
              aria-hidden="true"
            />
          </span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Vault</DrawerTitle>
          <p className="text-sm text-gray-500">{terms.length} words</p>
        </DrawerHeader>
        <div className="pb-3">
          <Input
            type="search"
            placeholder="Search words or translations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DrawerBody className="overflow-y-auto !py-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RiSearchLine className="size-8 text-gray-300 dark:text-gray-700" />
              <p className="mt-3 text-sm text-gray-500">
                No words match &quot;{search}&quot;
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {filtered.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {t.term}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {t.translation}
                    </p>
                  </div>
                  <Badge
                    variant={stateVariant(t.state)}
                    className="ml-3 shrink-0"
                  >
                    {t.state}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
