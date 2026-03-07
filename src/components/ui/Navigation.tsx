"use client"

import { TabNavigation, TabNavigationLink } from "@/components/TabNavigation"
import Link from "next/link"
import { Notifications } from "./Notifications"
import { VaultSearch } from "./VaultSearch"

import { usePathname } from "next/navigation"
import { Logo } from "../../../public/Logo"
import { DropdownUserProfile } from "./UserProfile"
import type { Preferences } from "@/lib/preferences"
import type { VaultTerm } from "@/lib/vault"

type NavigationProps = {
  userName?: string
  userEmail?: string
  preferences?: Preferences | null
  vaultTerms?: VaultTerm[]
}

function Navigation({ userName, userEmail, preferences, vaultTerms = [] }: NavigationProps) {
  const pathname = usePathname()
  return (
    <div className="shadow-s sticky top-0 z-20 bg-white dark:bg-gray-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 pt-3">
        <div>
          <span className="sr-only">Your Company</span>
          <Logo className="h-6" />
        </div>
        <div className="flex h-[42px] flex-nowrap gap-1">
          <VaultSearch terms={vaultTerms} />
          <Notifications />
          <DropdownUserProfile name={userName} email={userEmail} preferences={preferences} />
        </div>
      </div>
      <TabNavigation className="mt-5">
        <div className="mx-auto flex w-full max-w-7xl items-center px-6">
          <TabNavigationLink
            className="inline-flex gap-2"
            asChild
            active={pathname === "/overview"}
          >
            <Link href="/overview">Overview</Link>
          </TabNavigationLink>
          <TabNavigationLink
            className="inline-flex gap-2"
            asChild
            active={pathname === "/reading"}
          >
            <Link href="/reading">Reading</Link>
          </TabNavigationLink>
          <TabNavigationLink
            className="inline-flex gap-2"
            asChild
            active={pathname === "/writing"}
          >
            <Link href="/writing">Writing</Link>
          </TabNavigationLink>
          <TabNavigationLink
            className="inline-flex gap-2"
            asChild
            active={pathname === "/vault"}
          >
            <Link href="/vault">Vault</Link>
          </TabNavigationLink>
        </div>
      </TabNavigation>
    </div>
  )
}

export { Navigation }
