"use client"

import React from "react"
import {
  RiBookOpenLine,
  RiLightbulbLine,
  RiQuestionLine,
  RiSendPlane2Line,
  RiSparkling2Line,
  RiLoader2Fill,
} from "@remixicon/react"

import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import {
  generateReading,
  type ReadingResult,
  type TargetWord,
} from "@/lib/reading"

type ReadingClientProps = {
  initialLevel: string
  initialLang: string
}

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

function highlightTargetWords(text: string, targets: TargetWord[]): React.ReactNode {
  if (!targets.length) return text

  const words = targets.map((t) => t.word.toLowerCase())
  const regex = new RegExp(`\\b(${words.join("|")})\\w*\\b`, "gi")

  const parts = text.split(regex)

  return parts.map((part, i) => {
    if (words.some((w) => part.toLowerCase().startsWith(w.toLowerCase()))) {
      return (
        <span
          key={i}
          className="rounded bg-blue-100 px-1 font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
        >
          {part}
        </span>
      )
    }
    return part
  })
}

function EmptyState({ onGenerate, loading }: { onGenerate: () => void; loading: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="rounded-xl bg-gradient-to-b from-blue-50 to-blue-100 p-5 dark:from-blue-950 dark:to-blue-900/50">
        <RiBookOpenLine className="size-10 text-blue-500 dark:text-blue-400" />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-50">
        Start a reading session
      </h2>
      <p className="mt-2 max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
        Generate a personalized text based on your vocabulary level. The text
        will include words from your vault to help you learn in context.
      </p>
      <Button
        onClick={onGenerate}
        className="mt-6 inline-flex items-center gap-2"
        isLoading={loading}
        loadingText="Generating..."
      >
        <RiSparkling2Line className="size-4" aria-hidden="true" />
        Generate Text
      </Button>
    </div>
  )
}

function VaultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="rounded-xl bg-gradient-to-b from-amber-50 to-amber-100 p-5 dark:from-amber-950 dark:to-amber-900/50">
        <RiLightbulbLine className="size-10 text-amber-500 dark:text-amber-400" />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-50">
        Your vault is empty
      </h2>
      <p className="mt-2 max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
        Add some words to your vault first. The reading module uses your
        vocabulary to generate personalized texts.
      </p>
    </div>
  )
}

function ReadingView({
  result,
  onNewText,
  loading,
}: {
  result: ReadingResult
  onNewText: () => void
  loading: boolean
}) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [question, setQuestion] = React.useState("")
  const [asking, setAsking] = React.useState(false)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || asking) return

    const userMessage = question.trim()
    setQuestion("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setAsking(true)

    try {
      const res = await fetch("/api/reading/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: result.session_id,
          message: userMessage,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }))
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: err.error || "Something went wrong." },
        ])
        setAsking(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let assistantText = ""

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantText,
          }
          return updated
        })
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ])
    }

    setAsking(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main text */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiBookOpenLine className="size-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                {result.topic_used}
              </h3>
            </div>
            <Button
              variant="secondary"
              onClick={onNewText}
              isLoading={loading}
              loadingText="Generating..."
              className="inline-flex items-center gap-1.5 text-xs"
            >
              <RiSparkling2Line className="size-3.5" aria-hidden="true" />
              New Text
            </Button>
          </div>
          <Divider className="my-4" />
          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
            <p className="leading-7 whitespace-pre-wrap">
              {highlightTargetWords(result.text, result.target_words_used)}
            </p>
          </div>
        </Card>

        {/* Chat */}
        <Card>
          <div className="flex items-center gap-2">
            <RiQuestionLine className="size-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-50">
              Ask about the text
            </h3>
          </div>
          <Divider className="my-4" />

          {messages.length > 0 && (
            <div className="mb-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {msg.content || (
                      <RiLoader2Fill className="size-4 animate-spin" />
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          <form onSubmit={handleAsk} className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask a question about the text..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={asking}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!question.trim() || asking}
              className="shrink-0"
            >
              <RiSendPlane2Line className="size-4" />
            </Button>
          </form>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Target words */}
        <Card>
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50">
            <span className="inline-flex size-6 items-center justify-center rounded-md bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              {result.target_words_used.length}
            </span>
            Target Words
          </h3>
          <Divider className="my-3" />
          <ul className="space-y-2">
            {result.target_words_used.map((tw) => (
              <li key={tw.word}>
                <Badge variant="default" className="mr-2">
                  {tw.word}
                </Badge>
                <span className="text-xs italic text-gray-500 dark:text-gray-400">
                  &quot;{tw.fragment}&quot;
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Learning note */}
        <Card>
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50">
            <RiLightbulbLine className="size-5 text-amber-500" />
            Learning Note
          </h3>
          <Divider className="my-3" />
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {result.learning_note}
          </p>
        </Card>
      </div>
    </div>
  )
}

export function ReadingClient({ initialLevel, initialLang }: ReadingClientProps) {
  const [result, setResult] = React.useState<ReadingResult | null>(null)
  const [vaultEmpty, setVaultEmpty] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [topic, setTopic] = React.useState("")

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setVaultEmpty(false)

    const res = await generateReading(
      initialLevel,
      initialLang,
      topic || undefined,
    )

    setLoading(false)

    if ("error" in res) {
      setError(res.error)
      return
    }

    if ("status" in res) {
      setVaultEmpty(true)
      return
    }

    setResult(res)
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Reading
          </h1>
          <p className="text-gray-500 sm:text-sm/6 dark:text-gray-500">
            Practice reading with AI-generated texts tailored to your level
          </p>
        </div>
      </div>
      <Divider />

      {!result && !vaultEmpty && (
        <div className="mt-6">
          <div className="mx-auto max-w-md">
            <div className="space-y-1">
              <Label htmlFor="topic">Topic (optional)</Label>
              <Input
                id="topic"
                placeholder="e.g. travel, food, technology..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Leave empty for a random topic based on your vocabulary
              </p>
            </div>
          </div>
          {error && (
            <p className="mt-4 text-center text-sm text-red-500">{error}</p>
          )}
          <EmptyState onGenerate={handleGenerate} loading={loading} />
        </div>
      )}

      {vaultEmpty && <VaultEmptyState />}

      {result && (
        <div className="mt-6">
          <ReadingView
            result={result}
            onNewText={() => {
              setResult(null)
              setTopic("")
            }}
            loading={loading}
          />
        </div>
      )}
    </>
  )
}
