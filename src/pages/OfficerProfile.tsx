import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import Badge from "../components/Badge";
import ConfirmSuspendModal from "../components/ConfirmSuspendModal";
import { useStore } from "../state/store";
import { canWrite } from "../state/rbac";

export default function OfficerProfile() {
  const { npodiasId } = useParams();
  const id = decodeURIComponent(npodiasId ?? "");
  const officers = useStore((s) => s.officers);
  const session = useStore((s) => s.session);
  const busy = useStore((s) => s.busy);
  const [open, setOpen] = useState(false);

  const writable = session ? canWrite(session.role) : false;

  const officer = useMemo(() => officers.find((o) => o.id === id), [officers, id]);

  if (!officer) {
    return (
      <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel p-6">
        <div className="text-xl font-extrabold">Officer not found</div>
        <div className="text-np-muted mt-2">NPODIAS ID: {id}</div>
        <Link className="text-[#9AF2B5] hover:underline mt-4 inline-block" to="/officers">Back to Officers</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-2xl font-extrabold">{officer.name}</div>
            <div className="text-np-muted text-sm">{officer.rank} · {officer.unit}</div>

            <div className="mt-3 grid gap-2 text-sm">
              <Row k="NPODIAS ID" v={officer.id} />
              <Row k="Badge ID" v={officer.badgeId} />
              <Row k="Division" v={officer.division} />
              <Row k="Status" v={officer.status} />
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[240px]">
            <Badge tone={officer.certified ? "green" : "amber"}>{officer.certified ? "Certified" : "Pending Certification"}</Badge>

            <button
              disabled={!writable || busy.verify}
              onClick={async () => {
                if (!writable) return toast.error("Read-only role.");
                try {
                  await useStore.getState().verifyOfficer(officer.id);
                  toast.success("Officer verified.");
                } catch (e: any) {
                  toast.error(e?.message ?? "Verification failed.");
                }
              }}
              className="px-4 py-2 rounded-lg border border-np-green bg-[#0B241F] hover:bg-[#0E2F29] font-semibold disabled:opacity-50"
            >
              Quick Verify
            </button>

            <button
              disabled={!writable || busy.suspend}
              onClick={() => setOpen(true)}
              className="px-4 py-2 rounded-lg border border-[#7F1D1D] bg-[#3B0A0A] hover:bg-[#4A0C0C] font-semibold disabled:opacity-50"
            >
              Close / Suspend
            </button>

            <Link className="text-[#9AF2B5] hover:underline text-sm mt-1" to="/officers">← Back to Officers</Link>
          </div>
        </div>

        <div className="mt-4 text-xs text-np-muted">Actions are audited and synchronized with NPODIAS National Core (via API adapter).</div>
      </div>

      <ConfirmSuspendModal
        open={open}
        officerName={officer.name}
        onCancel={() => setOpen(false)}
        onConfirm={async (reason, supervisorCode) => {
          if (!writable) return toast.error("Read-only role.");
          try {
            await useStore.getState().suspendOfficer(officer.id, reason, supervisorCode);
            toast.success("Officer suspended.");
            setOpen(false);
          } catch (e: any) {
            toast.error(e?.message ?? "Suspension failed.");
          }
        }}
      />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 rounded-lg border border-np-border bg-[#0A1F1C] px-3 py-2">
      <span className="text-np-muted">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}
