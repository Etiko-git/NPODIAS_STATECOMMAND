import type { CoreConfig, Officer, Incident, AuditLog } from "./types";
import { coreRequest } from "./client";

export type Bootstrap = {
  officers: Officer[];
  incidents: Incident[];
  audit: AuditLog[];
  syncHealth: "OK" | "DEGRADED" | "OFFLINE";
};

export const CoreServices = {
  bootstrap(cfg: CoreConfig, actor: { name: string; role: string }) {
    return coreRequest<Bootstrap>(cfg, "/state/bootstrap", {
      method: "GET",
      headers: { "X-Actor": `${actor.name}|${actor.role}` }
    });
  },

  verifyOfficer(cfg: CoreConfig, actor: { name: string; role: string }, officerId: string) {
    return coreRequest<{ ok: true }>(cfg, `/state/officers/${encodeURIComponent(officerId)}/verify`, {
      method: "POST",
      headers: { "X-Actor": `${actor.name}|${actor.role}` }
    });
  },

  suspendOfficer(cfg: CoreConfig, actor: { name: string; role: string }, officerId: string, reason: string, supervisorCode: string) {
    return coreRequest<{ ok: true }>(cfg, `/state/officers/${encodeURIComponent(officerId)}/suspend`, {
      method: "POST",
      headers: { "X-Actor": `${actor.name}|${actor.role}` },
      body: JSON.stringify({ reason, supervisorCode })
    });
  },

  assignIncident(cfg: CoreConfig, actor: { name: string; role: string }, incidentId: string, officerId: string) {
    return coreRequest<{ ok: true }>(cfg, `/state/incidents/${encodeURIComponent(incidentId)}/assign`, {
      method: "POST",
      headers: { "X-Actor": `${actor.name}|${actor.role}` },
      body: JSON.stringify({ officerId })
    });
  },

  exportReport(cfg: CoreConfig, actor: { name: string; role: string }, name: string) {
    return coreRequest<{ ok: true }>(cfg, "/state/reports/export", {
      method: "POST",
      headers: { "X-Actor": `${actor.name}|${actor.role}` },
      body: JSON.stringify({ name })
    });
  }
};
