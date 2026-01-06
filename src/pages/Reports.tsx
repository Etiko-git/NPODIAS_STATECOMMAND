import { toast } from "sonner";
import { useStore } from "../state/store";

export default function Reports() {
  const snapshot = useStore((s) => s.snapshot);
  const officers = useStore((s) => s.officers);
  const busy = useStore((s) => s.busy);

  const certified = officers.filter((o) => o.certified).length;
  const pending = Math.max(0, officers.length - certified);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel p-4">
        <div className="text-xl font-extrabold">Reports</div>
        <div className="mt-2 text-np-muted text-sm">SITREP exports for Governor briefings and National Core reconciliation.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Personnel on Duty" value={snapshot.personnelOnDuty.toLocaleString()} />
        <Card label="Certified Officers" value={String(certified)} />
        <Card label="Pending Certification" value={String(pending)} />
      </div>

      <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="font-bold">Export SITREP (Audit + API)</div>
          <div className="text-sm text-np-muted mt-1">Creates an auditable export event and pushes to National Core adapter.</div>
        </div>

        <button
          disabled={busy.export}
          onClick={async () => {
            try {
              await useStore.getState().exportReport("Lagos SITREP");
              toast.success("SITREP export logged and synced.");
            } catch (e: any) {
              toast.error(e?.message ?? "Export failed.");
            }
          }}
          className="px-4 py-2 rounded-lg border border-[#1E4C44] bg-[#0B241F] hover:bg-[#0E2F29] font-semibold disabled:opacity-50"
        >
          Export SITREP
        </button>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel p-4">
      <div className="text-sm text-np-muted font-semibold">{label}</div>
      <div className="text-3xl font-extrabold mt-1">{value}</div>
    </div>
  );
}
