import type { Officer } from "../api/types";
import ConfirmSuspendModal from "./ConfirmSuspendModal";
import Badge from "./Badge";
import { useState } from "react";

export default function OfficerCard({
  officer,
  canAct,
  busy,
  onVerify,
  onSuspend
}: {
  officer?: Officer;
  canAct: boolean;
  busy?: boolean;
  onVerify: () => void;
  onSuspend: (reason: string, supervisorCode: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (!officer) return <div className="p-4 text-np-muted">Select an officer.</div>;

  return (
    <div>
      <div className="px-4 py-3 border-b border-np-border font-bold flex items-center justify-between">
        <span>Officer Details</span>
        <Badge tone={officer.certified ? "green" : "amber"}>{officer.certified ? "Certified" : "Pending"}</Badge>
      </div>

      <div className="p-4">
        <div className="flex gap-4">
          <div className="h-24 w-24 rounded-xl border border-np-border bg-[#0A1F1C] grid place-items-center text-np-muted text-xs">
            PHOTO
          </div>

          <div className="flex-1">
            <div className="text-lg font-extrabold">{officer.name}</div>
            <div className="text-xs text-np-muted">{officer.rank}</div>

            <div className="mt-2 space-y-1 text-sm">
              <Row k="Badge ID" v={officer.badgeId} />
              <Row k="NPODIAS ID" v={officer.id} />
              <Row k="Status" v={officer.status} />
              <Row k="Unit" v={officer.unit} />
              <Row k="Division" v={officer.division} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            disabled={!canAct || busy}
            onClick={onVerify}
            className="px-3 py-2 rounded-lg border border-np-green bg-[#0B241F] hover:bg-[#0E2F29] font-semibold disabled:opacity-50"
          >
            Quick Verify
          </button>
          <button
            disabled={!canAct || busy}
            onClick={() => setOpen(true)}
            className="px-3 py-2 rounded-lg border border-[#7F1D1D] bg-[#3B0A0A] hover:bg-[#4A0C0C] font-semibold disabled:opacity-50"
          >
            Close / Suspend
          </button>
        </div>

        <div className="mt-3 text-xs text-np-muted">State action syncs to National Core audit ledger (integration-ready).</div>
      </div>

      <ConfirmSuspendModal
        open={open}
        officerName={officer.name}
        onCancel={() => setOpen(false)}
        onConfirm={(reason, supervisorCode) => {
          setOpen(false);
          onSuspend(reason, supervisorCode);
        }}
      />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-np-muted">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}
