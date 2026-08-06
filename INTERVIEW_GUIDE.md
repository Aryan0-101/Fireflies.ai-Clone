# Full Stack Developer Interview Guide: Fireflies Clone Project

This guide is designed to help you, as a student who built this project with the assistance of an AI agent, confidently navigate a technical interview. It covers how to discuss your approach, defend your technical decisions, and handle on-the-spot live coding requests.

---

## 1. Project Inception & Your Approach

**Q: What was your understanding of the task and what was required?**
> **Answer:** The goal was to build a 1:1 functional and visual clone of the Fireflies.ai meeting dashboard. It required replicating complex UI components (like the interactive transcript player, AskFred AI chat, and dynamic sidebars) while establishing a solid backend to serve mock meeting data. The task demanded both pixel-perfect frontend execution and a decoupled system design capable of handling future AI integrations.

**Q: How did you begin and how did you orchestrate the development?**
> **Answer:** I started by visually deconstructing the original Fireflies dashboard into modular layout components (App Shell, Topbar, Sidebar). Since I collaborated with an AI coding assistant (like Gemini/Cursor), my primary role was *Architecture and Orchestration*. I instructed the AI to first scaffold the Next.js App Router and establish the global CSS variable system. From there, we iteratively built the components. My workflow involved prompting the AI for component generation, reviewing and auditing the generated code, debugging deployment conflicts (like Cloudflare Edge environments), and manually refining the CSS to achieve exact pixel parity.

---

## 2. Technical Choices & Justifications

**Q: Why did you choose Next.js and FastAPI? Why not use Next.js Server Actions for everything?**
> **Answer:** 
> - **Next.js (App Router):** Chosen for its built-in routing, layout system, and seamless Edge deployment via Cloudflare. The UI is highly interactive, making React the perfect fit.
> - **FastAPI (Python):** While I could have used Next.js API routes, a product like Fireflies relies heavily on Audio processing, transcription, and LLM integrations. The Python ecosystem (OpenAI SDK, Whisper, LangChain) is far superior for these AI tasks. A dedicated FastAPI backend allows for heavy-lifting and background tasks without bogging down the Edge-optimized frontend server.

**Q: Why did you use Vanilla CSS instead of TailwindCSS?**
> **Answer:** To achieve a true 1:1 clone, Tailwind's predefined spacing and color scales would require too many arbitrary values (e.g., `w-[14px]`). Building a robust `globals.css` variable system (`--topbar`, `--purple`) gave me absolute control over the fluid layouts, calc() functions, and granular micro-interactions without fighting a framework.

---

## 3. What Works & What Doesn't (Honest Self-Reflection)

Interviewers appreciate developers who recognize the limitations of their own projects.

**What Works Exceptionally Well:**
- The structural UI, responsive sidebar, and Edge routing are flawless.
- The client-side filtering (`useMemo`) in the meeting library is instantaneous.
- The Jamstack separation of concerns between frontend (Cloudflare) and backend (Render).

**What Doesn't Work (Current Limitations):**
- **Authentication:** It's mocked. There's no real JWT validation or secure session management.
- **Global State:** UI state (like the sidebar toggles) is managed by standard React state and prop-drilled. This isn't scalable for a massive app.
- **Backend Latency:** Because the backend is hosted on Render's free tier, cold starts can take 50 seconds, which causes initial loading delays on the frontend.

---

## 4. System Design & Database Questions

**Q: Explain your database design.**
> **Answer:** Currently, it uses a lightweight SQLite database managed by SQLAlchemy. The core tables revolve around `Users`, `Meetings`, `Transcripts`, and `ActionItems`. A `Meeting` has a one-to-many relationship with `Transcripts` (each spoken utterance is a row with a timestamp, speaker, and text).

**Q: How would you scale this system design for a real launch?**
> **Answer:**
> 1. **Database:** Migrate SQLite to PostgreSQL to handle concurrent connections.
> 2. **Async Audio Processing:** Offload transcription to a background worker queue (like Celery + Redis). When a user uploads a video, the FastAPI server shouldn't block; it should put a job in Redis, and Celery should handle the heavy Whisper AI processing asynchronously.
> 3. **Frontend Cache:** Implement React Query (TanStack) in Next.js to handle data fetching, caching, and background invalidation instead of standard `useEffect` fetches.

---

## 5. Live Coding: Fixing "Obvious Flaws" On The Spot

If the interviewer asks you to live-code, they will likely target the structural flaws in the app to see if you can improve them. Here are the 3 most likely requests and exactly how to fix them in front of them:

### A. The "Prop Drilling" Flaw
**The Flaw:** Passing functions like `setProfileOpen` down through multiple component layers is considered messy.
**The Request:** *"Can you refactor this state to use React Context instead of prop drilling?"*
**How to fix it live:**
1. Create a new file `context/UIContext.tsx`.
2. Write a simple provider:
   ```tsx
   "use client";
   import { createContext, useContext, useState } from 'react';
   
   const UIContext = createContext<any>(null);
   
   export function UIProvider({ children }: { children: React.ReactNode }) {
     const [profileOpen, setProfileOpen] = useState(false);
     return <UIContext.Provider value={{ profileOpen, setProfileOpen }}>{children}</UIContext.Provider>;
   }
   
   export const useUI = () => useContext(UIContext);
   ```
3. Go to `app/layout.tsx` and wrap the `{children}` in `<UIProvider>`.
4. Go to your components, remove the props, and implement: `const { profileOpen, setProfileOpen } = useUI();`.

### B. The "Unoptimized Fetch" Flaw
**The Flaw:** Meetings are fetched inside a `useEffect` without an AbortController. If a user navigates away quickly before the fetch finishes, it can cause memory leaks or race conditions.
**The Request:** *"How do we prevent memory leaks on this fetch call?"*
**How to fix it live:**
1. Open `components/meetings-view.tsx`.
2. Modify the `useEffect` to include an abort signal:
   ```tsx
   useEffect(() => {
     const controller = new AbortController(); // 1. Create controller
     
     async function load() {
       try {
         // 2. Pass the signal to the fetch request
         const data = await request('/meetings', { signal: controller.signal });
         setMeetings(data);
       } catch (err: any) {
         if (err.name !== 'AbortError') console.error(err);
       }
     }
     load();
     
     // 3. Cleanup function aborts fetch if component unmounts
     return () => controller.abort(); 
   }, []);
   ```

### C. The "Hardcoded Magic Strings" Flaw
**The Flaw:** In `components/meetings-view.tsx`, the sort filter options (`"newest"`, `"oldest"`) are just raw strings, which is prone to typos.
**The Request:** *"Can you refactor these hardcoded strings into a proper TypeScript Enum to ensure type safety?"*
**How to fix it live:**
1. At the top of `meetings-view.tsx`, define the enum:
   ```tsx
   enum SortOrder {
     NEWEST = 'newest',
     OLDEST = 'oldest'
   }
   ```
2. Change the state definition to enforce the type:
   ```tsx
   const [sortBy, setSortBy] = useState<SortOrder>(SortOrder.NEWEST);
   ```
3. Go through the file and replace instances of `"oldest"` with `SortOrder.OLDEST`.
