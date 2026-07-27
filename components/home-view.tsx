"use client";

import { Apple, CalendarDays, ChevronRight, Download, Monitor, Play, Smartphone, Upload, Video, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Meeting } from "@/lib/types";
import { FirefliesMark } from "./brand";
import { useShellActions } from "./app-shell";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}

export function HomeView() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const { openCapture, openSchedule, showToast } = useShellActions();
  useEffect(() => { api.meetings().then((data) => setMeetings(data.items.slice(0, 3))).catch(() => undefined); }, []);

  return (
    <div className="home-page">
      <section className="welcome-panel">
        <div className="welcome-copy">
          <h1>Welcome Aboard, Aryan!</h1>
          <p>Fireflies is now ready to automate your meetings and streamline your workflows.</p>
        </div>
        <div className="overview-video">
          <div className="video-brand"><FirefliesMark size={18} /><span>Product Demo</span></div>
          <button aria-label="Play overview"><span>▶</span></button>
          <i className="mini-avatar">AT</i>
        </div>
      </section>

      <section className="home-section quick-start-section">
        <h2>Quick Start</h2>
        <p>Capture your first meeting or upload a recording to see Fireflies in action.</p>
        <div className="quick-start">
          <button type="button" onClick={openSchedule} className="quick pink" aria-label="Schedule Meeting"><CalendarDays size={20} /><span>Schedule Meeting</span><ChevronRight size={16} /></button>
          <Link href="/notebook/mine-shared?upload=1" className="quick mint" aria-label="Upload File"><Upload size={20} /><span>Upload File</span><ChevronRight size={16} /></Link>
          <button type="button" onClick={openCapture} className="quick lavender" aria-label="Capture Meeting"><Plus size={20} /><span>Capture Meeting</span><ChevronRight size={16} /></button>
        </div>
      </section>

      <section className="recent-section">
        <div className="recent-tabs"><button className="active">Recent</button><button onClick={() => showToast("Feature coming soon!")}>Upcoming</button><button onClick={() => showToast("Feature coming soon!")}>AI Feed</button></div>
        <button className="settings-link" onClick={() => showToast("Feature coming soon!")}><CalendarDays size={16} /> Settings</button>
        <div className="recent-list">
          {meetings.length ? meetings.map((meeting) => (
            <Link href={`/meeting/${meeting.id}`} key={meeting.id} className="recent-row">
              <FirefliesMark size={22} />
              <span><strong>{meeting.title}</strong><small>{formatDate(meeting.meeting_date)}</small></span>
            </Link>
          )) : <div className="meeting-skeleton"><i /><i /><i /></div>}
        </div>
      </section>

      <section className="home-section try-more">
        <h2>Try More</h2>
        <div className="try-grid">
          <article>
            <Monitor size={23} />
            <h3>Desktop App</h3>
            <p>Capture conversations without any bot present in your meeting.</p>
            <button className="purple-button" onClick={() => showToast("Feature coming soon!")}><Download size={16} /> Download</button>
          </article>
          <article>
            <Smartphone size={23} />
            <h3>Mobile App</h3>
            <p>Record in-person conversations and review meetings on the go.</p>
            <div className="store-buttons">
              <button onClick={() => showToast("Feature coming soon!")} aria-label="Get Fireflies iOS app" title="App Store"><Apple size={18} fill="currentColor" /></button>
              <button onClick={() => showToast("Feature coming soon!")} aria-label="Get Fireflies Android app" title="Google Play"><Play size={17} fill="currentColor" /></button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
