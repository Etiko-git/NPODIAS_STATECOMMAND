import type { Incident } from "../api/types";
import Badge from "./Badge";

function icon(sev: Incident["severity"]) {
  if (sev === "RED") return "⛔";
  if (sev === "AMBER") return "⚠️";
  return "✅";
}

function tone(sev: Incident["severity"]) {
  if (sev === "RED") return "red";
  if (sev === "AMBER") return "amber";
  return "green";
}

export default function AlertsPanel({ incidents, onAssign, busy }: { incidents: Incident[]; onAssign: (incidentId: string) => void; busy?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 border-b border-np-border">
        <div className="font-bold">Incident Alerts</div>
        <Badge tone="neutral">Auto-classified</Badge>
      </div>

      <div className="p-3 space-y-2">
        {incidents.map((i) => (
          <div key={i.id} className="rounded-lg border border-np-border bg-[#0A1F1C] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  <span>{icon(i.severity)}</span>
                  <span>{i.title}</span>
                  <Badge tone={tone(i.severity) as any}>{i.severity}</Badge>
                </div>
                <div className="text-xs text-np-muted mt-1">{i.location}</div>
              </div>
              <div className="text-xs text-np-muted">{i.minutesAgo} mins ago</div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-xs text-np-muted">Assigned: {i.assignedOfficerId ? "Yes" : "No"}</div>
              <button
                onClick={() => onAssign(i.id)}
                disabled={busy}
                className="px-3 py-1.5 rounded-md border border-[#1E4C44] bg-[#0B241F] hover:bg-[#0E2F29] text-sm font-semibold disabled:opacity-50"
              >
                Assign selected officer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
