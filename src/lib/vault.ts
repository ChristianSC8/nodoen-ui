"use server"

import { revalidatePath } from "next/cache"
import { api } from "./api"
import { getSession } from "./auth"

export type VaultState = "New" | "Receptive" | "Emerging" | "Active" | "Acquired"

export type VaultTerm = {
  id: string
  term: string
  translation: string
  state: VaultState
  encounter_count: number
  production_count: number
  correct_production_count: number
  sessions_with_production: number
  last_encounter: string | null
  last_production: string | null
  added_at: string
}

export type PaginatedVault = {
  data: VaultTerm[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

export async function fetchVault(
  page = 1,
  perPage = 25,
): Promise<PaginatedVault | null> {
  const token = await getSession()
  if (!token) return null

  try {
    return await api<PaginatedVault>(
      `/vault?page=${page}&per_page=${perPage}`,
      { token },
    )
  } catch {
    return null
  }
}

export async function addTerm(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const token = await getSession()
  if (!token) return { error: "Not authenticated" }

  const term = formData.get("term") as string
  const translation = formData.get("translation") as string

  try {
    await api("/vault", {
      method: "POST",
      body: { term, translation },
      token,
    })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to add term",
    }
  }

  revalidatePath("/vault")
  return null
}

export async function updateTerm(
  id: string,
  data: { term?: string; translation?: string },
): Promise<{ error: string } | null> {
  const token = await getSession()
  if (!token) return { error: "Not authenticated" }

  try {
    await api(`/vault/${id}`, {
      method: "PATCH",
      body: data,
      token,
    })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update term",
    }
  }

  revalidatePath("/vault")
  return null
}

export async function deleteTerm(id: string): Promise<{ error: string } | null> {
  const token = await getSession()
  if (!token) return { error: "Not authenticated" }

  try {
    await api(`/vault/${id}`, { method: "DELETE", token })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete term",
    }
  }

  revalidatePath("/vault")
  return null
}
