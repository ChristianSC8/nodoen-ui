import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const res = await fetch(`${API_URL}/reading/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }))
    return Response.json(err, { status: res.status })
  }

  return new Response(res.body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
