"use client";

import {
  Bell,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Gift,
  Laptop,
  Layers3,
  LogOut,
  Menu,
  MonitorUp,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Video,
  X,
  Info,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, FormEvent, ReactNode, useContext, useEffect, useState } from "react";
import { FirefliesMark, FredMark } from "./brand";
import {
  HomeIcon,
  AskFredIcon,
  MeetingsIcon,
  TasksIcon,
  IntegrationsIcon,
  AnalyticsIcon,
  VoiceAgentsIcon,
  AISkillsIcon,
  UpgradeIcon,
  SettingsIcon,
} from "./custom-icons";

const nav = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "AskFred", href: "/ask-fred", icon: AskFredIcon, shortcut: "Ctrl + J" },
  { label: "Meetings", href: "/notebook/mine-shared", icon: MeetingsIcon },
  { label: "Tasks", href: "/welcome/tasks", icon: TasksIcon },
  { label: "AI Skills", href: "/skills", icon: AISkillsIcon },
  { label: "Analytics", href: "/analytics", icon: AnalyticsIcon },
  { label: "Voice Agents", href: "/agents", icon: VoiceAgentsIcon, badge: "NEW" },
  { label: "Upgrade", href: "/upgrade", icon: UpgradeIcon, badge: "40% OFF" },
];

type ShellActions = {
  openCapture: () => void;
  openSchedule: () => void;
  showToast: (message: string) => void;
};

const ShellActionsContext = createContext<ShellActions | null>(null);

export function useShellActions() {
  const value = useContext(ShellActionsContext);
  if (!value) throw new Error("useShellActions must be used inside AppShell");
  return value;
}

type DialogName = "capture" | "schedule" | null;

export function AppShell({
  title,
  children,
  secondary,
  banner = true,
}: {
  title: string;
  children: ReactNode;
  secondary?: ReactNode;
  banner?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [railExpanded, setRailExpanded] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(banner);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogName>(null);
  const [search, setSearch] = useState("");
  const [meetingName, setMeetingName] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingLanguage, setMeetingLanguage] = useState("English (Global)");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setDialog(null);
  }, [pathname]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setDialog(null);
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (search.trim()) router.push(`/notebook/mine-shared?q=${encodeURIComponent(search.trim())}`);
  }

  function submitCapture(event: FormEvent) {
    event.preventDefault();
    const link = meetingLink.trim();
    if (!link) return;
    const params = new URLSearchParams({ capture: "1", link, language: meetingLanguage });
    if (meetingName.trim()) params.set("name", meetingName.trim());
    setDialog(null);
    router.push(`/notebook/mine-shared?${params.toString()}`);
  }

  const openCapture = () => {
    setProfileOpen(false);
    setDialog("capture");
  };
  const openSchedule = () => {
    setProfileOpen(false);
    setDialog("schedule");
  };

  return (
    <ShellActionsContext.Provider value={{ openCapture, openSchedule, showToast }}>
      <div className={`app-frame ${bannerOpen ? "has-banner" : ""} ${railExpanded ? "rail-expanded" : ""}`}>
        {bannerOpen && (
          <div className="trial-banner">
            <span>You are eligible for 7 days business plan free trial.</span>
            <button>Start free trial <span aria-hidden>→</span></button>
            <button className="banner-close icon-button" onClick={() => setBannerOpen(false)} aria-label="Dismiss banner">
              <X size={16} />
            </button>
          </div>
        )}

        <aside className={`icon-rail ${mobileOpen ? "open" : ""}`}>
          <div className="rail-brand-row">
            {railExpanded ? (
              <Link href="/" className="rail-logo" aria-label="Home">
                <FirefliesMark size={24} />
                <span className="rail-wordmark">fireflies.ai</span>
              </Link>
            ) : (
              <button className="avatar-button" onClick={() => setProfileOpen((value) => !value)} aria-label="Profile" aria-expanded={profileOpen} style={{ width: 28, height: 28, fontSize: 12 }}>AT</button>
            )}
            <button className="rail-toggle" onClick={() => setRailExpanded((value) => !value)} aria-label={railExpanded ? "Collapse sidebar" : "Expand sidebar"}>
              {railExpanded ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
            </button>
          </div>

          {railExpanded && (
            <div className="rail-profile-expanded" style={{ padding: "0 16px 12px", borderBottom: "1px solid var(--border)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <button className="avatar-button" onClick={() => setProfileOpen((value) => !value)} aria-label="Profile" aria-expanded={profileOpen} style={{ width: 28, height: 28, fontSize: 12 }}>AT</button>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Aryan Tyagi</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Free Plan</span>
              </div>
            </div>
          )}

          <nav className="rail-nav">
            {nav.map(({ label, href, icon: Icon, shortcut, badge }, index) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);
              const outOfScope = ["/welcome/tasks", "/skills", "/analytics", "/agents", "/upgrade", "/integrations", "/status"].includes(href);
              
              if (outOfScope) {
                return (
                  <button key={label} onClick={() => showToast("Feature coming soon!")} className={`rail-link ${active ? "active" : ""}`} aria-label={label} title={railExpanded ? undefined : label}>
                    <Icon width={20} height={20} />
                    <span className="rail-label">{label}</span>
                    {shortcut && <kbd>{shortcut}</kbd>}
                    {badge && label === "Upgrade" && railExpanded ? (
                      <span className="rail-badge" style={{ background: "#e2fbe8", color: "#008a2e", padding: "0 6px", border: "1px solid #bdf1c9", fontSize: "10px", marginLeft: "auto", borderRadius: "10px", fontWeight: 600 }}>{badge}</span>
                    ) : badge && railExpanded ? (
                      <i className="rail-badge">{badge}</i>
                    ) : null}
                  </button>
                );
              }

              return (
                <Link key={label} href={href} className={`rail-link ${active ? "active" : ""}`} aria-label={label} title={railExpanded ? undefined : label}>
                  <Icon width={20} height={20} />
                  <span className="rail-label">{label}</span>
                  {shortcut && <kbd>{shortcut}</kbd>}
                  {badge && label === "Upgrade" && railExpanded ? (
                    <span className="rail-badge" style={{ background: "#e2fbe8", color: "#008a2e", padding: "0 6px", border: "1px solid #bdf1c9", fontSize: "10px", marginLeft: "auto", borderRadius: "10px", fontWeight: 600 }}>{badge}</span>
                  ) : badge && railExpanded ? (
                    <i className="rail-badge">{badge}</i>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="rail-bottom">
            <button onClick={() => showToast("Feature coming soon!")} className={`rail-link ${pathname.startsWith("/integrations") ? "active" : ""}`} aria-label="Integrations" title={railExpanded ? undefined : "Integrations"}>
              <IntegrationsIcon width={20} height={20} />
              <span className="rail-label">Integrations</span>
            </button>
            <button onClick={() => showToast("Feature coming soon!")} className="rail-link" aria-label="Settings">
              <SettingsIcon width={20} height={20} />
              <span className="rail-label">Settings</span>
            </button>
          </div>
        </aside>

        <button className="mobile-menu icon-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {secondary && <aside className="secondary-nav">{secondary}</aside>}

        <header className="topbar">
          <strong className="page-label">{title}</strong>
          <form className="global-search" onSubmit={submitSearch}>
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title or keyword" aria-label="Global search" />
            <kbd>Ctrl + K</kbd>
          </form>
          <div className="top-actions">
            <button className="upgrade-button" onClick={() => showToast("Feature coming soon!")}>Upgrade</button>
            <button className="icon-button top-icon notification" aria-label="Notifications"><Bell size={19} /><i /></button>
            <div className="capture-group">
              <button className="capture-button" onClick={openCapture}><Video size={17} /><span>Capture</span></button>
              <button className="capture-more" onClick={openCapture} aria-label="Capture options"><ChevronDown size={15} /></button>
            </div>
          </div>
        </header>

        {profileOpen && (
          <>
            <button className="popover-scrim" aria-label="Close profile menu" onClick={() => setProfileOpen(false)} />
            <div className="profile-menu" role="menu">
              <section className="profile-overview">
                <div className="profile-identity"><span>AT</span><div><strong>Hi Aryan</strong><small>aryantyagi0504@gmail.com</small></div></div>
                <div className="plan-row"><span>Free</span><strong>Unlimited meetings</strong></div>
                <div className="storage-row"><span>Storage</span><small>0 / 400 mins</small><i><b /></i></div>
                <nav>
                  <button onClick={() => showToast("Feature coming soon!")}><Gift size={17} /> Refer and Earn $5</button>
                  <button onClick={() => showToast("Feature coming soon!")}><Settings size={17} /> Settings</button>
                  <button onClick={() => showToast("Feature coming soon!")}><Laptop size={17} /> Manage Devices</button>
                  <button onClick={() => showToast("Feature coming soon!")}><ShieldCheck size={17} /> Platform Rules</button>
                  <button onClick={() => showToast("Feature coming soon!")}><LogOut size={17} /> Logout</button>
                </nav>
              </section>
              <section className="profile-apps">
                <article><div><UserRound size={18} /><span><strong>Mobile App</strong><small>Transcribe and summarize in-person conversations with mobile app.</small></span></div></article>
                <article><div><ExternalLink size={18} /><span><strong>Chrome Extension</strong><small>Record and transcribe Google Meet calls without Fireflies notetaker bot.</small></span></div><button onClick={() => showToast("Feature coming soon!")}>Install</button></article>
                <button className="desktop-download" onClick={() => showToast("Feature coming soon!")}><Laptop size={17} /> Download Fireflies Desktop App</button>
              </section>
            </div>
          </>
        )}

        <main className={`app-main ${secondary ? "with-secondary" : ""}`}>{children}</main>
        <button className="help-bubble" aria-label="Help"><CircleHelp size={24} /></button>

        {dialog === "schedule" && (
          <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}>
            <section className="schedule-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-title">
              <button className="modal-close" onClick={() => setDialog(null)} aria-label="Close"><X size={18} /></button>
              <h2 id="schedule-title">Schedule Meeting</h2>
              <p>Your AI Notetaker will be invited to the calendar meeting to record, transcribe and summarize.</p>
              <a href="https://calendar.google.com/calendar/u/0/r/eventedit" target="_blank" rel="noreferrer"><CalendarDays size={18} /> Google Calendar</a>
              <a href="https://outlook.live.com/calendar/0/deeplink/compose" target="_blank" rel="noreferrer"><CalendarDays size={18} /> Microsoft Outlook</a>
            </section>
          </div>
        )}

        {dialog === "capture" && (
          <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}>
            <form className="capture-dialog" role="dialog" aria-modal="true" aria-labelledby="capture-title" onSubmit={submitCapture}>
              <button type="button" className="modal-close" onClick={() => setDialog(null)} aria-label="Close"><X size={18} /></button>
              <h2 id="capture-title">Add to live meeting</h2>
              <label>Name your meeting <span>(Optional)</span><input value={meetingName} onChange={(event) => setMeetingName(event.target.value)} /></label>
              <div className="meeting-link-group">
                <label htmlFor="meeting-link">Meeting link</label>
                <p>Capture meetings from GMeet, Zoom, MS teams, and <button type="button">more.</button></p>
                <div className="meeting-link-field"><Video size={18} /><input id="meeting-link" type="url" required placeholder="Paste meeting link" value={meetingLink} onChange={(event) => setMeetingLink(event.target.value)} /></div>
              </div>
              <label>Meeting language<select value={meetingLanguage} onChange={(event) => setMeetingLanguage(event.target.value)}><option>English (Global)</option><option>English (US)</option><option>English (UK)</option><option>Hindi</option><option>Spanish</option></select></label>
              <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="primary-button">Start Capturing</button></div>
            </form>
          </div>
        )}

        {toast && (
          <div className="toast-message">
            <Info size={16} />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </ShellActionsContext.Provider>
  );
}

export function MeetingsNav() {
  return (
    <>
      <div className="secondary-title"><span>Meetings</span></div>
      <div className="channel-search"><Search size={16} /><input placeholder="Search channels" /></div>
      <nav className="secondary-links">
        <Link className="active" href="/notebook/mine-shared"><span>#</span> My Meetings</Link>
        <Link href="/notebook/mine-shared"><MonitorUp size={17} /> All Meetings</Link>
        <Link href="/notebook/mine-shared"><Bot size={17} /> Voice Agent Meetings</Link>
      </nav>
      <div className="channels-box">
        <p>All channels</p>
        <span className="channel-hash">#</span>
        <strong>Create channels to organize your conversations</strong>
        <button><span>+</span> Channel</button>
      </div>
    </>
  );
}

export function FredNav() {
  return (
    <>
      <div className="secondary-title"><span>AskFred</span></div>
      <nav className="secondary-links fred-links">
        <button><span>+</span> New Chat</button>
        <button><Search size={17} /> Search</button>
        <button><Layers3 size={17} /> Connectors</button>
      </nav>
      <div className="chat-empty">
        <div className="chat-skeleton"><i /><i /></div>
        <strong>No chats yet</strong>
        <p>Your chats will appear here once you start one.</p>
      </div>
    </>
  );
}
