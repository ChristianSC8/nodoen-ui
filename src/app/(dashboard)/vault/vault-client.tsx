"use client"

import React from "react"
import { useActionState } from "react"
import {
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiDeleteBinLine,
  RiEditLine,
  RiSearchLine,
} from "@remixicon/react"

import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Dialog"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import {
  addTerm,
  deleteTerm,
  updateTerm,
  type VaultTerm,
} from "@/lib/vault"

type VaultPagination = {
  total: number
  page: number
  per_page: number
  total_pages: number
}

type VaultClientProps = {
  initialTerms: VaultTerm[]
  initialPagination: VaultPagination | null
}

const stateVariant = (state: string) => {
  switch (state) {
    case "New":
      return "neutral"
    case "Receptive":
      return "default"
    case "Emerging":
      return "warning"
    case "Active":
      return "success"
    case "Acquired":
      return "success"
    default:
      return "neutral"
  }
}

function AddTermDialog() {
  const [state, formAction, isPending] = useActionState(addTerm, null)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (state === null && !isPending) {
      setOpen(false)
    }
  }, [state, isPending])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="inline-flex items-center gap-1.5">
          <RiAddLine className="size-4" aria-hidden="true" />
          Add Word
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Add new word</DialogTitle>
            <DialogDescription>
              Add a new word to your vocabulary vault.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="term">Word</Label>
              <Input
                id="term"
                name="term"
                placeholder="e.g. serendipity"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="translation">Translation</Label>
              <Input
                id="translation"
                name="translation"
                placeholder="e.g. serendipia"
                required
              />
            </div>
            {state?.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" isLoading={isPending} loadingText="Adding...">
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditTermDialog({ term }: { term: VaultTerm }) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const newTerm = formData.get("term") as string
    const newTranslation = formData.get("translation") as string

    const result = await updateTerm(term.id, {
      term: newTerm,
      translation: newTranslation,
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label={`Edit ${term.term}`}
        >
          <RiEditLine className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit word</DialogTitle>
            <DialogDescription>
              Update the word or its translation.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor={`edit-term-${term.id}`}>Word</Label>
              <Input
                id={`edit-term-${term.id}`}
                name="term"
                defaultValue={term.term}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-translation-${term.id}`}>Translation</Label>
              <Input
                id={`edit-translation-${term.id}`}
                name="translation"
                defaultValue={term.translation}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              isLoading={loading}
              loadingText="Saving..."
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteTermButton({ term }: { term: VaultTerm }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  async function handleDelete() {
    setLoading(true)
    await deleteTerm(term.id)
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10 dark:hover:text-red-400"
          aria-label={`Delete ${term.term}`}
        >
          <RiDeleteBinLine className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete word</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">&quot;{term.term}&quot;</span>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={loading}
            loadingText="Deleting..."
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function VaultClient({ initialTerms, initialPagination }: VaultClientProps) {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const perPage = 25

  const filtered = search
    ? initialTerms.filter(
        (t) =>
          t.term.toLowerCase().includes(search.toLowerCase()) ||
          t.translation.toLowerCase().includes(search.toLowerCase()),
      )
    : initialTerms

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  React.useEffect(() => {
    setPage(1)
  }, [search])

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Vault
          </h1>
          <p className="text-gray-500 sm:text-sm/6 dark:text-gray-500">
            Your vocabulary words and their learning progress
            {initialPagination && (
              <span className="ml-1">
                ({initialPagination.total} words)
              </span>
            )}
          </p>
        </div>
        <AddTermDialog />
      </div>
      <Divider />
      <div className="mt-4 mb-4">
        <Input
          type="search"
          placeholder="Search words..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RiSearchLine className="size-10 text-gray-300 dark:text-gray-700" />
          <p className="mt-4 text-sm text-gray-500">
            {search ? "No words match your search." : "No words in your vault yet. Add your first word!"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Word
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Translation
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    State
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:table-cell">
                    Encounters
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 md:table-cell">
                    Productions
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginated.map((term) => (
                  <tr
                    key={term.id}
                    className="bg-white transition-colors hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-50">
                      {term.term}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {term.translation}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={stateVariant(term.state)}>
                        {term.state}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-gray-600 dark:text-gray-400 sm:table-cell">
                      {term.encounter_count}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-gray-600 dark:text-gray-400 md:table-cell">
                      {term.production_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <EditTermDialog term={term} />
                        <DeleteTermButton term={term} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-2 py-1.5 text-xs"
                >
                  <RiArrowLeftSLine className="size-4" />
                  Prev
                </Button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 px-2 py-1.5 text-xs"
                >
                  Next
                  <RiArrowRightSLine className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
