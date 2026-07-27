"use client";

import { ArrowUp, CalendarDays, CheckCheck, Layers3, ListChecks, Mic, Plus, Sparkles, WandSparkles } from "lucide-react";
import { FormEvent, useState } from "react";

const suggestions = [
  ["List my action items & todos for this week", CheckCheck],
  ["Summarize my last meeting", ListChecks],
  ["Prepare me for the upcoming meeting", WandSparkles],
  ["Connect Gmail, Notion, and 30+ sources for richer insights.", Layers3],
  ["Prepare weekly digest, based on my meetings", CalendarDays],
] as const;

export function FredView() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "fred"; text: string }[]>([]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) return;
    const text = prompt.trim();
    setMessages((items) => [...items, { role: "user", text }, { role: "fred", text: "I found 5 meetings related to that request. Open a meeting to inspect its summary, transcript, and action items." }]);
    setPrompt("");
  }

  return (
    <div className="fred-page">
      {!messages.length ? (
        <div className="fred-welcome">
          <h1>Hi Aryan, how can I help today?</h1>
          <FredComposer prompt={prompt} setPrompt={setPrompt} submit={submit} />
          <div className="fred-suggestions">
            {suggestions.map(([text, Icon]) => <button key={text} onClick={() => setPrompt(text)}><Icon size={16} />{text}</button>)}
          </div>
        </div>
      ) : (
        <div className="fred-chat">
          <div className="message-list">
            {messages.map((message, index) => <div className={`message ${message.role}`} key={index}><strong>{message.role === "user" ? "You" : "AskFred"}</strong><p>{message.text}</p></div>)}
          </div>
          <FredComposer prompt={prompt} setPrompt={setPrompt} submit={submit} />
        </div>
      )}
      <small className="credit-note">Consumes AI credits</small>
    </div>
  );
}

function FredComposer({ prompt, setPrompt, submit }: { prompt: string; setPrompt: (value: string) => void; submit: (event: FormEvent) => void }) {
  return (
    <form className="fred-composer" onSubmit={submit}>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask anything, @ for context and / for skills" rows={2} />
      <div className="composer-tools">
        <span><button type="button" aria-label="Add"><Plus size={20} /></button><button type="button" aria-label="Sources"><Layers3 size={18} /></button></span>
        <span><button type="button" className="model-button">Sonnet 4.6 (Auto)⌄</button><button type="button" aria-label="Dictate"><Mic size={19} /></button><button className="send-button" aria-label="Send"><ArrowUp size={19} /></button></span>
      </div>
    </form>
  );
}
