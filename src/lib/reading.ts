"use server"

import { api } from "./api"
import { getSession } from "./auth"

export type TargetWord = {
  word: string
  fragment: string
}

export type ReadingResult = {
  session_id: string
  text: string
  topic_used: string
  target_words_used: TargetWord[]
  learning_note: string
}

export type VaultEmptyResult = {
  status: string
}

export async function generateReading(
  level: string,
  lang: string,
  topic?: string,
): Promise<ReadingResult | VaultEmptyResult | { error: string }> {
  const token = await getSession()
  if (!token) return { error: "Not authenticated" }

  try {
    const body: Record<string, string> = { level, lang }
    if (topic) body.topic = topic

    return await api<ReadingResult | VaultEmptyResult>("/reading/generate", {
      method: "POST",
      body,
      token,
    })
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to generate reading",
    }
  }
}
