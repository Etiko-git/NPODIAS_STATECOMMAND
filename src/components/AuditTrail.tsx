import { useStore } from "../state/store";

function fmt(ts: number) { return new Date(ts).toLocaleString(); }

export default function AuditTrail() {
  const audit = useStore((s) => s.audit);
  return (
    <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel overflow-hidden">
      <div className="px-4 py-3 border-b border-np-border font-bold">Audit Trail (State Command)</div>
      <div className="p-3 space-y-2 max-h-[520px] overflow-auto">
        {audit.map((a) => (
          <div key={a.id} className="rounded-lg border border-np-border bg-[#0A1F1C] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">
                  {a.action} {a.entity ? <span className="text-np-muted text-xs">· {a.entity}</span> : null}
                </div>
                <div className="text-xs text-np-muted mt-1">{a.detail}</div>
                <div className="text-xs text-np-muted mt-1">
                  Actor: <span className="font-semibold">{a.actor}</span> · {a.role}
                </div>
              </div>
              <div className="text-xs text-np-muted">{fmt(a.ts)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
