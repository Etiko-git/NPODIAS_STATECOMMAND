import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../state/store";

export default function Login() {
  const [name, setName] = useState("L. Lawal");
  const [role, setRole] = useState<"COMMISSIONER" | "DUTY_OFFICER" | "AUDITOR">("COMMISSIONER");
  const login = useStore((s) => s.login);
  const bootstrap = useStore((s) => s.bootstrap);
  const nav = useNavigate();

  return (
    <div className="min-h-full bg-np-bg text-np-text grid place-items-center px-4">
      <div className="w-full max-w-md rounded-xl border border-np-border bg-np-panel shadow-panel p-6">
        <div className="text-2xl font-extrabold">NPODIAS · Lagos State Command</div>
        <div className="text-sm text-np-muted mt-1">Secure access (demo)</div>

        <div className="mt-5 space-y-3">
          <label className="block text-sm text-np-muted">Name</label>
          <input className="w-full rounded-lg border border-np-border bg-[#0A1F1C] px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />

          <label className="block text-sm text-np-muted mt-2">Role</label>
          <select className="w-full rounded-lg border border-np-border bg-[#0A1F1C] px-3 py-2" value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="COMMISSIONER">Commissioner</option>
            <option value="DUTY_OFFICER">Duty Officer</option>
            <option value="AUDITOR">Auditor (Read-only)</option>
          </select>

          <button
            onClick={async () => {
              login(name, role);
              await bootstrap().catch(() => {});
              nav("/home");
            }}
            className="mt-3 w-full rounded-lg border border-np-green bg-[#0B241F] hover:bg-[#0E2F29] px-3 py-2 font-semibold"
          >
            Enter Command Center
          </button>
        </div>

        <div className="mt-4 text-xs text-np-muted">
          Integration-ready: configure National Core endpoints in <code className="text-[#9AF2B5]">.env</code>.
        </div>
      </div>
    </div>
  );
}
