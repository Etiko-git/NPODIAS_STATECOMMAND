import type { AuditLog, CommandSnapshot, Incident, Officer, SyncState, UnitCounts } from "./types";

export const seedSnapshot: CommandSnapshot = {
  state: "Lagos",
  personnelOnDuty: 3240,
  incidentsToday: 21,
  alertLevel: "HIGH",
  unitsDeployed: 46
};

export const seedUnits: UnitCounts = {
  ON_DUTY: 42,
  DISPATCHED: 11,
  AVAILABLE: 6,
  UNAVAILABLE: 3
};

export const seedOfficers: Officer[] = [
  { id: "NPODIAS-LAG-037921", name: "Det. Ibrahim Balogun", rank: "Detective", badgeId: "37921", unit: "Bravo-16", division: "Ikeja Division", status: "ON_DUTY", certified: true },
  { id: "NPODIAS-LAG-012884", name: "Sgt. T. Adebayo", rank: "Sergeant", badgeId: "12884", unit: "Alpha-04", division: "Apapa Wharf", status: "ON_DUTY", certified: true },
  { id: "NPODIAS-LAG-045110", name: "Cpl. N. Okafor", rank: "Corporal", badgeId: "45110", unit: "Charlie-09", division: "Ikorodu", status: "ON_DUTY", certified: false }
];

export const seedIncidents: Incident[] = [
  { id: "INC-001", title: "Armed Robbery", location: "Downtown, Code 21", minutesAgo: 2, severity: "RED" },
  { id: "INC-002", title: "Fire Outbreak", location: "Apapa Wharf", minutesAgo: 6, severity: "AMBER" },
  { id: "INC-003", title: "Kidnapping Report", location: "Ijede Road", minutesAgo: 8, severity: "AMBER" },
  { id: "INC-004", title: "Traffic Accident", location: "Third Mainland Bridge", minutesAgo: 10, severity: "GREEN" }
];

export const seedSync: SyncState = { health: "OK", lastSyncTs: Date.now(), message: "Connected to NPODIAS National Core" };

export const seedAudit: AuditLog[] = [
  { id: "AUD-001", ts: Date.now() - 1000 * 60 * 18, actor: "L. Lawal", role: "COMMISSIONER", action: "LOGIN", detail: "Session established (Lagos State Command)" }
];
