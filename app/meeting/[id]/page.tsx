import { AppShell } from "@/components/app-shell";
import { MeetingDetailView } from "@/components/meeting-detail";

export const runtime = 'edge';

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell title="Meeting"><MeetingDetailView id={Number(id)} /></AppShell>;
}
