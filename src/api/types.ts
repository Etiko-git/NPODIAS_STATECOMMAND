export type ApiError = {
  code: string;
  message: string;
  status?: number;
  retryable?: boolean;
};

export type CoreConfig = {
  baseUrl: string;
  token: string;
  timeoutMs?: number;
};

export type OfficerStatus = "ON_DUTY" | "OFF_DUTY" | "SUSPENDED";

export type Officer = {
  id: string; // NPODIAS ID
  name: string;
  rank: string;
  badgeId: string;
  unit: string;
  division: string;
  status: OfficerStatus;
  certified: boolean;
};

export type Incident = {
  id: string;
  title: string;
  location: string;
  minutesAgo: number;
  severity: "GREEN" | "AMBER" | "RED";
  assignedOfficerId?: string;
};

export type SyncHealth = "OK" | "DEGRADED" | "OFFLINE";

export type SyncState = {
  health: SyncHealth;
  message: string;
  lastSyncTs: number;
};

export type AuditAction =
  | "LOGIN"
  | "VERIFY_OFFICER"
  | "SUSPEND_OFFICER"
  | "ASSIGN_TO_INCIDENT"
  | "EXPORT_REPORT"
  | "SYNC_STATUS_CHANGE";

export type AuditLog = {
  id: string;
  ts: number;
  actor: string;
  role: string;
  action: AuditAction;
  entity?: string;
  detail: string;
};
