import type { Meeting, MeetingPage } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? `Request failed: ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  meetings: (query = "") =>
    request<MeetingPage>(`/api/meetings?page_size=50${query ? `&query=${encodeURIComponent(query)}` : ""}`),
  meeting: (id: number) => request<Meeting>(`/api/meetings/${id}`),
  search: (query: string) => request<Meeting[]>(`/api/search?query=${encodeURIComponent(query)}`),
  toggleAction: (id: number, completed: boolean) =>
    request(`/api/action-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    }),
  upload: (meetingId: number, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<Meeting>(`/api/transcripts/upload?meeting_id=${meetingId}`, {
      method: "POST",
      body,
    });
  },
};
