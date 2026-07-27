"use client";

import {
  ChevronDown, Clock3, Filter, MoreHorizontal, Search, Upload, Users, Video,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Meeting } from "@/lib/types";
import { FirefliesMark } from "./brand";

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
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.meetings(query).then((data) => setMeetings(data.items)).finally(() => setLoading(false));
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

  return (
    <div className="meetings-page">
      <div className="meetings-toolbar">
        <div className="meeting-tabs"><button className="active">Hosted by me</button><button>Shared with me</button></div>
        <button className="filter-button"><Filter size={16} /> Filters</button>
        <button className="square-button" aria-label="Search"><Search size={18} /></button>
      </div>

      <div className="meeting-search-row">
        <div className="local-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search meetings" /></div>
        <button className="upload-button" onClick={() => setUploadOpen(true)}><Upload size={17} /> Upload transcript</button>
      </div>

      <div className="meeting-table">
        <div className="meeting-table-head">
          <span>Meeting title</span><span>Date & time</span><span>Duration</span><span>Participants</span><span>Status</span><span />
        </div>
        {loading ? <TableSkeleton /> : meetings.map((meeting) => (
          <Link href={`/meeting/${meeting.id}`} className="meeting-row" key={meeting.id}>
            <span className="meeting-title-cell"><FirefliesMark size={24} /><span><strong>{meeting.title}</strong><small>{meeting.topics[0]?.topic ?? "Meeting"}</small></span></span>
            <span>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(meeting.meeting_date))}<small>{new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(meeting.meeting_date))}</small></span>
            <span className="duration-cell"><Clock3 size={15} />{duration(meeting.duration_seconds)}</span>
            <span className="avatar-stack">{meeting.participants.slice(0, 3).map((person, index) => <i key={person.id} style={{ zIndex: 4 - index }}>{person.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</i>)}{meeting.participants.length > 3 && <i>+{meeting.participants.length - 3}</i>}</span>
            <span><i className={`status-pill ${meeting.status}`}><b />{meeting.status}</i></span>
            <span><MoreHorizontal size={18} /></span>
          </Link>
        ))}
        {!loading && !meetings.length && <div className="empty-meetings"><Video size={28} /><strong>No matching meetings</strong><p>Try a different title, participant, topic, or transcript keyword.</p></div>}
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
    </div>
  );
}

function TableSkeleton() {
  return <div className="table-skeleton">{[1, 2, 3, 4].map((item) => <i key={item} />)}</div>;
}
