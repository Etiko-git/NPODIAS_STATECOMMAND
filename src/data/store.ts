import { create } from "zustand";
import type { AuditLog, CommandSnapshot, Incident, Officer, SyncState, UnitCounts } from "./types";
import { seedAudit, seedIncidents, seedOfficers, seedSnapshot, seedSync, seedUnits } from "./seed";
import { dequeueMany, enqueue, loadQueue } from "./offlineQueue";

type Role = "COMMISSIONER" | "DUTY_OFFICER" | "AUDITOR";

export type Session = {
  userName: string;
  role: Role;
};

type State = {
  session: Session | null;

  sync: SyncState;
  audit: AuditLog[];
  queueCount: number;

  snapshot: CommandSnapshot;
  units: UnitCounts;
  officers: Officer[];
  incidents: Incident[];

  selectedOfficerId: string | null;

  login: (userName: string, role: Role) => void;
  logout: () => void;

  selectOfficer: (id: string) => void;

  verifyOfficer: (id: string) => void;
  suspendOfficer: (id: string, reason: string, supervisorCode: string) => void;

  assignToIncident: (incidentId: string, officerId: string) => void;

  exportReport: (name: string) => void;

  tick: () => void;
  replayQueue: () => Promise<void>;
};

function rid(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}`.toUpperCase();
}

function shouldQueue(syncHealth: SyncState["health"]) {
  return syncHealth === "OFFLINE";
}

export const useStore = create<State>((set, get) => ({
  session: { userName: "L. Lawal", role: "COMMISSIONER" },

  sync: seedSync,
  audit: seedAudit,
  queueCount: loadQueue().length,

  snapshot: seedSnapshot,
  units: seedUnits,
  officers: seedOfficers,
  incidents: seedIncidents,

  selectedOfficerId: seedOfficers[0]?.id ?? null,

  login: (userName, role) => {
    set({ session: { userName, role } });
    set((s) => ({
      audit: [
        { id: rid("AUD"), ts: Date.now(), actor: userName, role, action: "LOGIN", detail: "Session established (Lagos State Command)" },
        ...s.audit
      ]
    }));
  },

  logout: () => set({ session: null }),

  selectOfficer: (id) => set({ selectedOfficerId: id }),

  verifyOfficer: (oid) => {
    const { session, sync } = get();
    if (!session) return;

    if (shouldQueue(sync.health)) {
      enqueue({ type: "VERIFY", officerId: oid, ts: Date.now() });
      set({ queueCount: loadQueue().length });
    }

    set((s) => ({
      officers: s.officers.map((o) => (o.id === oid ? { ...o, certified: true } : o)),
      audit: [
        {
          id: rid("AUD"),
          ts: Date.now(),
          actor: session.userName,
          role: session.role,
          action: "VERIFY_OFFICER",
          entity: oid,
          detail: "Officer verified by State Command (sync to National Core)"
        },
        ...s.audit
      ]
    }));
  },

  suspendOfficer: (oid, reason, supervisorCode) => {
    const { session, sync } = get();
    if (!session) return;

    if (shouldQueue(sync.health)) {
      enqueue({ type: "SUSPEND", officerId: oid, reason, supervisorCode, ts: Date.now() });
      set({ queueCount: loadQueue().length });
    }

    set((s) => ({
      officers: s.officers.map((o) => (o.id === oid ? { ...o, status: "SUSPENDED", certified: false } : o)),
      audit: [
        {
          id: rid("AUD"),
          ts: Date.now(),
          actor: session.userName,
          role: session.role,
          action: "SUSPEND_OFFICER",
          entity: oid,
          detail: `Officer suspended: ${reason} (Auth: ${supervisorCode})`
        },
        ...s.audit
      ]
    }));
  },

  assignToIncident: (incidentId, officerId) => {
    const { session, sync } = get();
    if (!session) return;

    if (shouldQueue(sync.health)) {
      enqueue({ type: "ASSIGN", incidentId, officerId, ts: Date.now() });
      set({ queueCount: loadQueue().length });
    }

    set((s) => ({
      incidents: s.incidents.map((inc) => (inc.id === incidentId ? { ...inc, assignedOfficerId: officerId } : inc)),
      audit: [
        {
          id: rid("AUD"),
          ts: Date.now(),
          actor: session.userName,
          role: session.role,
          action: "ASSIGN_TO_INCIDENT",
          entity: incidentId,
          detail: `Assigned officer ${officerId} to ${incidentId}`
        },
        ...s.audit
      ]
    }));
  },

  exportReport: (name) => {
    const { session } = get();
    if (!session) return;
    set((s) => ({
      audit: [
        { id: rid("AUD"), ts: Date.now(), actor: session.userName, role: session.role, action: "EXPORT_REPORT", detail: `Exported: ${name}` },
        ...s.audit
      ]
    }));
  },

  replayQueue: async () => {
    const { sync, session } = get();
    if (sync.health !== "OK") return;
    if (!session) return;

    const batch = dequeueMany(10);
    if (batch.take.length === 0) return;

    set({ queueCount: batch.rest.length });
    set((s) => ({
      audit: [
        { id: rid("AUD"), ts: Date.now(), actor: session.userName, role: session.role, action: "QUEUE_REPLAY", detail: `Replayed ${batch.take.length} queued actions to National Core` },
        ...s.audit
      ]
    }));
  },

  tick: () => {
    const { incidents, snapshot, sync, session } = get();

    set({ incidents: incidents.map((i) => ({ ...i, minutesAgo: i.minutesAgo + 1 })) });

    set({
      snapshot: {
        ...snapshot,
        personnelOnDuty: Math.max(3000, snapshot.personnelOnDuty + (Math.random() > 0.5 ? 1 : -1)),
        unitsDeployed: Math.max(30, snapshot.unitsDeployed + (Math.random() > 0.75 ? 1 : 0))
      }
    });

    if (Math.random() < 0.35) {
      const titles = ["Armed Robbery", "Kidnapping Report", "Fire Outbreak", "Traffic Accident"];
      const locs = ["Ikeja GRA", "Apapa Wharf", "Third Mainland Bridge", "Ikorodu Road", "Lekki Phase 1"];
      const sevs: Array<Incident["severity"]> = ["GREEN", "AMBER", "RED"];
      const inc: Incident = {
        id: `INC-${Math.floor(Math.random() * 9000 + 1000)}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        location: locs[Math.floor(Math.random() * locs.length)],
        minutesAgo: 0,
        severity: sevs[Math.floor(Math.random() * sevs.length)]
      };
      set((s) => ({ incidents: [inc, ...s.incidents], snapshot: { ...s.snapshot, incidentsToday: s.snapshot.incidentsToday + 1 } }));
    }

    const r = Math.random();
    let next = sync.health;
    let msg = sync.message;

    if (r > 0.985) { next = "OFFLINE"; msg = "National Core sync unavailable (queued actions)"; }
    else if (r > 0.96) { next = "DEGRADED"; msg = "National Core sync degraded (retrying)"; }
    else if (r < 0.60) { next = "OK"; msg = "Connected to NPODIAS National Core"; }

    if (next !== sync.health) {
      set((s) => ({
        sync: { health: next, message: msg, lastSyncTs: Date.now() },
        audit: [
          {
            id: rid("AUD"),
            ts: Date.now(),
            actor: session?.userName ?? "system",
            role: session?.role ?? "SYSTEM",
            action: "SYNC_STATUS_CHANGE",
            detail: msg
          },
          ...s.audit
        ]
      }));
      if (next === "OK") { get().replayQueue().catch(() => {}); }
    } else {
      set({ sync: { ...sync, lastSyncTs: Date.now() } });
    }
  }
}));
