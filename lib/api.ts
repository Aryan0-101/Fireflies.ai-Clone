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
  createMeeting: (payload: import("./types").MeetingCreate) => request<Meeting>("/api/meetings", { method: "POST", body: JSON.stringify(payload) }),
  updateMeeting: (id: number, payload: import("./types").MeetingUpdate) => request<Meeting>(`/api/meetings/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteMeeting: (id: number) => request<void>(`/api/meetings/${id}`, { method: "DELETE" }),
  search: (query: string) => request<Meeting[]>(`/api/search?query=${encodeURIComponent(query)}`),
  createAction: (payload: { meeting_id: number; description: string; assignee?: string }) => request<import("./types").ActionItem>("/api/action-items", { method: "POST", body: JSON.stringify(payload) }),
  updateAction: (id: number, payload: { description?: string; assignee?: string; completed?: boolean }) => request<import("./types").ActionItem>(`/api/action-items/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteAction: (id: number) => request<void>(`/api/action-items/${id}`, { method: "DELETE" }),
  generateSummary: (id: number) => request<import("./types").Summary>(`/api/summaries/generate/${id}`, { method: "POST" }),
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
