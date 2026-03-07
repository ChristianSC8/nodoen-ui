import { fetchPreferences } from "@/lib/preferences"
import { WritingClient } from "./writing-client"

export default async function WritingPage() {
  const preferences = await fetchPreferences()

  return (
    <main>
      <WritingClient
        initialLevel={preferences?.level ?? "A1"}
        initialLang={preferences?.lang ?? "es"}
      />
    </main>
  )
}
