import { Suspense } from "react";
import { AppShell, MeetingsNav } from "@/components/app-shell";
import { MeetingsView } from "@/components/meetings-view";

export default function MeetingsPage() {
  return <AppShell title="Meetings" secondary={<MeetingsNav />}><Suspense><MeetingsView /></Suspense></AppShell>;
}
