"use server"

import { api } from "./api"
import { getSession } from "./auth"

export type Preferences = {
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  lang: "en" | "es"
}

export async function fetchPreferences(): Promise<Preferences | null> {
  const token = await getSession()
  if (!token) return null

  try {
    return await api<Preferences>("/preferences", { token })
  } catch {
    return null
  }
}

export async function updatePreferences(
  data: Partial<Preferences>,
): Promise<Preferences | null> {
  const token = await getSession()
  if (!token) return null

  try {
    return await api<Preferences>("/preferences", {
      method: "PATCH",
      body: data,
      token,
    })
  } catch {
    return null
  }
}
