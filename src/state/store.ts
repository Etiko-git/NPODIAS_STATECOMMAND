import { create } from "zustand";
import type { AuditLog, Incident, Officer, SyncState } from "../api/types";
import { CoreServices } from "../api/services";
import { getCoreConfig } from "../api/config";

type Role = "COMMISSIONER" | "DUTY_OFFICER" | "AUDITOR";

export type Session = { userName: string; role: Role };

type Units = { ON_DUTY: number; DISPATCHED: number; AVAILABLE: number; UNAVAILABLE: number };

type Snapshot = { personnelOnDuty: number; incidentsToday: number; alertLevel: "LOW" | "ELEVATED" | "HIGH"; unitsDeployed: number };

type Busy = {
  bootstrap: boolean;
  verify: boolean;
  suspend: boolean;
  assign: boolean;
  export: boolean;
};

type State = {
  session: Session | null;

  sync: SyncState;
  audit: AuditLog[];
  queueCount: number;

  snapshot: Snapshot;
  units: Units;

  officers: Officer[];
  incidents: Incident[];
  selectedOfficerId: string | null;

  busy: Busy;
  errorBanner: string | null;

  login: (userName: string, role: Role) => void;
  logout: () => void;

  bootstrap: () => Promise<void>;
  tick: () => Promise<void>;

  selectOfficer: (id: string) => void;

  verifyOfficer: (id: string) => Promise<void>;
  suspendOfficer: (id: string, reason: string, supervisorCode: string) => Promise<void>;
  assignToIncident: (incidentId: string, officerId: string) => Promise<void>;
  exportReport: (name: string) => Promise<void>;
};

function nowSync(health: SyncState["health"]): SyncState {
  const msg =
    health === "OK" ? "Connected to NPODIAS National Core"
    : health === "DEGRADED" ? "National Core sync degraded (retrying)"
    : "National Core sync unavailable (queued actions)";
  return { health, message: msg, lastSyncTs: Date.now() };
}

export const useStore = create<State>((set, get) => ({
  session: { userName: "L. Lawal", role: "COMMISSIONER" },

  sync: nowSync("OK"),
  audit: [],
  queueCount: 0,

  snapshot: { personnelOnDuty: 3240, incidentsToday: 21, alertLevel: "HIGH", unitsDeployed: 46 },
  units: { ON_DUTY: 42, DISPATCHED: 11, AVAILABLE: 6, UNAVAILABLE: 3 },

  officers: [],
  incidents: [],
  selectedOfficerId: null,

  busy: { bootstrap: false, verify: false, suspend: false, assign: false, export: false },
  errorBanner: null,

  login: (userName, role) => set({ session: { userName, role } }),
  logout: () => set({ session: null }),

  bootstrap: async () => {
    const session = get().session;
    if (!session) return;
    set((s) => ({ busy: { ...s.busy, bootstrap: true }, errorBanner: null }));
    try {
      const cfg = getCoreConfig();
      const boot = await CoreServices.bootstrap(cfg, { name: session.userName, role: session.role });
      set({
        officers: boot.officers,
        incidents: boot.incidents,
        audit: boot.audit,
        sync: nowSync(boot.syncHealth),
        selectedOfficerId: boot.officers[0]?.id ?? null
      });
    } catch (e: any) {
      set({ errorBanner: e?.message ?? "Failed to load command center data." });
    } finally {
      set((s) => ({ busy: { ...s.busy, bootstrap: false } }));
    }
  },

  tick: async () => {
    // For mock:// mode, we simulate server ticks by re-bootstraping
    const session = get().session;
    if (!session) return;
    try {
      const cfg = getCoreConfig();
      const boot = await CoreServices.bootstrap(cfg, { name: session.userName, role: session.role });
      set({
        incidents: boot.incidents,
        audit: boot.audit,
        sync: nowSync(boot.syncHealth),
        snapshot: { ...get().snapshot, incidentsToday: Math.max(get().snapshot.incidentsToday, boot.incidents.length) }
      });
    } catch {
      // keep last state
    }
  },

  selectOfficer: (id) => set({ selectedOfficerId: id }),

  verifyOfficer: async (id) => {
    const session = get().session;
    if (!session) return;
    set((s) => ({ busy: { ...s.busy, verify: true }, errorBanner: null }));
    try {
      const cfg = getCoreConfig();
      await CoreServices.verifyOfficer(cfg, { name: session.userName, role: session.role }, id);
      await get().bootstrap();
    } catch (e: any) {
      set({ errorBanner: e?.message ?? "Verification failed." });
      throw e;
    } finally {
      set((s) => ({ busy: { ...s.busy, verify: false } }));
    }
  },

  suspendOfficer: async (id, reason, supervisorCode) => {
    const session = get().session;
    if (!session) return;
    set((s) => ({ busy: { ...s.busy, suspend: true }, errorBanner: null }));
    try {
      const cfg = getCoreConfig();
      await CoreServices.suspendOfficer(cfg, { name: session.userName, role: session.role }, id, reason, supervisorCode);
      await get().bootstrap();
    } catch (e: any) {
      set({ errorBanner: e?.message ?? "Suspension failed." });
      throw e;
    } finally {
      set((s) => ({ busy: { ...s.busy, suspend: false } }));
    }
  },

  assignToIncident: async (incidentId, officerId) => {
    const session = get().session;
    if (!session) return;
    set((s) => ({ busy: { ...s.busy, assign: true }, errorBanner: null }));
    try {
      const cfg = getCoreConfig();
      await CoreServices.assignIncident(cfg, { name: session.userName, role: session.role }, incidentId, officerId);
      await get().bootstrap();
    } catch (e: any) {
      set({ errorBanner: e?.message ?? "Assignment failed." });
      throw e;
    } finally {
      set((s) => ({ busy: { ...s.busy, assign: false } }));
    }
  },

  exportReport: async (name) => {
    const session = get().session;
    if (!session) return;
    set((s) => ({ busy: { ...s.busy, export: true }, errorBanner: null }));
    try {
      const cfg = getCoreConfig();
      await CoreServices.exportReport(cfg, { name: session.userName, role: session.role }, name);
      await get().bootstrap();
    } catch (e: any) {
      set({ errorBanner: e?.message ?? "Export failed." });
      throw e;
    } finally {
      set((s) => ({ busy: { ...s.busy, export: false } }));
    }
  }
}));
