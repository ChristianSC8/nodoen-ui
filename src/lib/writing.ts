"use server"

import { api } from "./api"
import { getSession } from "./auth"

export type VaultWordDetected = {
  term: string
  fragment: string
  is_correct: boolean
  error_type: string | null
}

export type WritingFeedback = {
  session_id: string
  original: string
  corrected: string
  natural_version: string
  vault_words_detected: VaultWordDetected[]
  explanation: string | null
  fun_fact: string
}

export async function submitWriting(
  text: string,
  level: string,
  lang: string,
): Promise<WritingFeedback | { error: string }> {
  const token = await getSession()
  if (!token) return { error: "Not authenticated" }

  try {
    return await api<WritingFeedback>("/writing/feedback", {
      method: "POST",
      body: { text, level, lang },
      token,
    })
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to get feedback",
    }
  }
}
