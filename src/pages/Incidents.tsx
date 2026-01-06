import { toast } from "sonner";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import { useStore } from "../state/store";
import { canWrite } from "../state/rbac";

function sevTone(sev: string) {
  if (sev === "RED") return "red";
  if (sev === "AMBER") return "amber";
  return "green";
}

export default function Incidents() {
  const incidents = useStore((s) => s.incidents);
  const selectedOfficerId = useStore((s) => s.selectedOfficerId);
  const session = useStore((s) => s.session);
  const busy = useStore((s) => s.busy);

  const writable = session ? canWrite(session.role) : false;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel p-4">
        <div className="text-xl font-extrabold">Incidents (Lagos Live)</div>
        <div className="mt-2 text-np-muted text-sm">Dispatch and assignment are state-controlled; audit syncs to National Core.</div>
        <div className="text-xs text-np-muted mt-2">
          Selected officer for assignment: <span className="font-semibold">{selectedOfficerId ?? "None"}</span>
        </div>
      </div>

      <DataTable
        rows={incidents}
        searchPlaceholder="Search by incident type, location, code…"
        columns={[
          { key: "title", header: "Incident", cell: (i: any) => <span className="font-semibold">{i.title}</span> },
          { key: "location", header: "Location", cell: (i: any) => <span>{i.location}</span> },
          { key: "sev", header: "Severity", cell: (i: any) => <Badge tone={sevTone(i.severity) as any}>{i.severity}</Badge> },
          { key: "mins", header: "Age", cell: (i: any) => <span className="text-np-muted">{i.minutesAgo} mins</span> },
          { key: "assigned", header: "Assigned", cell: (i: any) => <span className="text-xs text-np-muted">{i.assignedOfficerId ? `Yes (${i.assignedOfficerId})` : "No"}</span> },
          {
            key: "action",
            header: "Action",
            cell: (i: any) => (
              <button
                disabled={!writable || busy.assign}
                onClick={async () => {
                  if (!writable) return toast.error("Read-only role.");
                  if (!selectedOfficerId) return toast.error("Select an officer on Dashboard first.");
                  try {
                    await useStore.getState().assignToIncident(i.id, selectedOfficerId);
                    toast.success("Assigned selected officer to incident.");
                  } catch (e: any) {
                    toast.error(e?.message ?? "Assignment failed.");
                  }
                }}
                className="px-3 py-1.5 rounded-md border border-[#1E4C44] bg-[#0B241F] hover:bg-[#0E2F29] text-xs font-semibold disabled:opacity-50"
              >
                Assign selected officer
              </button>
            )
          }
        ]}
      />
    </div>
  );
}
