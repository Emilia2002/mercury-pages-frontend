export interface PageDocument {
  _id: string
  owner_email: string
  job_id: string
  page_title: string
  template_id?: string | null
  theme: Record<string, unknown>
  sections: Array<Record<string, unknown>>
  schema_version: number
  revision: number
  created_at?: string | null
  updated_at?: string | null
  shopify_export?: Record<string, unknown> | null
}

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { detail?: string }
    const error = new Error(body.detail || `Page request failed (${response.status})`) as Error & { status?: number }
    error.status = response.status
    throw error
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getPageDocument(pageId: string, token: string) {
  return request<PageDocument>(`/pages/${encodeURIComponent(pageId)}`, token)
}

export function createPageDocument(payload: { job_id: string; page_title: string; template_id?: string; sections: unknown[] }, token: string) {
  return request<PageDocument>("/pages", token, { method: "POST", body: JSON.stringify({ ...payload, theme: {} }) })
}

export function updatePageDocument(pageId: string, payload: { revision: number; page_title?: string; template_id?: string; sections?: unknown[] }, token: string) {
  return request<PageDocument>(`/pages/${encodeURIComponent(pageId)}`, token, { method: "PATCH", body: JSON.stringify(payload) })
}

export function listPageDocuments(token: string) {
  return request<PageDocument[]>("/pages", token)
}

export function deletePageDocument(pageId: string, token: string) {
  return request<void>(`/pages/${encodeURIComponent(pageId)}`, token, { method: "DELETE" })
}
