import {
  fetchSummary,
  fetchActivity,
  fetchAccuracy,
  fetchProgress,
  fetchWordsRanking,
  fetchStateHistory,
  fetchGrowth,
} from "@/lib/dashboard"
import { DashboardClient } from "./dashboard-client"

export default async function OverviewPage() {
  const [summary, activity, accuracy, progress, wordsRanking, stateHistory, growth] =
    await Promise.all([
      fetchSummary(),
      fetchActivity("30d"),
      fetchAccuracy("30d"),
      fetchProgress(),
      fetchWordsRanking(),
      fetchStateHistory(),
      fetchGrowth(),
    ])

  return (
    <main>
      <DashboardClient
        summary={summary}
        activity={activity}
        accuracy={accuracy}
        progress={progress}
        wordsRanking={wordsRanking}
        stateHistory={stateHistory}
        growth={growth}
      />
    </main>
  )
}
