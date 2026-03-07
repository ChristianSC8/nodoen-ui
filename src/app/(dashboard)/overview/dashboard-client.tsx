"use client"

import React from "react"
import {
  RiBookOpenLine,

  RiFireLine,
  RiFlashlightLine,
  RiStackLine,
  RiArrowUpSLine,
  RiArrowRightSLine,
} from "@remixicon/react"

import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { CategoryBar } from "@/components/CategoryBar"
import { Divider } from "@/components/Divider"
import { LineChart } from "@/components/LineChart"
import { ProgressCircle } from "@/components/ProgressCircle"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs"
import type {
  SummaryResponse,
  ActivityMetricsResponse,
  AccuracyMetricsResponse,
  ProgressMetricsResponse,
  WordsRankingResponse,
  StateHistoryResponse,
  GrowthResponse,
} from "@/lib/dashboard"

type DashboardClientProps = {
  summary: SummaryResponse | null
  activity: ActivityMetricsResponse | null
  accuracy: AccuracyMetricsResponse | null
  progress: ProgressMetricsResponse | null
  wordsRanking: WordsRankingResponse | null
  stateHistory: StateHistoryResponse | null
  growth: GrowthResponse | null
}

const stateColors: Record<string, string> = {
  New: "bg-gray-400 dark:bg-gray-600",
  Receptive: "bg-blue-400 dark:bg-blue-500",
  Emerging: "bg-amber-400 dark:bg-amber-500",
  Active: "bg-emerald-400 dark:bg-emerald-500",
  Acquired: "bg-violet-500 dark:bg-violet-400",
}

const stateBadgeVariant = (state: string) => {
  switch (state) {
    case "New": return "neutral" as const
    case "Receptive": return "default" as const
    case "Emerging": return "warning" as const
    case "Active": return "success" as const
    case "Acquired": return "success" as const
    default: return "neutral" as const
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

// ── Summary Cards ──

function SummaryCards({ summary }: { summary: SummaryResponse }) {
  const dist = summary.state_distribution
  const total = summary.total_words || 1
  const values = [
    (dist.New / total) * 100,
    (dist.Receptive / total) * 100,
    (dist.Emerging / total) * 100,
    (dist.Active / total) * 100,
    (dist.Acquired / total) * 100,
  ]

  return (
    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Vocabulary overview */}
      <Card>
        <dt className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Vocabulary
        </dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-50">
          {summary.total_words}
          <span className="ml-2 text-sm font-normal text-gray-500">words</span>
        </dd>
        <CategoryBar
          values={values.map((v) => Math.max(v, 0.5))}
          className="mt-6"
          colors={["gray", "blue", "amber", "emerald", "violet"]}
          showLabels={false}
        />
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
          {(["New", "Receptive", "Emerging", "Active", "Acquired"] as const).map(
            (state) => (
              <li key={state} className="flex items-center gap-1.5">
                <span
                  className={`size-2 shrink-0 rounded-sm ${stateColors[state]}`}
                  aria-hidden="true"
                />
                <span className="text-gray-600 dark:text-gray-400">
                  {state}
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-50">
                  {dist[state]}
                </span>
              </li>
            ),
          )}
        </ul>
      </Card>

      {/* Accuracy */}
      <Card>
        <dt className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Accuracy
        </dt>
        <div className="mt-4 flex flex-nowrap items-center justify-between gap-y-4">
          <dd className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-sm bg-blue-500"
                  aria-hidden="true"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Correct
                </span>
              </div>
              <span className="mt-1 block text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {Math.round(summary.accuracy_rate)}%
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-sm bg-red-500"
                  aria-hidden="true"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Incorrect
                </span>
              </div>
              <span className="mt-1 block text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {Math.round(100 - summary.accuracy_rate)}%
              </span>
            </div>
          </dd>
          <ProgressCircle
            value={Math.round(summary.accuracy_rate)}
            radius={45}
            strokeWidth={7}
          />
        </div>
      </Card>

      {/* Streak & Activity */}
      <Card>
        <dt className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Activity
        </dt>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <RiFireLine className="size-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {summary.streak_days}
              </p>
              <p className="text-xs text-gray-500">Day streak</p>
            </div>
          </div>
          <Divider className="!my-3" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Encounters</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {summary.total_encounters.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Productions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {summary.total_productions.toLocaleString()}
              </p>
            </div>
          </div>
          {summary.active_today && (
            <Badge variant="success" className="mt-1">
              <RiFlashlightLine className="size-3" /> Active today
            </Badge>
          )}
        </div>
      </Card>
    </dl>
  )
}

// ── Activity Chart ──

function ActivityChart({ activity }: { activity: ActivityMetricsResponse }) {
  const chartData = activity.daily_activity.map((d) => ({
    date: formatDate(d.date),
    Encounters: d.encounters,
    Productions: d.productions,
  }))

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Daily Activity
          </h3>
          <p className="text-xs text-gray-500">
            {activity.total_events.toLocaleString()} total events &middot;{" "}
            {activity.period}
          </p>
        </div>
        {activity.most_active_day && (
          <Badge variant="default">
            Peak: {formatDate(activity.most_active_day)}
          </Badge>
        )}
      </div>
      <LineChart
        className="mt-6 h-60"
        data={chartData}
        index="date"
        categories={["Encounters", "Productions"]}
        colors={["blue", "emerald"]}
        valueFormatter={(v: number) => v.toLocaleString()}
        showYAxis={true}
        showLegend={true}
        showGridLines={true}
      />
      {activity.by_module.length > 0 && (
        <>
          <Divider className="my-4" />
          <div className="flex flex-wrap gap-4">
            {activity.by_module.map((m) => (
              <div
                key={m.module}
                className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-1.5 dark:bg-gray-900"
              >
                <RiBookOpenLine className="size-3.5 text-gray-500" />
                <span className="text-xs font-medium capitalize text-gray-700 dark:text-gray-300">
                  {m.module}
                </span>
                <span className="text-xs text-gray-500">{m.total}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

// ── Accuracy Section ──

function AccuracySection({ accuracy }: { accuracy: AccuracyMetricsResponse }) {
  const trendData = accuracy.recent_accuracy_trend.map((d) => ({
    date: formatDate(d.date),
    Accuracy: Math.round(d.accuracy),
  }))

  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
        Accuracy Trend
      </h3>
      <p className="text-xs text-gray-500">
        {accuracy.correct_productions} / {accuracy.total_productions} correct
        productions
      </p>
      {trendData.length > 1 && (
        <LineChart
          className="mt-4 h-48"
          data={trendData}
          index="date"
          categories={["Accuracy"]}
          colors={["blue"]}
          valueFormatter={(v: number) => `${v}%`}
          showYAxis={true}
          showLegend={false}
        />
      )}
      {accuracy.top_errors.length > 0 && (
        <>
          <Divider className="my-4" />
          <h4 className="text-xs font-medium text-gray-500">Common Errors</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {accuracy.top_errors.slice(0, 5).map((err) => (
              <Badge key={err.error_type} variant="error">
                {err.error_type} ({err.count})
              </Badge>
            ))}
          </div>
        </>
      )}
      {accuracy.by_module.length > 0 && (
        <>
          <Divider className="my-4" />
          <h4 className="text-xs font-medium text-gray-500 mb-2">
            By Module
          </h4>
          <div className="space-y-2">
            {accuracy.by_module.map((m) => (
              <div
                key={m.module}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-900"
              >
                <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                  {m.module}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {m.correct}/{m.total}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {Math.round(m.accuracy_rate)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

// ── Progress Section ──

function ProgressSection({ progress }: { progress: ProgressMetricsResponse }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Learning Progress
        </h3>
        <div className="flex gap-3 text-xs text-gray-500">
          <span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">
              {progress.words_in_pipeline}
            </span>{" "}
            in pipeline
          </span>
          {progress.avg_days_to_acquire !== null && (
            <span>
              <span className="font-semibold text-gray-900 dark:text-gray-50">
                {Math.round(progress.avg_days_to_acquire)}d
              </span>{" "}
              avg to acquire
            </span>
          )}
        </div>
      </div>

      {progress.recent_transitions.length > 0 && (
        <>
          <Divider className="my-4" />
          <h4 className="text-xs font-medium text-gray-500 mb-2">
            Recent Transitions
          </h4>
          <div className="space-y-2">
            {progress.recent_transitions.slice(0, 8).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-900"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {t.term}
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <Badge variant={stateBadgeVariant(t.from_state)}>
                    {t.from_state}
                  </Badge>
                  <RiArrowRightSLine className="size-3 text-gray-400" />
                  <Badge variant={stateBadgeVariant(t.to_state)}>
                    {t.to_state}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {progress.weekly_progress.length > 0 && (
        <>
          <Divider className="my-4" />
          <h4 className="text-xs font-medium text-gray-500 mb-2">
            Weekly Progress
          </h4>
          <LineChart
            className="h-40"
            data={progress.weekly_progress.map((w) => ({
              week: w.week,
              Transitions: w.transitions,
              Acquired: w.words_acquired,
              "New Words": w.new_words_added,
            }))}
            index="week"
            categories={["Transitions", "Acquired", "New Words"]}
            colors={["blue", "violet", "emerald"]}
            valueFormatter={(v: number) => v.toString()}
            showYAxis={true}
            showLegend={true}
          />
        </>
      )}
    </Card>
  )
}

// ── Words Ranking ──

function WordsRanking({ data }: { data: WordsRankingResponse }) {
  return (
    <Card>
      <Tabs defaultValue="hardest">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Words Ranking
          </h3>
          <TabsList>
            <TabsTrigger value="hardest">Hardest</TabsTrigger>
            <TabsTrigger value="practiced">Most Practiced</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="hardest">
          {data.hardest_words.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No data yet
            </p>
          ) : (
            <TableRoot className="mt-4">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Word</TableHeaderCell>
                    <TableHeaderCell>State</TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Error Rate
                    </TableHeaderCell>
                    <TableHeaderCell className="hidden sm:table-cell">
                      Common Error
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.hardest_words.slice(0, 10).map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">
                        {w.term}
                        <span className="ml-1.5 text-xs text-gray-400">
                          {w.translation}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stateBadgeVariant(w.state)}>
                          {w.state}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {Math.round(w.error_rate)}%
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-xs text-gray-500 sm:table-cell">
                        {w.most_common_error || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableRoot>
          )}
        </TabsContent>

        <TabsContent value="practiced">
          {data.most_practiced.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No data yet
            </p>
          ) : (
            <TableRoot className="mt-4">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Word</TableHeaderCell>
                    <TableHeaderCell>State</TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Encounters
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Productions
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.most_practiced.slice(0, 10).map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">
                        {w.term}
                        <span className="ml-1.5 text-xs text-gray-400">
                          {w.translation}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stateBadgeVariant(w.state)}>
                          {w.state}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {w.encounters}
                      </TableCell>
                      <TableCell className="text-right">
                        {w.productions}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableRoot>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}

// ── State History (stacked area via lines) ──

function StateHistoryChart({ data }: { data: StateHistoryResponse }) {
  if (!data.snapshots.length) return null

  const chartData = data.snapshots.map((s) => ({
    date: formatDate(s.date),
    New: s.New,
    Receptive: s.Receptive,
    Emerging: s.Emerging,
    Active: s.Active,
    Acquired: s.Acquired,
  }))

  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
        Vault State History
      </h3>
      <p className="text-xs text-gray-500">
        How your vocabulary states evolved over time
      </p>
      <LineChart
        className="mt-4 h-60"
        data={chartData}
        index="date"
        categories={["New", "Receptive", "Emerging", "Active", "Acquired"]}
        colors={["gray", "blue", "amber", "emerald", "violet"]}
        valueFormatter={(v: number) => v.toString()}
        showYAxis={true}
        showLegend={true}
        connectNulls={true}
      />
    </Card>
  )
}

// ── Growth Chart ──

function GrowthChart({ data }: { data: GrowthResponse }) {
  if (!data.daily_growth.length) return null

  const chartData = data.daily_growth.map((g) => ({
    date: formatDate(g.date),
    "Words Added": g.words_added,
    Cumulative: g.cumulative,
  }))

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Vault Growth
          </h3>
          <p className="text-xs text-gray-500">
            {data.total_words} total &middot;{" "}
            {data.avg_words_per_week.toFixed(1)} words/week avg
          </p>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <RiArrowUpSLine className="size-4" />
          <span className="text-sm font-semibold">
            {data.avg_words_per_week.toFixed(1)}/wk
          </span>
        </div>
      </div>
      <LineChart
        className="mt-4 h-48"
        data={chartData}
        index="date"
        categories={["Cumulative"]}
        colors={["violet"]}
        valueFormatter={(v: number) => v.toString()}
        showYAxis={true}
        showLegend={false}
      />
    </Card>
  )
}

// ── Main Dashboard ──

export function DashboardClient({
  summary,
  activity,
  accuracy,
  progress,
  wordsRanking,
  stateHistory,
  growth,
}: DashboardClientProps) {
  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RiStackLine className="size-10 text-gray-300 dark:text-gray-700" />
        <p className="mt-4 text-sm text-gray-500">
          Could not load dashboard data. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Dashboard
          </h1>
          <p className="text-gray-500 sm:text-sm/6 dark:text-gray-500">
            Overview of your learning progress and vocabulary stats
          </p>
        </div>
        {summary.active_today && (
          <Badge variant="success" className="w-fit">
            <RiFlashlightLine className="size-3" />
            Active today
          </Badge>
        )}
      </div>
      <Divider />

      {/* Summary cards */}
      <section className="mt-8">
        <SummaryCards summary={summary} />
      </section>

      {/* Charts row */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {activity && <ActivityChart activity={activity} />}
        {accuracy && <AccuracySection accuracy={accuracy} />}
      </section>

      {/* Progress + Rankings */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {progress && <ProgressSection progress={progress} />}
        {wordsRanking && <WordsRanking data={wordsRanking} />}
      </section>

      {/* State history + Growth */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {stateHistory && <StateHistoryChart data={stateHistory} />}
        {growth && <GrowthChart data={growth} />}
      </section>
    </>
  )
}
