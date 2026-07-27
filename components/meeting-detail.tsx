"use client";

import {
  Bot, CalendarDays, Check, CheckSquare, ChevronRight, CircleHelp, Clock3, Download,
  Expand, Link2, ListChecks, Play, Search, Send, Share2, Sparkles, WandSparkles,
  Plus, Edit, Trash2, X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState, MouseEvent } from "react";
import { API_URL, api } from "@/lib/api";
import type { Meeting, Segment } from "@/lib/types";

function time(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function MeetingDetailView({ id }: { id: number }) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  
  // Action Item CRUD state
  const [newActionText, setNewActionText] = useState("");
  const [editingActionId, setEditingActionId] = useState<number | null>(null);
  const [editingActionText, setEditingActionText] = useState("");
  
  // Summary loading state
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => { api.meeting(id).then(setMeeting); }, [id]);
  const segments = useMemo(() => (meeting?.transcript_segments ?? []).filter((segment) => segment.text.toLowerCase().includes(query.toLowerCase())), [meeting, query]);

  async function toggleAction(actionId: number, completed: boolean) {
    await api.toggleAction(actionId, !completed);
    setMeeting(await api.meeting(id));
  }

  async function handleAddAction(e: FormEvent) {
    e.preventDefault();
    if (!newActionText.trim()) return;
    await api.createAction({ meeting_id: id, description: newActionText.trim() });
    setNewActionText("");
    setMeeting(await api.meeting(id));
  }

  async function handleUpdateAction(e: FormEvent) {
    e.preventDefault();
    if (!editingActionId || !editingActionText.trim()) return;
    await api.updateAction(editingActionId, { description: editingActionText.trim() });
    setEditingActionId(null);
    setEditingActionText("");
    setMeeting(await api.meeting(id));
  }

  async function handleDeleteAction(actionId: number, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await api.deleteAction(actionId);
    setMeeting(await api.meeting(id));
  }

  async function handleSummarize() {
    setSummarizing(true);
    try {
      await api.generateSummary(id);
      setMeeting(await api.meeting(id));
    } finally {
      setSummarizing(false);
    }
  }

  function ask(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setChat((items) => [...items, prompt.trim()]);
    setPrompt("");
  }

  if (!meeting) return <div className="detail-loading"><i /><i /><i /></div>;
  const selected = meeting.transcript_segments?.[active];

  return (
    <div className="meeting-detail-page">
      <header className="detail-header">
        <div><h1>{meeting.title}</h1><span><Clock3 size={15} /> {time(meeting.duration_seconds)} <i /> <CalendarDays size={15} /> {new Date(meeting.meeting_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
        <div className="detail-actions">
          <button aria-label="Share"><Share2 size={18} /></button><button aria-label="Copy link"><Link2 size={18} /></button><button aria-label="Fullscreen"><Expand size={18} /></button>
          <a href={`${API_URL}/api/exports/pdf/${id}`}><Download size={17} /> Export</a>
        </div>
      </header>

      <div className="detail-grid">
        <section className="transcript-panel">
          <div className="panel-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search transcript..." /></div>
          <div className="transcript-list">
            {segments.map((segment) => {
              const originalIndex = meeting.transcript_segments?.findIndex((item) => item.id === segment.id) ?? 0;
              return <TranscriptRow key={segment.id} segment={segment} active={active === originalIndex} onClick={() => setActive(originalIndex)} />;
            })}
          </div>
        </section>

        <section className="intelligence-column">
          <div className="meeting-player">
            <div className="participant-stage">
              {meeting.participants.slice(0, 3).map((participant, index) => <div className={index === active % 3 ? "speaking" : ""} key={participant.id}><i>{participant.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</i><span>{participant.name.split(" ")[0]}</span></div>)}
            </div>
            <div className="player-controls"><button><Play size={18} fill="currentColor" /></button><span>{time(selected?.start_time ?? 0)} / {time(meeting.duration_seconds)}</span><div><i style={{ width: `${Math.min(100, ((selected?.start_time ?? 0) / meeting.duration_seconds) * 100)}%` }} /></div></div>
          </div>
          <div className="quick-actions-panel">
            <h2><Sparkles size={21} /> Quick Actions</h2>
            <div className="detail-quick-grid">
              <button onClick={handleSummarize} disabled={summarizing}><i><ListChecks size={17} /></i><strong>{summarizing ? "Summarizing..." : "Summarize"}</strong><small>Generate quick brief</small></button>
              <button><i className="teal"><CheckSquare size={17} /></i><strong>Action Items</strong><small>Extract tasks</small></button>
              <button><i className="pink"><Clock3 size={17} /></i><strong>Catch Up</strong><small>Missed the start?</small></button>
              <button><i className="gray"><CircleHelp size={17} /></i><strong>Suggest Qs</strong><small>What to ask next</small></button>
            </div>
            <div className="summary-block"><span>Summary</span><p>{meeting.summary?.summary || "No summary available."}</p></div>
            <div className="action-list">
              <span>Action Items</span>
              <form onSubmit={handleAddAction} className="add-action-form">
                <input value={newActionText} onChange={e => setNewActionText(e.target.value)} placeholder="Add a new action item..." />
                <button type="submit"><Plus size={16} /></button>
              </form>
              {meeting.action_items?.map((item) => (
                <div key={item.id} className={`action-item-row ${item.completed ? "done" : ""}`}>
                  <button className="check-btn" onClick={() => toggleAction(item.id, item.completed)}><i>{item.completed && <Check size={13} />}</i></button>
                  {editingActionId === item.id ? (
                    <form onSubmit={handleUpdateAction} className="edit-action-form" style={{ flex: 1, display: "flex", gap: "4px" }}>
                      <input autoFocus value={editingActionText} onChange={e => setEditingActionText(e.target.value)} />
                      <button type="button" onClick={() => setEditingActionId(null)} className="icon-button"><X size={14} /></button>
                      <button type="submit" className="icon-button"><Check size={14} /></button>
                    </form>
                  ) : (
                    <>
                      <span className="action-text" onClick={() => { setEditingActionId(item.id); setEditingActionText(item.description); }}>{item.description}<small>{item.assignee}</small></span>
                      <div className="action-actions">
                        <button onClick={(e) => { e.stopPropagation(); setEditingActionId(item.id); setEditingActionText(item.description); }} className="icon-button"><Edit size={14} /></button>
                        <button onClick={(e) => handleDeleteAction(item.id, e)} className="icon-button danger"><Trash2 size={14} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="meeting-fred-panel">
          <header><span><Sparkles size={17} /></span><h2>AskFred</h2></header>
          <div className="meeting-fred-content">
            <div className="fred-answer"><i><Bot size={16} /></i><div><p>Here are the key points discussed:</p>{meeting.summary?.outline.split("\n").filter(Boolean).slice(0, 4).map((line) => <span key={line}><ChevronRight size={16} />{line.replace(/^- /, "")}</span>)}</div></div>
            <div className="question-chips"><p>Suggested questions you can ask me:</p><button onClick={() => setPrompt("What are the action items?")}>What are the action items?</button><button onClick={() => setPrompt("Summarize the main risks.")}>Summarize the main risks.</button></div>
            {chat.map((message, index) => <div className="mini-chat" key={index}><strong>You</strong><p>{message}</p><span>AskFred: This meeting focuses on {meeting.topics.map((topic) => topic.topic).join(", ")}.</span></div>)}
          </div>
          <form className="meeting-fred-input" onSubmit={ask}><input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask anything from your meetings..." /><button aria-label="Send"><Send size={17} /></button><small>AI generated content may be inaccurate</small></form>
        </section>
      </div>
    </div>
  );
}

function TranscriptRow({ segment, active, onClick }: { segment: Segment; active: boolean; onClick: () => void }) {
  return (
    <button className={`transcript-row ${active ? "active" : ""}`} onClick={onClick}>
      <div><span className="speaker-avatar">{segment.speaker[0]}</span><strong>{segment.speaker}</strong><time>{time(segment.start_time)}</time></div>
      <p>{segment.text}</p>
    </button>
  );
}
