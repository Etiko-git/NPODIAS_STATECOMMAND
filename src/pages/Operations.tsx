import AuditTrail from "../components/AuditTrail";

export default function Operations() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel p-4">
        <div className="text-xl font-extrabold">Operations</div>
        <div className="mt-2 text-np-muted text-sm">Shift coordination, dispatch actions, and audit reconciliation.</div>
      </div>
      <AuditTrail />
    </div>
  );
}
