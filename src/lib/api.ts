const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string
}

export async function api<T>(
  endpoint: string,
  { method = "GET", body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || error.error || "Request failed")
  }

  return res.json()
}
