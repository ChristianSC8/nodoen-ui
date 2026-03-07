import { Navigation } from "@/components/ui/Navigation"
import { getUser } from "@/lib/auth"
import { fetchPreferences } from "@/lib/preferences"
import { fetchVault } from "@/lib/vault"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [user, preferences, vault] = await Promise.all([
    getUser(),
    fetchPreferences(),
    fetchVault(1, 100),
  ])

  return (
    <div>
      <Navigation
        userName={user?.name}
        userEmail={user?.email}
        preferences={preferences}
        vaultTerms={vault?.data ?? []}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  )
}
