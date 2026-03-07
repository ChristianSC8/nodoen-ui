"use client"

import React from "react"
import {
  RiCheckLine,
  RiCloseLine,
  RiEditLine,
  RiLightbulbLine,
  RiLoader2Fill,
  RiMagicLine,
  RiQuestionLine,
  RiSendPlane2Line,
  RiSparklingLine,
} from "@remixicon/react"

import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import { Textarea } from "@/components/Textarea"
import {
  submitWriting,
  type WritingFeedback,
  type VaultWordDetected,
} from "@/lib/writing"

type WritingClientProps = {
  initialLevel: string
  initialLang: string
}

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

function DiffView({
  original,
  corrected,
}: {
  original: string
  corrected: string
}) {
  const hasChanges = original !== corrected

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Original
        </p>
        <p className="rounded-md bg-gray-50 px-3 py-2 text-sm leading-relaxed text-gray-700 dark:bg-gray-900 dark:text-gray-300">
          {original}
        </p>
      </div>
      <div>
        <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {hasChanges ? (
            <>
              <RiEditLine className="size-3" />
              Corrected
            </>
          ) : (
            <>
              <RiCheckLine className="size-3 text-emerald-500" />
              No corrections needed
            </>
          )}
        </p>
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm leading-relaxed text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          {corrected}
        </p>
      </div>
    </div>
  )
}

function VaultWordsList({ words }: { words: VaultWordDetected[] }) {
  if (!words.length) return null

  return (
    <ul className="space-y-2">
      {words.map((w, i) => (
        <li
          key={i}
          className="flex items-start gap-2 rounded-md border border-gray-100 px-3 py-2 dark:border-gray-800"
        >
          <span className="mt-0.5">
            {w.is_correct ? (
              <RiCheckLine className="size-4 text-emerald-500" />
            ) : (
              <RiCloseLine className="size-4 text-red-500" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant={w.is_correct ? "success" : "error"}>
                {w.term}
              </Badge>
              {w.error_type && (
                <span className="text-xs text-gray-500">{w.error_type}</span>
              )}
            </div>
            <p className="mt-1 text-xs italic text-gray-500 dark:text-gray-400">
              &quot;{w.fragment}&quot;
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function WritingForm({
  onSubmit,
  loading,
}: {
  onSubmit: (text: string) => void
  loading: boolean
}) {
  const [text, setText] = React.useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (text.trim()) onSubmit(text.trim())
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-xl bg-gradient-to-b from-indigo-50 to-indigo-100 p-5 dark:from-indigo-950 dark:to-indigo-900/50">
        <RiEditLine className="size-10 text-indigo-500 dark:text-indigo-400" />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-50">
        Write something in English
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
        Write a short text and get AI-powered feedback with corrections, a
        natural version, and insights about your vault words.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 w-full max-w-lg space-y-4">
        <Textarea
          placeholder="Write your text here... (e.g. describe your day, tell a story, share an opinion)"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {text.length} / 2000 characters
          </span>
          <Button
            type="submit"
            disabled={!text.trim()}
            isLoading={loading}
            loadingText="Analyzing..."
            className="inline-flex items-center gap-1.5"
          >
            <RiMagicLine className="size-4" aria-hidden="true" />
            Get Feedback
          </Button>
        </div>
      </form>
    </div>
  )
}

function FeedbackView({
  feedback,
  onNewWriting,
}: {
  feedback: WritingFeedback
  onNewWriting: () => void
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
      const res = await fetch("/api/writing/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: feedback.session_id,
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
      {/* Main feedback */}
      <div className="space-y-6 lg:col-span-2">
        {/* Corrections */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50">
              <RiEditLine className="size-5 text-indigo-500" />
              Corrections
            </h3>
            <Button
              variant="secondary"
              onClick={onNewWriting}
              className="text-xs"
            >
              Write Again
            </Button>
          </div>
          <Divider className="my-4" />
          <DiffView
            original={feedback.original}
            corrected={feedback.corrected}
          />
        </Card>

        {/* Natural version */}
        <Card>
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50">
            <RiSparklingLine className="size-5 text-violet-500" />
            Natural Version
          </h3>
          <Divider className="my-4" />
          <p className="rounded-md bg-violet-50 px-3 py-2 text-sm leading-relaxed text-violet-800 dark:bg-violet-950/30 dark:text-violet-300">
            {feedback.natural_version}
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            How a native speaker might express the same idea
          </p>
        </Card>

        {/* Chat */}
        <Card>
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50">
            <RiQuestionLine className="size-5 text-indigo-500" />
            Ask about your writing
          </h3>
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
                        ? "bg-indigo-500 text-white"
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
              placeholder="Why was this corrected? Can you explain...?"
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
        {/* Vault words */}
        {feedback.vault_words_detected.length > 0 && (
          <Card>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50">
              <span className="inline-flex size-6 items-center justify-center rounded-md bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                {feedback.vault_words_detected.length}
              </span>
              Vault Words Used
            </h3>
            <Divider className="my-3" />
            <VaultWordsList words={feedback.vault_words_detected} />
          </Card>
        )}

        {/* Explanation */}
        {feedback.explanation && (
          <Card>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50">
              <RiLightbulbLine className="size-5 text-amber-500" />
              Explanation
            </h3>
            <Divider className="my-3" />
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {feedback.explanation}
            </p>
          </Card>
        )}

        {/* Fun fact */}
        <Card>
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-50">
            <RiSparklingLine className="size-5 text-pink-500" />
            Fun Fact
          </h3>
          <Divider className="my-3" />
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {feedback.fun_fact}
          </p>
        </Card>
      </div>
    </div>
  )
}

export function WritingClient({ initialLevel, initialLang }: WritingClientProps) {
  const [feedback, setFeedback] = React.useState<WritingFeedback | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(text: string) {
    setLoading(true)
    setError(null)

    const res = await submitWriting(text, initialLevel, initialLang)

    setLoading(false)

    if ("error" in res) {
      setError(res.error)
      return
    }

    setFeedback(res)
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Writing
          </h1>
          <p className="text-gray-500 sm:text-sm/6 dark:text-gray-500">
            Practice writing and get instant AI feedback with corrections
          </p>
        </div>
      </div>
      <Divider />

      {error && (
        <p className="mt-4 text-center text-sm text-red-500">{error}</p>
      )}

      {!feedback && <WritingForm onSubmit={handleSubmit} loading={loading} />}

      {feedback && (
        <div className="mt-6">
          <FeedbackView
            feedback={feedback}
            onNewWriting={() => setFeedback(null)}
          />
        </div>
      )}
    </>
  )
}
