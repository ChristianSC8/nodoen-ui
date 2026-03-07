"use server"

import { api } from "./api"
import { getSession } from "./auth"

// ── Types ──

export type StateDistribution = {
  New: number
  Receptive: number
  Emerging: number
  Active: number
  Acquired: number
}

export type SummaryResponse = {
  total_words: number
  state_distribution: StateDistribution
  acquisition_rate: number
  accuracy_rate: number
  total_encounters: number
  total_productions: number
  streak_days: number
  active_today: boolean
}

export type DailyActivity = {
  date: string
  encounters: number
  productions: number
  total: number
}

export type ModuleActivity = {
  module: string
  encounters: number
  productions: number
  total: number
}

export type ActivityMetricsResponse = {
  period: string
  daily_activity: DailyActivity[]
  by_module: ModuleActivity[]
  total_events: number
  streak_days: number
  most_active_day: string | null
}

export type ModuleAccuracy = {
  module: string
  total: number
  correct: number
  incorrect: number
  accuracy_rate: number
}

export type ErrorTypeCount = {
  error_type: string
  count: number
}

export type AccuracyMetricsResponse = {
  overall_accuracy: number
  total_productions: number
  correct_productions: number
  by_module: ModuleAccuracy[]
  top_errors: ErrorTypeCount[]
  recent_accuracy_trend: { date: string; accuracy: number; total: number }[]
}

export type TransitionEntry = {
  id: string
  vault_id: string
  term: string
  from_state: string
  to_state: string
  created_at: string
}

export type WeeklyProgress = {
  week: string
  transitions: number
  words_acquired: number
  new_words_added: number
}

export type ProgressMetricsResponse = {
  recent_transitions: TransitionEntry[]
  weekly_progress: WeeklyProgress[]
  total_transitions: number
  avg_days_to_acquire: number | null
  words_in_pipeline: number
}

export type HardestWord = {
  id: string
  term: string
  translation: string
  state: string
  total_productions: number
  incorrect_productions: number
  error_rate: number
  most_common_error: string | null
}

export type MostPracticedWord = {
  id: string
  term: string
  translation: string
  state: string
  encounters: number
  productions: number
  total_interactions: number
}

export type WordsRankingResponse = {
  hardest_words: HardestWord[]
  most_practiced: MostPracticedWord[]
}

export type HeatmapCell = {
  day: number
  hour: number
  count: number
}

export type HeatmapResponse = {
  heatmap: HeatmapCell[]
  most_active_hour: number | null
  most_active_day: number | null
  day_labels: string[]
}

export type StateSnapshot = {
  date: string
  New: number
  Receptive: number
  Emerging: number
  Active: number
  Acquired: number
  total: number
}

export type StateHistoryResponse = {
  snapshots: StateSnapshot[]
}

export type GrowthEntry = {
  date: string
  words_added: number
  cumulative: number
}

export type GrowthResponse = {
  daily_growth: GrowthEntry[]
  total_words: number
  avg_words_per_week: number
}

// ── Fetchers ──

async function dashboardFetch<T>(endpoint: string): Promise<T | null> {
  const token = await getSession()
  if (!token) return null
  try {
    return await api<T>(`/dashboard${endpoint}`, { token })
  } catch {
    return null
  }
}

export async function fetchSummary() {
  return dashboardFetch<SummaryResponse>("/summary")
}
export async function fetchActivity(period = "30d") {
  return dashboardFetch<ActivityMetricsResponse>(`/activity?period=${period}`)
}
export async function fetchAccuracy(period = "30d") {
  return dashboardFetch<AccuracyMetricsResponse>(`/accuracy?period=${period}`)
}
export async function fetchProgress() {
  return dashboardFetch<ProgressMetricsResponse>("/progress")
}
export async function fetchWordsRanking() {
  return dashboardFetch<WordsRankingResponse>("/words-ranking")
}
export async function fetchHeatmap() {
  return dashboardFetch<HeatmapResponse>("/heatmap")
}
export async function fetchStateHistory() {
  return dashboardFetch<StateHistoryResponse>("/state-history")
}
export async function fetchGrowth() {
  return dashboardFetch<GrowthResponse>("/growth")
}
