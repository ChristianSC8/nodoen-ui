import { fetchVault } from "@/lib/vault"
import { VaultClient } from "./vault-client"

export default async function VaultPage() {
  const result = await fetchVault(1, 100)

  return (
    <main>
      <VaultClient
        initialTerms={result?.data ?? []}
        initialPagination={result?.pagination ?? null}
      />
    </main>
  )
}
