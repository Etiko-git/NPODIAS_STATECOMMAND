import { useMemo } from "react";
import { toast } from "sonner";
import KpiCard from "../components/KpiCard";
import LagosMap from "../components/LagosMap";
import AlertsPanel from "../components/AlertsPanel";
import UnitStatus from "../components/UnitStatus";
import OfficerCard from "../components/OfficerCard";
import Badge from "../components/Badge";
import { useStore } from "../state/store";
import { canWrite } from "../state/rbac";

export default function HomeDashboard() {
  const snapshot = useStore((s) => s.snapshot);
  const units = useStore((s) => s.units);
  const officers = useStore((s) => s.officers);
  const incidents = useStore((s) => s.incidents);
  const selectedOfficerId = useStore((s) => s.selectedOfficerId);
  const selectOfficer = useStore((s) => s.selectOfficer);
  const session = useStore((s) => s.session);
  const busy = useStore((s) => s.busy);
  const errorBanner = useStore((s) => s.errorBanner);

  const selectedOfficer = useMemo(
    () => officers.find((o) => o.id === selectedOfficerId) ?? officers[0],
    [officers, selectedOfficerId]
  );

  const writable = session ? canWrite(session.role) : false;

  return (
    <div className="space-y-4">
      {errorBanner && (
        <div className="rounded-xl border border-[#7F1D1D] bg-[#3B0A0A] px-4 py-3 text-sm">
          <div className="font-bold text-[#FCA5A5]">Action failed</div>
          <div className="text-[#FCA5A5]/90">{errorBanner}</div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-2xl font-extrabold">Lagos State Police Command Center</div>
          <div className="text-sm text-np-muted mt-1">
            State operations console · synced with NPODIAS National Core
          </div>
        </div>
        <Badge tone="neutral">Template: Lagos → All States</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiCard label="Personnel On Duty" value={snapshot.personnelOnDuty.toLocaleString()} tone="green" />
        <KpiCard label="Incidents Today" value={String(snapshot.incidentsToday)} tone="green" />
        <KpiCard label="Security Alert" value={snapshot.alertLevel} tone={snapshot.alertLevel === "HIGH" ? "red" : "amber"} />
        <KpiCard label="Units Deployed" value={String(snapshot.unitsDeployed)} tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-np-border">
              <div className="font-bold">Live Incident Map</div>
              <div className="text-xs text-np-muted">Ikeja · Apapa · Ikorodu · Lekki</div>
            </div>
            <LagosMap incidents={incidents} />
          </div>
        </div>

        <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel overflow-hidden">
          <AlertsPanel
            incidents={incidents.slice(0, 6)}
            busy={busy.assign}
            onAssign={async (incidentId) => {
              if (!writable) return toast.error("Read-only role: cannot assign.");
              if (!selectedOfficer) return toast.error("Select an officer first.");
              try {
                await useStore.getState().assignToIncident(incidentId, selectedOfficer.id);
                toast.success("Assigned to incident.");
              } catch (e: any) {
                toast.error(e?.message ?? "Assignment failed.");
              }
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel overflow-hidden">
          <UnitStatus units={units} />
        </div>

        <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel overflow-hidden">
          <div className="px-4 py-3 border-b border-np-border font-bold">Officer Roster</div>
          <div className="p-3 space-y-2">
            {officers.map((o) => (
              <button
                key={o.id}
                onClick={() => selectOfficer(o.id)}
                className={[
                  "w-full text-left rounded-lg border px-3 py-2",
                  o.id === selectedOfficer?.id
                    ? "border-[#2A6B5F] bg-[#0B241F]"
                    : "border-np-border bg-[#0A1F1C] hover:bg-[#0B241F]"
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{o.name}</div>
                    <div className="text-xs text-np-muted">{o.rank} · {o.unit} · {o.division}</div>
                  </div>
                  <Badge tone={o.certified ? "green" : "amber"}>{o.certified ? "Certified" : "Pending"}</Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-np-border bg-np-panel2 shadow-panel overflow-hidden">
          <OfficerCard
            officer={selectedOfficer}
            canAct={writable}
            busy={busy.verify || busy.suspend}
            onVerify={async () => {
              if (!writable) return toast.error("Read-only role: cannot verify.");
              if (!selectedOfficer) return;
              try {
                await useStore.getState().verifyOfficer(selectedOfficer.id);
                toast.success("Officer verified (synced to National Core).");
              } catch (e: any) {
                toast.error(e?.message ?? "Verification failed.");
              }
            }}
            onSuspend={async (reason, supervisorCode) => {
              if (!writable) return toast.error("Read-only role: cannot suspend.");
              if (!selectedOfficer) return;
              try {
                await useStore.getState().suspendOfficer(selectedOfficer.id, reason, supervisorCode);
                toast.success("Officer suspended (synced to National Core).");
              } catch (e: any) {
                toast.error(e?.message ?? "Suspension failed.");
              }
            }}
          />
        </div>
      </div>

      <div className="text-xs text-np-muted">All actions are logged to NPODIAS audit ledger · Lagos template for other State Commands.</div>
    </div>
  );
}
