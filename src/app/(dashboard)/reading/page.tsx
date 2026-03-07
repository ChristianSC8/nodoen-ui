import { fetchPreferences } from "@/lib/preferences"
import { ReadingClient } from "./reading-client"

export default async function ReadingPage() {
  const preferences = await fetchPreferences()

  return (
    <main>
      <ReadingClient
        initialLevel={preferences?.level ?? "A1"}
        initialLang={preferences?.lang ?? "es"}
      />
    </main>
  )
}
