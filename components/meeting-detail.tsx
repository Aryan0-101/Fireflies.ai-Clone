"use client";

import {
  Bot, CalendarDays, Check, CheckSquare, ChevronRight, CircleHelp, Clock3, Download,
  Edit3, Expand, Link2, ListChecks, Play, Plus, Search, Send, Share2, Sparkles, Trash2, Pause,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, api } from "@/lib/api";
import type { ActionItem, Meeting, Segment } from "@/lib/types";
import { useShellActions } from "./app-shell";

function time(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")})`, "ig"));
  return parts.map((part, index) => part.toLowerCase() === query.trim().toLowerCase() ? <mark key={index}>{part}</mark> : part);
}

export function MeetingDetailView({ id }: { id: number }) {
  const router = useRouter();
  const { showToast } = useShellActions();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [active, setActive] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editParticipants, setEditParticipants] = useState("");
  const [taskDraft, setTaskDraft] = useState("");
  const [taskOpen, setTaskOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setMeeting(await api.meeting(id));
  }

  useEffect(() => {
    api.meeting(id).then((value) => { setMeeting(value); setPlayhead(value.transcript_segments?.[0]?.start_time ?? 0); }).catch(() => showToast("Could not load meeting"));
  }, [id]);

  useEffect(() => {
    if (!playing || !meeting) return;
    const timer = window.setInterval(() => {
      setPlayhead((value) => {
        const next = value + 1;
        if (next >= meeting.duration_seconds) setPlaying(false);
        return Math.min(next, meeting.duration_seconds);
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, meeting]);

  const allSegments = meeting?.transcript_segments ?? [];
  const segments = useMemo(() => allSegments.filter((segment) => !query.trim() || segment.text.toLowerCase().includes(query.trim().toLowerCase())), [allSegments, query]);
  const selected = allSegments[active];

  function seekTo(value: number) {
    const next = Math.max(0, Math.min(value, meeting?.duration_seconds ?? 0));
    setPlayhead(next);
    const index = allSegments.findIndex((segment) => next >= segment.start_time && next <= segment.end_time);
    if (index >= 0) setActive(index);
  }

  function selectSegment(index: number) {
    setActive(index);
    setPlayhead(allSegments[index]?.start_time ?? 0);
  }

  async function toggleAction(action: ActionItem) {
    try { await api.updateAction(action.id, { completed: !action.completed }); await refresh(); } catch { showToast("Could not update task"); }
  }

  async function addAction(event: FormEvent) {
    event.preventDefault();
    if (!taskDraft.trim()) return;
    try { await api.createAction({ meeting_id: id, description: taskDraft.trim() }); setTaskDraft(""); setTaskOpen(false); await refresh(); showToast("Task added"); } catch { showToast("Could not add task"); }
  }

  async function editAction(action: ActionItem) {
    const description = window.prompt("Edit task", action.description);
    if (!description?.trim()) return;
    try { await api.updateAction(action.id, { description: description.trim() }); await refresh(); showToast("Task updated"); } catch { showToast("Could not update task"); }
  }

  async function deleteAction(action: ActionItem) {
    if (!window.confirm("Delete this task?")) return;
    try { await api.deleteAction(action.id); await refresh(); showToast("Task deleted"); } catch { showToast("Could not delete task"); }
  }

  async function regenerateSummary() {
    setSaving(true);
    try { await api.generateSummary(id); await refresh(); showToast("Summary refreshed"); } catch { showToast("Could not refresh summary"); } finally { setSaving(false); }
  }

  function openEdit() {
    if (!meeting) return;
    setEditTitle(meeting.title);
    setEditParticipants(meeting.participants.map((person) => person.email).join(", "));
    setEditOpen(true);
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      const updated = await api.updateMeeting(id, { title: editTitle.trim(), participants: editParticipants.split(",").map((value) => value.trim()).filter(Boolean) });
      setMeeting(updated); setEditOpen(false); showToast("Meeting updated");
    } catch { showToast("Could not update meeting"); } finally { setSaving(false); }
  }

  async function deleteMeeting() {
    if (!window.confirm("Delete this meeting and all its contents?")) return;
    try { await api.deleteMeeting(id); showToast("Meeting deleted"); router.push("/notebook/mine-shared"); } catch { showToast("Could not delete meeting"); }
  }

  function ask(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setChat((items) => [...items, prompt.trim()]); setPrompt("");
  }

  if (!meeting) return <div className="detail-loading"><i /><i /><i /></div>;

  return (
    <div className="meeting-detail-page">
      <header className="detail-header">
        <div><h1>{meeting.title}</h1><span><Clock3 size={15} /> {time(meeting.duration_seconds)} <i /> <CalendarDays size={15} /> {new Date(meeting.meeting_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
        <div className="detail-actions">
          <button aria-label="Edit meeting" onClick={openEdit}><Edit3 size={18} /></button><button aria-label="Delete meeting" onClick={deleteMeeting}><Trash2 size={18} /></button><button aria-label="Share"><Share2 size={18} /></button><button aria-label="Copy link"><Link2 size={18} /></button><button aria-label="Fullscreen"><Expand size={18} /></button>
          <a href={`${API_URL}/api/exports/pdf/${id}`}><Download size={17} /> Export</a>
        </div>
      </header>

      <div className="detail-grid">
        <section className="transcript-panel">
          <div className="panel-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transcript..." aria-label="Search transcript" /></div>
          <div className="transcript-list">
            {segments.map((segment) => { const index = allSegments.findIndex((item) => item.id === segment.id); return <TranscriptRow key={segment.id} segment={segment} active={active === index} query={query} onClick={() => selectSegment(index)} />; })}
            {!segments.length && <p className="empty-transcript">No matching transcript lines.</p>}
          </div>
        </section>

        <section className="intelligence-column">
          <div className="meeting-player">
            <div className="participant-stage">{meeting.participants.slice(0, 3).map((participant, index) => <div className={index === active % 3 ? "speaking" : ""} key={participant.id}><i>{participant.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</i><span>{participant.name.split(" ")[0]}</span></div>)}</div>
            <div className="player-controls"><button aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button><span>{time(playhead)} / {time(meeting.duration_seconds)}</span><input aria-label="Seek meeting" type="range" min="0" max={Math.max(1, meeting.duration_seconds)} value={playhead} onChange={(event) => seekTo(Number(event.target.value))} /><i className="player-progress" style={{ width: `${Math.min(100, (playhead / Math.max(1, meeting.duration_seconds)) * 100)}%` }} /></div>
          </div>
          <div className="quick-actions-panel">
            <h2><Sparkles size={21} /> Quick Actions</h2>
            <div className="detail-quick-grid"><button onClick={regenerateSummary} disabled={saving}><i><ListChecks size={17} /></i><strong>{saving ? "Working..." : "Summarize"}</strong><small>Generate quick brief</small></button><button onClick={() => setTaskOpen(true)}><i className="teal"><CheckSquare size={17} /></i><strong>Action Items</strong><small>Add or review tasks</small></button><button onClick={() => seekTo(0)}><i className="pink"><Clock3 size={17} /></i><strong>Catch Up</strong><small>Jump to the start</small></button><button onClick={() => showToast("Suggested questions coming soon") }><i className="gray"><CircleHelp size={17} /></i><strong>Suggest Qs</strong><small>What to ask next</small></button></div>
            <div className="summary-block"><span>Summary</span><p>{meeting.summary?.summary ?? "No summary available."}</p></div>
            <div className="action-list"><div className="action-list-heading"><span>Action Items</span><button className="icon-button" aria-label="Add action item" onClick={() => setTaskOpen((value) => !value)}><Plus size={16} /></button></div>{taskOpen && <form className="new-action-form" onSubmit={addAction}><input autoFocus value={taskDraft} onChange={(event) => setTaskDraft(event.target.value)} placeholder="Add a task" /><button className="purple-button" type="submit">Add</button></form>}{meeting.action_items?.map((item) => <div className={`action-item ${item.completed ? "done" : ""}`} key={item.id}><button className="action-check" onClick={() => toggleAction(item)} aria-label={item.completed ? "Mark incomplete" : "Mark complete"}><i>{item.completed && <Check size={13} />}</i></button><span>{item.description}<small>{item.assignee}</small></span><span className="action-actions"><button className="icon-button" aria-label="Edit task" onClick={() => editAction(item)}><Edit3 size={14} /></button><button className="icon-button danger" aria-label="Delete task" onClick={() => deleteAction(item)}><Trash2 size={14} /></button></span></div>)}</div>
          </div>
        </section>

        <section className="meeting-fred-panel"><header><span><Sparkles size={17} /></span><h2>AskFred</h2></header><div className="meeting-fred-content"><div className="fred-answer"><i><Bot size={16} /></i><div><p>Here are the key points discussed:</p>{meeting.summary?.outline.split("\n").filter(Boolean).slice(0, 4).map((line) => <span key={line}><ChevronRight size={16} />{line.replace(/^- /, "")}</span>)}</div></div><div className="question-chips"><p>Suggested questions you can ask me:</p><button onClick={() => setPrompt("What are the action items?")}>What are the action items?</button><button onClick={() => setPrompt("Summarize the main risks.")}>Summarize the main risks.</button></div>{chat.map((message, index) => <div className="mini-chat" key={index}><strong>You</strong><p>{message}</p><span>AskFred: This meeting focuses on {meeting.topics.map((topic) => topic.topic).join(", ")}.</span></div>)}</div><form className="meeting-fred-input" onSubmit={ask}><input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask anything from your meetings..." /><button aria-label="Send"><Send size={17} /></button><small>AI generated content may be inaccurate</small></form></section>
      </div>

      {editOpen && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditOpen(false); }}><form className="upload-dialog crud-form" onSubmit={saveEdit}><button type="button" className="dialog-close" aria-label="Close edit" onClick={() => setEditOpen(false)}>×</button><h2>Edit Meeting</h2><label>Title<input required value={editTitle} onChange={(event) => setEditTitle(event.target.value)} /></label><label>Participants<input value={editParticipants} onChange={(event) => setEditParticipants(event.target.value)} placeholder="email@example.com, ..." /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setEditOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button></div></form></div>}
    </div>
  );
}

function TranscriptRow({ segment, active, query, onClick }: { segment: Segment; active: boolean; query: string; onClick: () => void }) {
  return <button className={`transcript-row ${active ? "active" : ""}`} onClick={onClick}><div><span className="speaker-avatar">{segment.speaker[0]}</span><strong>{segment.speaker}</strong><time>{time(segment.start_time)}</time></div><p>{highlightText(segment.text, query)}</p></button>;
}