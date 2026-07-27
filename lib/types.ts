export type Participant = { id: number; name: string; email: string };
export type Topic = { id: number; topic: string };
export type Segment = {
  id: number;
  speaker: string;
  start_time: number;
  end_time: number;
  text: string;
  sequence_number: number;
};
export type Summary = { id: number; summary: string; outline: string; created_at: string };
export type ActionItem = {
  id: number;
  meeting_id: number;
  description: string;
  assignee: string;
  completed: boolean;
  due_date: string | null;
};
export type Meeting = {
  id: number;
  title: string;
  description: string;
  meeting_date: string;
  duration_seconds: number;
  status: string;
  participants: Participant[];
  topics: Topic[];
  transcript_segments?: Segment[];
  summary?: Summary | null;
  action_items?: ActionItem[];
};
export type MeetingCreate = { title: string; description?: string; meeting_date: string; duration_seconds?: number; participants?: string[] };
export type MeetingUpdate = { title?: string; description?: string; meeting_date?: string; duration_seconds?: number; status?: string; participants?: string[] };
export type MeetingPage = {
  items: Meeting[];
  total: number;
  page: number;
  page_size: number;
};
