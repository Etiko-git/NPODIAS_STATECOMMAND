import type { AuditLog, Incident, Officer } from "./types";

function rid(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}`.toUpperCase();
}

type Db = {
  officers: Officer[];
  incidents: Incident[];
  audit: AuditLog[];
  syncHealth: "OK" | "DEGRADED" | "OFFLINE";
};

const db: Db = {
  officers: [
    { id: "NPODIAS-LAG-037921", name: "Det. Ibrahim Balogun", rank: "Detective", badgeId: "37921", unit: "Bravo-16", division: "Ikeja Division", status: "ON_DUTY", certified: true },
    { id: "NPODIAS-LAG-012884", name: "Sgt. T. Adebayo", rank: "Sergeant", badgeId: "12884", unit: "Alpha-04", division: "Apapa Wharf", status: "ON_DUTY", certified: true },
    { id: "NPODIAS-LAG-045110", name: "Cpl. N. Okafor", rank: "Corporal", badgeId: "45110", unit: "Charlie-09", division: "Ikorodu", status: "ON_DUTY", certified: false }
  ],
  incidents: [
    { id: "INC-001", title: "Armed Robbery", location: "Ikeja GRA", minutesAgo: 2, severity: "RED" },
    { id: "INC-002", title: "Fire Outbreak", location: "Apapa Wharf", minutesAgo: 6, severity: "AMBER" },
    { id: "INC-003", title: "Kidnapping Report", location: "Ikorodu Road", minutesAgo: 8, severity: "AMBER" },
    { id: "INC-004", title: "Traffic Accident", location: "Third Mainland Bridge", minutesAgo: 10, severity: "GREEN" }
  ],
  audit: [
    { id: rid("AUD"), ts: Date.now() - 1000 * 60 * 18, actor: "L. Lawal", role: "COMMISSIONER", action: "LOGIN", detail: "Session established (Lagos State Command)" }
  ],
  syncHealth: "OK"
};

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export const MockBackend = {
  async getBootstrap() {
    await sleep(250);
    return {
      officers: db.officers,
      incidents: db.incidents,
      audit: db.audit,
      syncHealth: db.syncHealth
    };
  },

  async verifyOfficer(actor: { name: string; role: string }, officerId: string) {
    await sleep(350);
    db.officers = db.officers.map((o) => (o.id === officerId ? { ...o, certified: true } : o));
    db.audit = [
      { id: rid("AUD"), ts: Date.now(), actor: actor.name, role: actor.role, action: "VERIFY_OFFICER", entity: officerId, detail: "Officer verified by State Command (mock sync to National Core)" },
      ...db.audit
    ];
    return { ok: true };
  },

  async suspendOfficer(actor: { name: string; role: string }, officerId: string, reason: string, supervisorCode: string) {
    await sleep(450);
    db.officers = db.officers.map((o) => (o.id === officerId ? { ...o, status: "SUSPENDED", certified: false } : o));
    db.audit = [
      { id: rid("AUD"), ts: Date.now(), actor: actor.name, role: actor.role, action: "SUSPEND_OFFICER", entity: officerId, detail: `Officer suspended: ${reason} (Auth: ${supervisorCode})` },
      ...db.audit
    ];
    return { ok: true };
  },

  async assignIncident(actor: { name: string; role: string }, incidentId: string, officerId: string) {
    await sleep(300);
    db.incidents = db.incidents.map((i) => (i.id === incidentId ? { ...i, assignedOfficerId: officerId } : i));
    db.audit = [
      { id: rid("AUD"), ts: Date.now(), actor: actor.name, role: actor.role, action: "ASSIGN_TO_INCIDENT", entity: incidentId, detail: `Assigned officer ${officerId} to ${incidentId}` },
      ...db.audit
    ];
    return { ok: true };
  },

  async exportReport(actor: { name: string; role: string }, reportName: string) {
    await sleep(150);
    db.audit = [
      { id: rid("AUD"), ts: Date.now(), actor: actor.name, role: actor.role, action: "EXPORT_REPORT", detail: `Exported: ${reportName}` },
      ...db.audit
    ];
    return { ok: true };
  },

  // simulate live updates
  tick() {
    db.incidents = db.incidents.map((i) => ({ ...i, minutesAgo: i.minutesAgo + 1 }));
    if (Math.random() < 0.30) {
      const titles = ["Armed Robbery", "Kidnapping Report", "Fire Outbreak", "Traffic Accident"];
      const locs = ["Ikeja", "Apapa", "Lekki", "Ikorodu", "Victoria Island"];
      const sevs: Array<Incident["severity"]> = ["GREEN", "AMBER", "RED"];
      const inc: Incident = {
        id: `INC-${Math.floor(Math.random() * 9000 + 1000)}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        location: locs[Math.floor(Math.random() * locs.length)],
        minutesAgo: 0,
        severity: sevs[Math.floor(Math.random() * sevs.length)]
      };
      db.incidents = [inc, ...db.incidents].slice(0, 25);
    }
    // occasional sync degradation
    const r = Math.random();
    if (r > 0.985) db.syncHealth = "OFFLINE";
    else if (r > 0.96) db.syncHealth = "DEGRADED";
    else if (r < 0.70) db.syncHealth = "OK";
  }
};
