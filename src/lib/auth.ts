"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { api } from "./api"

const SESSION_COOKIE = "session"

type Session = {
  $id: string
  secret: string
  userId: string
  expire: string
  [key: string]: unknown
}

type AuthUser = {
  id: string
  name: string
  email: string
}

export async function login(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const session = await api<Session>("/auth/sign-in", {
      method: "POST",
      body: { email, password },
    })

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(session.expire),
    })
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Invalid email or password",
    }
  }

  redirect("/overview")
}

export async function logout() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    try {
      await api("/auth/sign-out", { method: "DELETE", token })
    } catch {
      // Session may already be expired
    }
    cookieStore.delete(SESSION_COOKIE)
  }

  redirect("/login")
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value ?? null
}

export async function getUser(): Promise<AuthUser | null> {
  const token = await getSession()
  if (!token) return null

  try {
    return await api<AuthUser>("/auth/me", { token })
  } catch {
    return null
  }
}
