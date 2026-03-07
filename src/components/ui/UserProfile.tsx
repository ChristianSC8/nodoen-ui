"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuTrigger,
} from "@/components/DropdownMenu"
import { cx, focusRing } from "@/lib/utils"
import { logout } from "@/lib/auth"
import { updatePreferences, type Preferences } from "@/lib/preferences"
import {
  RiArrowRightUpLine,
  RiComputerLine,
  RiGlobalLine,
  RiLogoutBoxRLine,
  RiMoonLine,
  RiSunLine,
  RiTranslate,
} from "@remixicon/react"
import { useTheme } from "next-themes"
import React from "react"

type UserProfileProps = {
  name?: string
  email?: string
  preferences?: Preferences | null
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return "U"
}

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const
const LANGS = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
] as const

function DropdownUserProfile({ name, email, preferences }: UserProfileProps) {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [level, setLevel] = React.useState(preferences?.level ?? "A1")
  const [lang, setLang] = React.useState(preferences?.lang ?? "es")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const initials = getInitials(name, email)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="open settings"
            className={cx(
              focusRing,
              "group rounded-full p-1 hover:bg-gray-100 data-[state=open]:bg-gray-100 hover:dark:bg-gray-400/10 data-[state=open]:dark:bg-gray-400/10",
            )}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              aria-hidden="true"
            >
              {initials}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="!min-w-56">
          <DropdownMenuLabel className="flex flex-col">
            {name && (
              <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {name}
              </span>
            )}
            <span className="text-xs font-normal text-gray-500 dark:text-gray-500">
              {email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>
                <RiGlobalLine
                  className="mr-2 size-4 shrink-0"
                  aria-hidden="true"
                />
                Level
                <span className="ml-auto mr-2 text-xs text-gray-500">
                  {level}
                </span>
              </DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                <DropdownMenuRadioGroup
                  value={level}
                  onValueChange={(value) => {
                    const newLevel = value as Preferences["level"]
                    setLevel(newLevel)
                    updatePreferences({ level: newLevel })
                  }}
                >
                  {LEVELS.map((l) => (
                    <DropdownMenuRadioItem
                      key={l}
                      value={l}
                      iconType="check"
                    >
                      {l}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>
                <RiTranslate
                  className="mr-2 size-4 shrink-0"
                  aria-hidden="true"
                />
                Language
                <span className="ml-auto mr-2 text-xs text-gray-500">
                  {LANGS.find((l) => l.value === lang)?.label}
                </span>
              </DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                <DropdownMenuRadioGroup
                  value={lang}
                  onValueChange={(value) => {
                    const newLang = value as Preferences["lang"]
                    setLang(newLang)
                    updatePreferences({ lang: newLang })
                  }}
                >
                  {LANGS.map((l) => (
                    <DropdownMenuRadioItem
                      key={l.value}
                      value={l.value}
                      iconType="check"
                    >
                      {l.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>Theme</DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) => {
                    setTheme(value)
                  }}
                >
                  <DropdownMenuRadioItem
                    aria-label="Switch to Light Mode"
                    value="light"
                    iconType="check"
                  >
                    <RiSunLine
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Switch to Dark Mode"
                    value="dark"
                    iconType="check"
                  >
                    <RiMoonLine
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Switch to System Mode"
                    value="system"
                    iconType="check"
                  >
                    <RiComputerLine
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Changelog
              <RiArrowRightUpLine
                className="mb-1 ml-1 size-3 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              Documentation
              <RiArrowRightUpLine
                className="mb-1 ml-1 size-3 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              Join Slack community
              <RiArrowRightUpLine
                className="mb-1 ml-1 size-3 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => logout()}
              className="text-red-600 dark:text-red-400"
            >
              <RiLogoutBoxRLine
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DropdownUserProfile }
