export type AlertLevel = "LOW" | "ELEVATED" | "HIGH";
export type SyncHealth = "OK" | "DEGRADED" | "OFFLINE";

export type OfficerStatus = "ON_DUTY" | "OFF_DUTY" | "SUSPENDED";

export type Officer = {
  id: string;
  name: string;
  rank: string;
  badgeId: string;
  unit: string;
  division: string;
  status: OfficerStatus;
  certified: boolean;
  photoUrl?: string;
};

export type Incident = {
  id: string;
  title: string;
  location: string;
  minutesAgo: number;
  severity: "GREEN" | "AMBER" | "RED";
  assignedOfficerId?: string;
};

export type CommandSnapshot = {
  state: "Lagos";
  personnelOnDuty: number;
  incidentsToday: number;
  alertLevel: AlertLevel;
  unitsDeployed: number;
};

export type UnitCounts = {
  ON_DUTY: number;
  DISPATCHED: number;
  AVAILABLE: number;
  UNAVAILABLE: number;
};

export type SyncState = {
  health: SyncHealth;
  lastSyncTs: number;
  message: string;
};

export type AuditAction =
  | "LOGIN"
  | "VERIFY_OFFICER"
  | "SUSPEND_OFFICER"
  | "ASSIGN_TO_INCIDENT"
  | "EXPORT_REPORT"
  | "SYNC_STATUS_CHANGE"
  | "QUEUE_REPLAY";

export type AuditLog = {
  id: string;
  ts: number;
  actor: string;
  role: string;
  action: AuditAction;
  entity?: string;
  detail: string;
};
