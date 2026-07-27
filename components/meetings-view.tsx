"use client";

import {
  ChevronDown, Clock3, Filter, MoreHorizontal, Search, Upload, Users, Video, Plus, Edit, Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useRef, useState, MouseEvent } from "react";
import { api } from "@/lib/api";
import type { Meeting } from "@/lib/types";
import { FirefliesMark } from "./brand";
import { useShellActions } from "./app-shell";

function duration(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function MeetingsView() {
  const params = useSearchParams();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(params.get("upload") === "1");
  const [uploading, setUploading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  
  const { showToast } = useShellActions();

  // Filters state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterParticipant, setFilterParticipant] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  
  // Create / Edit Meeting state
  const [createOpen, setCreateOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState({ title: "", meeting_date: new Date().toISOString().slice(0, 16), duration_seconds: 1800, participants: "" });

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.meetings("").then((data) => setMeetings(data.items)).catch(() => showToast("Could not load meetings")).finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !meetings[0]) return;
    setUploading(true);
    try {
      await api.upload(meetings[0].id, file);
      setUploadOpen(false);
    } finally {
      setUploading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    try {
      const payload = {
        title: formData.title || "Untitled Meeting",
        meeting_date: new Date(formData.meeting_date).toISOString(),
        duration_seconds: Number(formData.duration_seconds),
        participants: formData.participants.split(",").map(p => p.trim()).filter(Boolean),
      };
      const created = await api.createMeeting(payload);
      
      const file = fileRef.current?.files?.[0];
      if (file) {
        await api.upload(created.id, file);
      }
      
      setCreateOpen(false);
      setFormData({ title: "", meeting_date: new Date().toISOString().slice(0, 16), duration_seconds: 1800, participants: "" });
      api.meetings(query).then((data) => setMeetings(data.items));
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMeeting) return;
    setUploading(true);
    try {
      await api.updateMeeting(editingMeeting.id, {
        title: formData.title,
        meeting_date: new Date(formData.meeting_date).toISOString(),
        duration_seconds: Number(formData.duration_seconds),
        participants: formData.participants.split(",").map(p => p.trim()).filter(Boolean),
      });
      setEditingMeeting(null);
      api.meetings(query).then((data) => setMeetings(data.items));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    await api.deleteMeeting(id);
    setMeetings(m => m.filter(meet => meet.id !== id));
  }

  function openEdit(meeting: Meeting, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      meeting_date: new Date(meeting.meeting_date).toISOString().slice(0, 16),
      duration_seconds: meeting.duration_seconds,
      participants: meeting.participants.map(p => p.email || p.name).join(", "),
    });
    setActiveDropdown(null);
  }

  const filteredMeetings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedParticipant = filterParticipant.trim().toLowerCase();
    return meetings.filter((m) => {
      const participantText = m.participants.map((p) => `${p.name} ${p.email}`).join(" ").toLowerCase();
      const topicText = m.topics.map((topic) => topic.topic).join(" ").toLowerCase();
      const searchable = `${m.title} ${m.description} ${participantText} ${topicText}`.toLowerCase();
      const date = m.meeting_date.slice(0, 10);
      if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;
      if (normalizedParticipant && !participantText.includes(normalizedParticipant)) return false;
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (filterFrom && date < filterFrom) return false;
      if (filterTo && date > filterTo) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime();
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime();
    });
  }, [meetings, query, filterStatus, filterParticipant, filterFrom, filterTo, sortBy]);

  return (
    <div className="meetings-page">
      <div className="meetings-toolbar">
        <div className="meeting-tabs"><button className="active">Hosted by me</button><button onClick={() => showToast("Feature coming soon!")}>Shared with me</button></div>
        <div style={{ position: "relative" }}>
          <button className="filter-button" onClick={() => setFilterOpen(!filterOpen)}><Filter size={16} /> Filters</button>
          {filterOpen && (
            <>
              <div className="popover-scrim" onClick={() => setFilterOpen(false)} />
              <div className="filter-popover">
                <label>Status
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All statuses</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>
                </label>
                <div className="filter-actions">
                  <button type="button" className="secondary-button" onClick={() => { setFilterStatus("all"); setFilterOpen(false); }}>Reset</button>
                  <button type="button" className="purple-button" onClick={() => setFilterOpen(false)}>Apply</button>
                </div>
              </div>
            </>
          )}
        </div>
        <button className="square-button" aria-label="Search"><Search size={18} /></button>
      </div>

      <div className="meeting-search-row">
        <div className="local-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search meetings" /></div>
        <button className="upload-button" onClick={() => setCreateOpen(true)}><Plus size={17} /> Create meeting</button>
        <button className="upload-button" onClick={() => setUploadOpen(true)}><Upload size={17} /> Upload transcript</button>
      </div>

      <div className="meeting-table">
        <div className="meeting-table-head">
          <span>Meeting title</span><span>Date & time</span><span>Duration</span><span>Participants</span><span>Status</span><span />
        </div>
        {loading ? <TableSkeleton /> : filteredMeetings.map((meeting) => (
          <Link href={`/meeting/${meeting.id}`} className="meeting-row" key={meeting.id}>
            <span className="meeting-title-cell"><FirefliesMark size={24} /><span><strong>{meeting.title}</strong><small>{meeting.topics[0]?.topic ?? "Meeting"}</small></span></span>
            <span>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(meeting.meeting_date))}<small>{new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(meeting.meeting_date))}</small></span>
            <span className="duration-cell"><Clock3 size={15} />{duration(meeting.duration_seconds)}</span>
            <span className="avatar-stack">{meeting.participants.slice(0, 3).map((person, index) => <i key={person.id} style={{ zIndex: 4 - index }}>{person.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</i>)}{meeting.participants.length > 3 && <i>+{meeting.participants.length - 3}</i>}</span>
            <span><i className={`status-pill ${meeting.status}`}><b />{meeting.status}</i></span>
            <span className="actions-cell" style={{ position: "relative" }}>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveDropdown(activeDropdown === meeting.id ? null : meeting.id); }} 
                className="icon-button"
              >
                <MoreHorizontal size={18} />
              </button>
              {activeDropdown === meeting.id && (
                <>
                  <div className="popover-scrim" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveDropdown(null); }} />
                  <div className="dropdown-menu" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                    <button onClick={(e) => openEdit(meeting, e)}><Edit size={15} /> Edit Meeting</button>
                    <button className="danger" onClick={(e) => handleDelete(meeting.id, e)}><Trash2 size={15} /> Delete Meeting</button>
                  </div>
                </>
              )}
            </span>
          </Link>
        ))}
        {!loading && !filteredMeetings.length && <div className="empty-meetings"><Video size={28} /><strong>No matching meetings</strong><p>Try a different title, participant, topic, or transcript keyword.</p></div>}
      </div>

      {uploadOpen && (
        <div className="dialog-backdrop" onMouseDown={() => setUploadOpen(false)}>
          <section className="upload-dialog" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" onClick={() => setUploadOpen(false)}>×</button>
            <div className="upload-icon"><Upload size={24} /></div>
            <h2>Upload a transcript</h2>
            <p>Attach a `.txt`, `.vtt`, or `.json` transcript to your newest meeting.</p>
            <button className="purple-button wide" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? "Uploading..." : "Choose file"}
            </button>
            <input ref={fileRef} hidden type="file" accept=".txt,.vtt,.json" onChange={upload} />
          </section>
        </div>
      )}

      {(createOpen || editingMeeting) && (
        <div className="dialog-backdrop" onMouseDown={() => { setCreateOpen(false); setEditingMeeting(null); }}>
          <section className="upload-dialog" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" onClick={() => { setCreateOpen(false); setEditingMeeting(null); }}>×</button>
            <div className="upload-icon"><Video size={24} /></div>
            <h2>{editingMeeting ? "Edit Meeting" : "Create a Meeting"}</h2>
            <form onSubmit={editingMeeting ? handleUpdate : handleCreate} className="crud-form">
              <label>Title<input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Meeting with John" /></label>
              <label>Date & Time<input required type="datetime-local" value={formData.meeting_date} onChange={e => setFormData({ ...formData, meeting_date: e.target.value })} /></label>
              <label>Duration (seconds)<input required type="number" value={formData.duration_seconds} onChange={e => setFormData({ ...formData, duration_seconds: Number(e.target.value) })} /></label>
              <label>Participants (comma separated)<input value={formData.participants} onChange={e => setFormData({ ...formData, participants: e.target.value })} placeholder="john@example.com, Sarah" /></label>
              {!editingMeeting && (
                <label>Transcript (Optional)
                  <input type="file" ref={fileRef} accept=".txt,.vtt,.json" />
                </label>
              )}
              <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                <button type="button" className="secondary-button" onClick={() => { setCreateOpen(false); setEditingMeeting(null); }} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="purple-button" disabled={uploading} style={{ flex: 1 }}>
                  {uploading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function TableSkeleton() {
  return <div className="table-skeleton">{[1, 2, 3, 4].map((item) => <i key={item} />)}</div>;
}
