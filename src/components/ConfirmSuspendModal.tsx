import { useState } from "react";
import Modal from "./Modal";

export default function ConfirmSuspendModal({
  open,
  officerName,
  onCancel,
  onConfirm
}: {
  open: boolean;
  officerName: string;
  onCancel: () => void;
  onConfirm: (reason: string, supervisorCode: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");

  return (
    <Modal open={open} title="Close / Suspend Officer" onClose={onCancel}>
      <div className="text-sm text-np-muted">
        You are about to suspend <span className="font-semibold text-np-text">{officerName}</span>.
        This action is audited and synced to NPODIAS National Core.
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs text-np-muted font-semibold">Suspension Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-lg border border-np-border bg-[#0A1F1C] px-3 py-2 text-sm min-h-[90px]"
            placeholder="e.g., Pending disciplinary review / impersonation alert / certification breach…"
          />
        </div>

        <div>
          <label className="text-xs text-np-muted font-semibold">Supervisor Authorization Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-np-border bg-[#0A1F1C] px-3 py-2 text-sm"
            placeholder="Enter supervisor code"
          />
          <div className="mt-1 text-[11px] text-np-muted">(In production: OTP / HSM-backed approval / duty roster authorization)</div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-np-border bg-[#0A1F1C] hover:bg-[#0B241F] font-semibold">
          Cancel
        </button>
        <button
          onClick={() => onConfirm(reason.trim(), code.trim())}
          disabled={reason.trim().length < 8 || code.trim().length < 4}
          className="px-4 py-2 rounded-lg border border-[#7F1D1D] bg-[#3B0A0A] hover:bg-[#4A0C0C] font-semibold disabled:opacity-50"
        >
          Confirm Suspension
        </button>
      </div>
    </Modal>
  );
}
