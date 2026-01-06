import { useStore } from "../state/store";
import { RoleLabel } from "../state/rbac";

function pill(health: "OK" | "DEGRADED" | "OFFLINE") {
  if (health === "OK") return "border-np-green bg-[#0B241F] text-[#9AF2B5]";
  if (health === "DEGRADED") return "border-[#8A6A19] bg-[#2A2108] text-[#FBD38D]";
  return "border-[#7F1D1D] bg-[#3B0A0A] text-[#FCA5A5]";
}

export default function TopBar() {
  const session = useStore((s) => s.session);
  const sync = useStore((s) => s.sync);
  const queue = useStore((s) => s.queueCount);

  return (
    <div className="px-4 py-3 border-b border-np-border bg-gradient-to-r from-[#0A3A32] via-[#0B2F2A] to-[#0A3A32]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-[#0F4A3F] border border-np-border grid place-items-center font-black">N</div>
          <div className="min-w-0">
            <div className="text-lg font-extrabold tracking-wide truncate">
              NPODIAS <span className="font-semibold text-np-muted">— Lagos State Command Center</span>
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-md border ${pill(sync.health)}`}>{sync.message}</span>
              <span className="text-xs text-np-muted">Federal Certification Authority Active</span>
              {queue > 0 && <span className="text-xs px-2 py-1 rounded-md border border-[#8A6A19] bg-[#2A2108] text-[#FBD38D]">{queue} queued</span>}
            </div>
          </div>
        </div>

        {session && (
          <div className="rounded-lg border border-np-border bg-np-panel2 px-3 py-2 text-sm shrink-0">
            <div className="font-semibold">{RoleLabel[session.role]}</div>
            <div className="text-xs text-np-muted">{session.userName}</div>
          </div>
        )}
      </div>
    </div>
  );
}
