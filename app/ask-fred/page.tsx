import { AppShell, FredNav } from "@/components/app-shell";
import { FredView } from "@/components/fred-view";

export default function AskFredPage() {
  return <AppShell title="AskFred" secondary={<FredNav />}><FredView /></AppShell>;
}
