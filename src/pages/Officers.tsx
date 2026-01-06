import { Link } from "react-router-dom";
import { toast } from "sonner";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import { useStore } from "../state/store";
import { canWrite } from "../state/rbac";

export default function Officers() {
  const officers = useStore((s) => s.officers);
  const session = useStore((s) => s.session);
  const busy = useStore((s) => s.busy);

  const writable = session ? canWrite(session.role) : false;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-np-border bg-np-panel2 p-4 shadow-panel">
        <div className="text-xl font-extrabold">Officers Registry (Lagos)</div>
        <div className="mt-2 text-np-muted text-sm">State Command operational view — NPODIAS IDs are nationally unique.</div>
      </div>

      <DataTable
        rows={officers}
        searchPlaceholder="Search by name, unit, division, NPODIAS ID…"
        actionsRight={
          <button
            onClick={async () => {
              try {
                await useStore.getState().exportReport("Officers CSV");
                toast.success("Export logged (audit).");
              } catch (e: any) {
                toast.error(e?.message ?? "Export failed.");
              }
            }}
            disabled={busy.export}
            className="px-3 py-2 rounded-lg border border-[#1E4C44] bg-[#0B241F] hover:bg-[#0E2F29] text-sm font-semibold disabled:opacity-50"
          >
            Export Audit Entry
          </button>
        }
        columns={[
          {
            key: "name",
            header: "Officer",
            cell: (o: any) => (
              <div>
                <div className="font-semibold">{o.name}</div>
                <div className="text-xs text-np-muted">{o.rank}</div>
              </div>
            )
          },
          {
            key: "id",
            header: "NPODIAS ID",
            cell: (o: any) => (
              <Link to={`/officers/${encodeURIComponent(o.id)}`} className="font-semibold text-[#9AF2B5] hover:underline">
                {o.id}
              </Link>
            )
          },
          { key: "unit", header: "Unit", cell: (o: any) => <span className="font-semibold">{o.unit}</span> },
          { key: "division", header: "Division", cell: (o: any) => <span>{o.division}</span> },
          {
            key: "cert",
            header: "Certification",
            cell: (o: any) => <Badge tone={o.certified ? "green" : "amber"}>{o.certified ? "Certified" : "Pending"}</Badge>
          },
          {
            key: "actions",
            header: "Actions",
            cell: (o: any) => (
              <div className="flex gap-2">
                <button
                  disabled={!writable || busy.verify}
                  onClick={async () => {
                    if (!writable) return toast.error("Read-only role.");
                    try {
                      await useStore.getState().verifyOfficer(o.id);
                      toast.success("Officer verified.");
                    } catch (e: any) {
                      toast.error(e?.message ?? "Verification failed.");
                    }
                  }}
                  className="px-3 py-1.5 rounded-md border border-np-green bg-[#0B241F] hover:bg-[#0E2F29] text-xs font-semibold disabled:opacity-50"
                >
                  Verify
                </button>
                <Link to={`/officers/${encodeURIComponent(o.id)}`} className="px-3 py-1.5 rounded-md border border-[#7F1D1D] bg-[#3B0A0A] hover:bg-[#4A0C0C] text-xs font-semibold">
                  Review…
                </Link>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
